/**
 * Generated by `createschema miniapp.MessageAppBlackList 'app?:Relationship:B2CApp:CASCADE; description:Text'`
 */
const { faker } = require('@faker-js/faker')

const { makeLoggedInAdminClient, makeClient, UUID_RE, catchErrorFrom } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj, expectToThrowAccessDeniedErrorToObjects,
} = require('@open-condo/keystone/test.utils')

const { MessageAppBlackList,
    createTestB2CApp,
    createTestMessageAppBlackList,
    updateTestMessageAppBlackList,
} = require('@condo/domains/miniapp/utils/testSchema')
const {
    B2C_APP_MESSAGE_PUSH_TYPE,
} = require('@condo/domains/notification/constants/constants')
const {
    makeClientWithNewRegisteredAndLoggedInUser,
    makeClientWithSupportUser,
    createTestUser,
} = require('@condo/domains/user/utils/testSchema')

describe('MessageAppBlackList', () => {

    let admin

    beforeEach( async () => {
        admin = await makeLoggedInAdminClient()
    })

    describe('accesses', () => {
        describe('create', () => {
            it('support can create MessageAppBlackList', async () => {
                const supportClient = await makeClientWithSupportUser()

                const [blackList] = await createTestMessageAppBlackList(supportClient)

                expect(blackList.id).toMatch(UUID_RE)
            })

            it('user cannot create MessageAppBlackList', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestMessageAppBlackList(userClient)
                })
            })

            it('anonymous cannot create MessageAppBlackList', async () => {
                const anonymousClient = await makeClient()

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestMessageAppBlackList(anonymousClient)
                })
            })
        })

        describe('update', () => {
            it('support can update MessageAppBlackList', async () => {
                const supportClient = await makeClientWithSupportUser()

                const [blackList] = await createTestMessageAppBlackList(supportClient)
                const description = faker.random.alphaNumeric(8)

                const [updatedBlackList] = await updateTestMessageAppBlackList(supportClient, blackList.id, {
                    description,
                })

                expect(updatedBlackList.description).toEqual(description)
            })

            it('user cannot update MessageAppBlackList', async () => {
                const supportClient = await makeClientWithSupportUser()
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

                const [blackList] = await createTestMessageAppBlackList(supportClient)
                const description = faker.random.alphaNumeric(8)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestMessageAppBlackList(userClient, blackList.id, {
                        description,
                    })
                })
            })

            it('anonymous cannot update MessageAppBlackList', async () => {
                const supportClient = await makeClientWithSupportUser()
                const anonymousClient = await makeClient()

                const [blackList] = await createTestMessageAppBlackList(supportClient)
                const description = faker.random.alphaNumeric(8)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestMessageAppBlackList(anonymousClient, blackList.id, {
                        description,
                    })
                })
            })
        })

        describe('read', () => {
            it('user cannot read MessageAppBlackList', async () => {
                const supportClient = await makeClientWithSupportUser()
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

                await createTestMessageAppBlackList(supportClient)

                await expectToThrowAccessDeniedErrorToObjects(async () => {
                    await MessageAppBlackList.getAll(userClient)
                })
            })

            it('anonymous cannot read MessageAppBlackList', async () => {
                const supportClient = await makeClientWithSupportUser()
                const anonymousClient = await makeClient()

                await createTestMessageAppBlackList(supportClient)

                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await MessageAppBlackList.getAll(anonymousClient)
                })
            })
        })
    })
})
