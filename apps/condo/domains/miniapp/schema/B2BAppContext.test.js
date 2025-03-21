/**
 * Generated by `createschema miniapp.B2BAppContext 'integration:Relationship:B2BApp:PROTECT; organization:Relationship:Organization:PROTECT; settings:Json; state:Json;'`
 */

const dayjs = require('dayjs')

const { makeLoggedInAdminClient, makeClient } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowGraphQLRequestError,
} = require('@open-condo/keystone/test.utils')
const { catchErrorFrom } = require('@open-condo/keystone/test.utils')

const { CONTEXT_STATUSES } = require('@condo/domains/miniapp/constants')
const {
    ACCESS_RIGHT_SET_MAX_ITEMS_SCOPED_TYPE,
} = require('@condo/domains/miniapp/constants')
const {
    createTestB2BApp,
    createTestB2BAppContext,
    updateTestB2BAppContext,
    B2BAppContext, createTestB2BAppAccessRightSet, createTestB2BAppAccessRight, createTestB2BAccessToken,
    B2BAccessTokenReadonly,
} = require('@condo/domains/miniapp/utils/testSchema')
const { createTestOrganizationEmployeeRole, createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { registerNewOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const {
    makeClientWithSupportUser,
    makeClientWithNewRegisteredAndLoggedInUser,
    registerNewServiceUserByTestClient,
} = require('@condo/domains/user/utils/testSchema')

describe('B2BAppContext', () => {
    describe('CRUD', () => {
        let admin
        let support
        let anonymous
        let user
        beforeAll(async () => {
            admin = await makeLoggedInAdminClient()
            support = await makeClientWithSupportUser()
            anonymous = await makeClient()
            user = await makeClientWithNewRegisteredAndLoggedInUser()
        })
        describe('Create', () => {
            let app
            let organization
            beforeEach(async () => {
                [organization] = await registerNewOrganization(user)
                const [newApp] = await createTestB2BApp(admin)
                app = newApp

            })
            test('Admin can', async () => {
                const [context] = await createTestB2BAppContext(admin, app, organization)
                expect(context).toBeDefined()
                expect(context).toHaveProperty(['organization', 'id'], organization.id)
                expect(context).toHaveProperty(['app', 'id'], app.id)
            })
            test('Support can', async () => {
                const [context] = await createTestB2BAppContext(support, app, organization)
                expect(context).toBeDefined()
                expect(context).toHaveProperty(['organization', 'id'], organization.id)
                expect(context).toHaveProperty(['app', 'id'], app.id)
            })
            describe('User', () => {
                test('Employee with canManageB2BApps can', async () => {
                    const client = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                        canManageB2BApps: true,
                    })
                    await createTestOrganizationEmployee(admin, organization, client.user, role, {
                        isAccepted: true,
                    })
                    const [context] = await createTestB2BAppContext(client, app, organization)
                    expect(context).toBeDefined()
                    expect(context).toHaveProperty(['organization', 'id'], organization.id)
                    expect(context).toHaveProperty(['app', 'id'], app.id)
                })
                test('Cannot in other cases', async () => {
                    const client = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                    await createTestOrganizationEmployee(admin, organization, client.user, role, {
                        isAccepted: true,
                    })
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await createTestB2BAppContext(client, app, organization)
                    })
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestB2BAppContext(anonymous, app, organization)
                })
            })
        })
        describe('Read', () => {
            let context
            let organization
            beforeAll(async () => {
                const [app] = await createTestB2BApp(admin)
                const [org] = await registerNewOrganization(admin)
                const [appContext] = await createTestB2BAppContext(admin, app, org)
                organization = org
                context = appContext
            })
            test('Admin can', async () => {
                const contexts = await B2BAppContext.getAll(admin, {
                    id: context.id,
                })
                expect(contexts).toBeDefined()
                expect(contexts).toHaveLength(1)
                expect(contexts[0]).toHaveProperty('id', context.id)
            })
            test('Support can', async () => {
                const contexts = await B2BAppContext.getAll(support, {
                    id: context.id,
                })
                expect(contexts).toBeDefined()
                expect(contexts).toHaveLength(1)
                expect(contexts[0]).toHaveProperty('id', context.id)
            })
            describe('User', () => {
                test('Employee can read context of organization', async () => {
                    const client = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                    await createTestOrganizationEmployee(admin, organization, client.user, role)
                    const contexts = await B2BAppContext.getAll(client, {
                        id: context.id,
                    })
                    expect(contexts).toBeDefined()
                    expect(contexts).toHaveLength(1)
                    expect(contexts[0]).toHaveProperty('id', context.id)
                })
                test('Cannot in other cases', async () => {
                    const client = await makeClientWithNewRegisteredAndLoggedInUser()
                    const contexts = await B2BAppContext.getAll(client, {
                        id: context.id,
                    })
                    expect(contexts).toBeDefined()
                    expect(contexts).toHaveLength(0)
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await B2BAppContext.getAll(anonymous, {
                        id: context.id,
                    })
                })
            })
        })
        describe('Update', () => {
            let context
            let organization
            beforeEach(async () => {
                [organization] = await registerNewOrganization(admin)
                const [app] = await createTestB2BApp(admin)
                const [appContext] = await createTestB2BAppContext(admin, app, organization)
                context = appContext
            })
            test('Admin can', async () => {
                const [newContext] = await updateTestB2BAppContext(admin, context.id, {
                    deletedAt: dayjs().toISOString(),
                })
                expect(newContext).toBeDefined()
                expect(newContext).toHaveProperty(['deletedAt'])
                expect(newContext.deletedAt).not.toBeNull()
            })
            test('Support can', async () => {
                const [newContext] = await updateTestB2BAppContext(support, context.id, {
                    deletedAt: dayjs().toISOString(),
                })
                expect(newContext).toBeDefined()
                expect(newContext).toHaveProperty(['deletedAt'])
                expect(newContext.deletedAt).not.toBeNull()
            })
            test('User cannot', async () => {
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageB2BApps: true,
                })
                await createTestOrganizationEmployee(admin, organization, user.user, role, {
                    isAccepted: true,
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestB2BAppContext(user, context.id, {
                        deletedAt: dayjs().toISOString(),
                    })
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestB2BAppContext(user, context.id, {
                        deletedAt: dayjs().toISOString(),
                    })
                })
            })
        })
        describe('Delete', () => {
            let context
            let organization
            beforeAll(async () => {
                [organization] = await registerNewOrganization(admin)
                const [app] = await createTestB2BApp(admin)
                const [appContext] = await createTestB2BAppContext(admin, app, organization)
                context = appContext
            })
            test('Nobody can', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2BAppContext.delete(admin, context.id)
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2BAppContext.delete(support, context.id)
                })
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageB2BApps: true,
                })
                await createTestOrganizationEmployee(admin, organization, user.user, role, {
                    isAccepted: true,
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2BAppContext.delete(user, context.id)
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2BAppContext.delete(anonymous, context.id)
                })
            })
        })
    })
    describe('Validations', () => {
        describe('Must resolve default status on create if not specified',  () => {
            let organization
            let admin
            beforeAll(async () => {
                const adminClient = await makeLoggedInAdminClient()
                admin = adminClient
                const [org] = await registerNewOrganization(adminClient)
                organization = org
            })
            test.each(CONTEXT_STATUSES)('%p', async (status) => {
                const [app] = await createTestB2BApp(admin, {
                    contextDefaultStatus: status,
                })
                const [context] = await createTestB2BAppContext(admin, app, organization)
                expect(context).toBeDefined()
                expect(context).toHaveProperty('status', status)
            })
        })
        test('Organization and app fields cannot be changed', async () => {
            const admin = await makeLoggedInAdminClient()
            const [app] = await createTestB2BApp(admin)
            const [organization] = await registerNewOrganization(admin)
            const [context] = await createTestB2BAppContext(admin, app, organization)
            const [secondOrganization] = await registerNewOrganization(admin)
            const [secondApp] = await createTestB2BApp(admin)
            await expectToThrowGraphQLRequestError(async () => {
                await updateTestB2BAppContext(admin, context.id, {
                    organization: { connect: { id: secondOrganization.id  } },
                })
            }, 'Field "organization" is not defined')
            await expectToThrowGraphQLRequestError(async () =>{
                await updateTestB2BAppContext(admin, context.id, {
                    app: { connect: { id: secondApp.id } },
                })
            }, 'Field "app" is not defined')
        })
    })
    describe('Constraints', () => {
        test('Unique: organization + app', async () => {
            const admin = await makeLoggedInAdminClient()
            const [app] = await createTestB2BApp(admin)
            const [organization] = await registerNewOrganization(admin)
            const [context] = await createTestB2BAppContext(admin, app, organization)
            expect(context).toBeDefined()
            // TODO(pahaz): DOMA-10368 use
            await catchErrorFrom(async () => {
                await createTestB2BAppContext(admin, app, organization)
            }, ({ errors }) => {
                expect(errors).toHaveLength(1)
                expect(errors[0]).toEqual(expect.objectContaining({
                    message: expect.stringContaining('unique constraint'),
                }))
            })
        })

        test('Deleting B2BAppContext leads to deleting B2BAccessTokens', async () => {
            const admin = await makeLoggedInAdminClient()
            const support = await makeClientWithSupportUser()
            const [app] = await createTestB2BApp(admin)
            const [organization] = await registerNewOrganization(admin)
            const [context] = await createTestB2BAppContext(admin, app, organization, { status: 'Finished' })
            expect(context).toBeDefined()

            const [accessRightSet] = await createTestB2BAppAccessRightSet(support, app)
            const [scopedRightSet] = await createTestB2BAppAccessRightSet(support, app, { type: 'SCOPED' })
            const [serviceUser] = await registerNewServiceUserByTestClient(support)
            await createTestB2BAppAccessRight(support, serviceUser, app, accessRightSet)

            const ids = []
            const tokensCount = Math.round(Math.random() * ACCESS_RIGHT_SET_MAX_ITEMS_SCOPED_TYPE) + 1
            for (let i = 0; i < tokensCount; i++) {
                const [{ id }] = await createTestB2BAccessToken(admin, context, scopedRightSet)
                ids.push(id)
            }
            const accessTokens = await B2BAccessTokenReadonly.getAll(admin, { id_in: ids })
            expect(accessTokens).toHaveLength(tokensCount)

            await updateTestB2BAppContext(support, context.id, { deletedAt: new Date().toISOString() })
            const accessTokensAfterDelete = await B2BAccessTokenReadonly.getAll(admin, { id_in: ids })
            expect(accessTokensAfterDelete).toHaveLength(0)
        })
    })
})
