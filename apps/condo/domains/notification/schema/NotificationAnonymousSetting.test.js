/**
 * Generated by `createschema notification.NotificationAnonymousSetting 'email:Text; phone:Text; messageType:Text; messageTransport:Text; isEnabled:Checkbox'`
 */

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE, waitFor, expectValuesOfCommonFields, catchErrorFrom } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj, expectToThrowAccessDeniedErrorToObjects,
} = require('@open-condo/keystone/test.utils')

const { NotificationAnonymousSetting, createTestNotificationAnonymousSetting, updateTestNotificationAnonymousSetting } = require('@condo/domains/notification/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')


describe('NotificationAnonymousSetting', () => {
    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                // 1) prepare data
                const admin = await makeLoggedInAdminClient()

                // 2) action
                const [obj, attrs] = await createTestNotificationAnonymousSetting(admin)

                // 3) check
                expectValuesOfCommonFields(obj, attrs, admin)
            })

            test('support can', async () => {
                const client = await makeClientWithSupportUser()
                const [obj, attrs] = await createTestNotificationAnonymousSetting(client)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('user can\'t', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestNotificationAnonymousSetting(client)
                })
            })

            test('anonymous can\'t', async () => {
                const client = await makeClient()

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestNotificationAnonymousSetting(client)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestNotificationAnonymousSetting(admin)

                const [obj, attrs] = await updateTestNotificationAnonymousSetting(admin, objCreated.id)

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            })

            test('support can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestNotificationAnonymousSetting(admin)

                const client = await makeClientWithSupportUser()
                const [obj, attrs] = await updateTestNotificationAnonymousSetting(client, objCreated.id)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestNotificationAnonymousSetting(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestNotificationAnonymousSetting(client, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestNotificationAnonymousSetting(admin)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestNotificationAnonymousSetting(client, objCreated.id)
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestNotificationAnonymousSetting(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await NotificationAnonymousSetting.delete(admin, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestNotificationAnonymousSetting(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await NotificationAnonymousSetting.delete(client, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestNotificationAnonymousSetting(admin)

                const client = await makeClient()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await NotificationAnonymousSetting.delete(client, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTestNotificationAnonymousSetting(admin)

                const objs = await NotificationAnonymousSetting.getAll(admin, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                        email: obj.email,
                        messageType: obj.messageType,
                        messageTransport: obj.messageTransport,
                        isEnabled: false,
                    }),
                ]))
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTestNotificationAnonymousSetting(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()


                await expectToThrowAccessDeniedErrorToObjects(async () => {
                    await NotificationAnonymousSetting.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTestNotificationAnonymousSetting(admin)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await NotificationAnonymousSetting.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })
        })
    })

    describe('Validation', () => {
        test('Both phone and email is empty', async () => {
            // 1) prepare data
            const admin = await makeLoggedInAdminClient()

            // 2) action
            // TODO(pahaz): DOMA-10368 use expectToThrowGraphQLRequestError
            await catchErrorFrom(async () => {
                await createTestNotificationAnonymousSetting(admin, {
                    phone: null,
                    email: null,
                })
            }, (caught) => {
                expect(caught).toMatchObject({
                    errors: expect.arrayContaining([
                        expect.objectContaining({
                            name: 'GQLError',
                            message: expect.stringContaining('One of the "phone" or "email" fields should be provided.'),
                            extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' }),
                        }),
                    ]),
                })
            })
        })

        test('Add enable setting instead of remove record', async () => {
            // 1) prepare data
            const admin = await makeLoggedInAdminClient()

            // 2) action
            // TODO(pahaz): DOMA-10368 use expectToThrowGraphQLRequestError
            await catchErrorFrom(async () => {
                await createTestNotificationAnonymousSetting(admin, {
                    isEnabled: true,
                })
            }, (caught) => {
                expect(caught).toMatchObject({
                    errors: expect.arrayContaining([
                        expect.objectContaining({
                            message: expect.stringContaining('No need to enable notifications. All notifications enabled by default. You may just delete this setting instead.'),
                            extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' }),
                        }),
                    ]),
                })
            })
        })
    })
})
