/**
 * Generated by `createschema miniapp.B2BAppPermission 'app:Relationship:B2BApp:PROTECT; key:Text'`
 */

const dayjs = require('dayjs')

const { makeLoggedInAdminClient, makeClient } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowGQLError,
    catchErrorFrom,
} = require('@open-condo/keystone/test.utils')

const { CONTEXT_FINISHED_STATUS } = require('@condo/domains/miniapp/constants')
const { PERMISSION_KEY_WRONG_FORMAT_ERROR } = require('@condo/domains/miniapp/constants')
const {
    B2BAppPermission,
    createTestB2BAppPermission,
    updateTestB2BAppPermission,
    generatePermissionKey,
    createTestB2BApp,
    createTestB2BAppContext,
    createTestB2BAppAccessRight,
} = require('@condo/domains/miniapp/utils/testSchema')
const { registerNewOrganization } = require('@condo/domains/organization/utils/testSchema')
const {
    makeClientWithNewRegisteredAndLoggedInUser,
    makeClientWithSupportUser,
    makeClientWithServiceUser,
} = require('@condo/domains/user/utils/testSchema')


describe('B2BAppPermission', () => {
    let admin
    let support
    let manager
    let serviceUser
    let anotherServiceUser
    let anonymous
    let app
    let anotherApp
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        anonymous = await makeClient()
        manager = await makeClientWithNewRegisteredAndLoggedInUser();

        [app] = await createTestB2BApp(support, { contextDefaultStatus: CONTEXT_FINISHED_STATUS })
        serviceUser = await makeClientWithServiceUser()
        await createTestB2BAppAccessRight(support, serviceUser.user, app);

        [anotherApp] = await createTestB2BApp(support)
        anotherServiceUser = await makeClientWithServiceUser()
        await createTestB2BAppAccessRight(support, anotherServiceUser.user, anotherApp)

        const [org] = await registerNewOrganization(manager)
        await createTestB2BAppContext(manager, app, org)
    })
    describe('CRUD tests', () => {
        describe('Create',  () =>  {
            let permission
            afterEach(async () => {
                if (permission) {
                    await updateTestB2BAppPermission(admin, permission.id, {
                        deletedAt: dayjs().toISOString(),
                    })
                    permission = undefined
                }
            })
            test('Admin can', async () => {
                [permission] = await createTestB2BAppPermission(admin, app)
                expect(permission).toBeDefined()
            })
            test('Support can', async () => {
                [permission] = await createTestB2BAppPermission(support, app)
                expect(permission).toBeDefined()
            })
            describe('App account', () => {
                test('Can for apps from B2BAccessRight', async () => {
                    [permission] = await createTestB2BAppPermission(serviceUser, app)
                    expect(permission).toBeDefined()
                })
                test('Cannot otherwise', async () => {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await createTestB2BAppPermission(anotherServiceUser, app)
                    })
                })
            })
            test('No one in the organization can, including the administrator', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestB2BAppPermission(manager, app)
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestB2BAppPermission(anonymous, app)
                })
            })
        })
        describe('Update', () => {
            let permission
            let key
            beforeAll(async () => {
                [permission] = await createTestB2BAppPermission(admin, app)
            })
            beforeEach(async () => {
                key = generatePermissionKey()
            })
            afterAll(async () => {
                await updateTestB2BAppPermission(admin, permission.id, {
                    deletedAt: dayjs().toISOString(),
                })
            })
            test('Admin can', async () => {
                const [updated] = await updateTestB2BAppPermission(admin, permission.id, {
                    key,
                })
                expect(updated).toHaveProperty('key', key)
            })
            test('Support  can', async () => {
                const [updated] = await updateTestB2BAppPermission(support, permission.id, {
                    key,
                })
                expect(updated).toHaveProperty('key', key)
            })
            describe('App account', () => {
                test('Can for apps from B2BAccessRight', async () => {
                    const [updated] = await updateTestB2BAppPermission(serviceUser, permission.id, {
                        key,
                    })
                    expect(updated).toHaveProperty('key', key)
                })
                test('Cannot otherwise', async () => {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestB2BAppPermission(anotherServiceUser, permission.id, {
                            key,
                        })
                    })
                })
            })
            test('No one in the organization can, including the administrator', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestB2BAppPermission(manager, permission.id, {
                        key,
                    })
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestB2BAppPermission(anonymous, permission.id, {
                        key,
                    })
                })
            })
        })
        describe('Read', () => {
            let permission
            beforeAll(async () => {
                [permission] = await createTestB2BAppPermission(admin, app)
            })
            afterAll(async () => {
                await updateTestB2BAppPermission(admin, permission.id, {
                    deletedAt: dayjs().toISOString(),
                })
            })
            test('Admin can read everything', async () => {
                const [readPermission] = await B2BAppPermission.getAll(admin, { id: permission.id })
                expect(readPermission).toHaveProperty('id')
            })
            test('Support can read everything', async () => {
                const [readPermission] = await B2BAppPermission.getAll(support, { id: permission.id })
                expect(readPermission).toHaveProperty('id')
            })
            describe('App account', () => {
                test('Can read items with accessed app', async () => {
                    const [readPermission] = await B2BAppPermission.getAll(serviceUser, { id: permission.id })
                    expect(readPermission).toHaveProperty('id')
                })
                test('Cannot otherwise', async () => {
                    const allPermissions = await B2BAppPermission.getAll(anotherServiceUser, { id: permission.id })
                    expect(allPermissions).toHaveLength(0)
                })
            })
            test('No one in the organization can, including the administrator', async () => {
                const allPermissions = await B2BAppPermission.getAll(manager, { id: permission.id })
                expect(allPermissions).toHaveLength(0)
            })
            test('Anonymous cannot read anything', async () => {
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await B2BAppPermission.getAll(anonymous, {})
                })
            })
        })
        describe('Delete', () => {
            let permission
            beforeEach(async () => {
                [permission] = await createTestB2BAppPermission(admin, app)
            })
            afterEach(async () => {
                if (permission) {
                    await updateTestB2BAppPermission(admin, permission.id, {
                        deletedAt: dayjs().toISOString(),
                    })
                    permission = undefined
                }
            })
            describe('Admin', () => {
                test('Can soft-delete', async () => {
                    const [deleted] = await updateTestB2BAppPermission(admin, permission.id, {
                        deletedAt: dayjs().toISOString(),
                    })
                    expect(deleted).toHaveProperty('deletedAt')
                    expect(deleted.deletedAt).not.toBeNull()
                    // Prevent re-deletion in afterEach
                    permission = undefined
                })
                test('Cannot hard-delete', async () => {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await B2BAppPermission.delete(admin, permission.id)
                    })
                })
            })
            describe('Support', () => {
                test('Can soft-delete', async () => {
                    const [deleted] = await updateTestB2BAppPermission(support, permission.id, {
                        deletedAt: dayjs().toISOString(),
                    })
                    expect(deleted).toHaveProperty('deletedAt')
                    expect(deleted.deletedAt).not.toBeNull()
                    // Prevent re-deletion in afterEach
                    permission = undefined
                })
                test('Cannot hard-delete', async () => {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await B2BAppPermission.delete(support, permission.id)
                    })
                })
            })
            describe('App account', () => {
                test('Can soft-delete items with accessed app', async () => {
                    const [deleted] = await updateTestB2BAppPermission(serviceUser, permission.id, {
                        deletedAt: dayjs().toISOString(),
                    })
                    expect(deleted).toHaveProperty('deletedAt')
                    expect(deleted.deletedAt).not.toBeNull()
                    // Prevent re-deletion in afterEach
                    permission = undefined
                })
                test('Can soft-delete items with other apps', async () => {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestB2BAppPermission(anotherServiceUser, permission.id, {
                            deletedAt: dayjs().toISOString(),
                        })
                    })
                })
                test('Cannot hard-delete', async () => {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await B2BAppPermission.delete(serviceUser, permission.id)
                    })
                })
            })
            describe('Organization employee', () => {
                test('Cannot soft-delete anything', async () => {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestB2BAppPermission(manager, permission.id, {
                            deletedAt: dayjs().toISOString(),
                        })
                    })
                })
                test('Cannot hard-delete anything', async () => {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await B2BAppPermission.delete(manager, permission.id)
                    })
                })
            })
            describe('Anonymous', () => {
                test('Cannot soft-delete anything', async () => {
                    await expectToThrowAuthenticationErrorToObj(async () => {
                        await updateTestB2BAppPermission(anonymous, permission.id, {
                            deletedAt: dayjs().toISOString(),
                        })
                    })
                })
                test('Cannot hard-delete anything', async () => {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await B2BAppPermission.delete(anonymous, permission.id)
                    })
                })
            })
        })
    })
    describe('Fields', () => {
        describe('app', () => {
            test('App field cannot be updated', async () => {
                const [permission] = await createTestB2BAppPermission(admin, app)
                expect(permission).toBeDefined()

                await catchErrorFrom(async () => {
                    await updateTestB2BAppPermission(admin, permission.id, {
                        app: { connect: { id: anotherApp.id } },
                    })
                }, (caught) => {
                    expect(caught.errors[0].message).toContain('Field "app" is not defined by type "B2BAppPermissionUpdateInput"')
                })

                // Cleanup
                await updateTestB2BAppPermission(admin, permission.id, {
                    deletedAt: dayjs().toISOString(),
                })
            })
        })
        describe('key',  () => {
            describe('Must follow OrganizationEmployeeRole rules', () => {
                let permission
                afterEach(async () => {
                    if (permission) {
                        await updateTestB2BAppPermission(admin, permission.id, {
                            deletedAt: dayjs().toISOString(),
                        })

                        permission = undefined
                    }
                })
                describe('Must be created and updated with valid data', () => {
                    const validCases = [
                        'canManagePasses',
                        'canOpenDoors',
                        'canReadPrivateData',
                    ]
                    test.each(validCases)('%p', async (key) => {
                        [permission] = await createTestB2BAppPermission(admin, app, {
                            key,
                        })
                        expect(permission).toHaveProperty('key', key)

                        const idx = validCases.indexOf(key)
                        const nextKey = validCases[(idx + 1) % validCases.length]

                        const [updated] = await updateTestB2BAppPermission(admin, permission.id, {
                            key: nextKey,
                        })
                        expect(updated).toHaveProperty('key', nextKey)
                    })
                })
                describe('Must not be created or updated with invalid data', () => {
                    const invalidCases = [
                        ['Not starting with can', 'isAdmin'],
                        ['Not in lowerCamelCase (kebab)', 'can-kebab-case'],
                        ['Not in lowerCamelCase (UpperCamel)', 'CanReadBooks'],
                        ['Not in lowerCamelCase (all lower)', 'canreadbooks'],
                    ]
                    test.each(invalidCases)('%p', async (_, key) => {
                        await expectToThrowGQLError(async () => {
                            await createTestB2BAppPermission(admin, app, {
                                key,
                            })
                        }, {
                            code: 'BAD_USER_INPUT',
                            type: PERMISSION_KEY_WRONG_FORMAT_ERROR,
                        });
                        [permission] = await createTestB2BAppPermission(admin, app)
                        await expectToThrowGQLError(async () => {
                            await updateTestB2BAppPermission(admin, permission.id, {
                                key,
                            })
                        }, {
                            code: 'BAD_USER_INPUT',
                            type: PERMISSION_KEY_WRONG_FORMAT_ERROR,
                        })
                    })
                })
            })
            test('Must be unique within a single app', async () => {
                const key = generatePermissionKey()
                const [permission] = await createTestB2BAppPermission(admin, app, {
                    key,
                })
                expect(permission).toHaveProperty('key', key)

                const [anotherAppPermission] = await createTestB2BAppPermission(admin, anotherApp, {
                    key,
                })
                expect(anotherAppPermission).toHaveProperty('key', key)

                await catchErrorFrom(async () => {
                    await createTestB2BAppPermission(admin, app, {
                        key,
                    })
                }, (caught) => {
                    expect(caught.errors[0].message).toContain('duplicate key value violates unique constraint "b2bAppPermission_unique_key_app"')
                })

                const [softDeleted] = await updateTestB2BAppPermission(admin, permission.id, {
                    deletedAt: dayjs().toISOString(),
                })
                expect(softDeleted).toHaveProperty('deletedAt')
                expect(softDeleted.deletedAt).not.toBeNull()

                const [newPermission] = await createTestB2BAppPermission(admin, app, {
                    key,
                })
                expect(newPermission).toHaveProperty('key', key)

                // Cleanup
                await updateTestB2BAppPermission(admin, newPermission.id, {
                    deletedAt: dayjs().toISOString(),
                })
            })
        })
    })
})