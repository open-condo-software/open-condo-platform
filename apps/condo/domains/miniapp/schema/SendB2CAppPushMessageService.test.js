/**
 * Generated by `createservice miniapp.SendB2CAppPushMessageService --type mutations`
 */
const { faker } = require('@faker-js/faker')

const conf = require('@open-condo/config')
const {
    makeLoggedInAdminClient, makeLoggedInClient,
    makeClient, UUID_RE,
    expectToThrowGQLErrorToResult,
    expectToThrowAccessDeniedErrorToResult,
    expectToThrowAuthenticationErrorToResult,
    expectToThrowGraphQLRequestError, 
    waitFor,
} = require('@open-condo/keystone/test.utils')

const {
    createTestB2CApp,
    sendB2CAppPushMessageByTestClient, createTestAppMessageSetting,
} = require('@condo/domains/miniapp/utils/testSchema')
const {
    B2C_APP_MESSAGE_PUSH_TYPE,
    CANCELED_CALL_MESSAGE_PUSH_TYPE,
    VOIP_INCOMING_CALL_MESSAGE_TYPE,
    B2B_APP_MESSAGE_PUSH_TYPE,
    APPLE_CONFIG_TEST_VOIP_PUSHTOKEN_ENV,
    DEVICE_PLATFORM_IOS, APP_RESIDENT_ID_IOS,
    PUSH_TRANSPORT_APPLE,
} = require('@condo/domains/notification/constants/constants')
const { syncRemoteClientByTestClient, Message } = require('@condo/domains/notification/utils/testSchema')
const { getRandomTokenData, getRandomFakeSuccessToken } = require('@condo/domains/notification/utils/testSchema/utils')
const { makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { makeClientWithResidentAccessAndProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestResident } = require('@condo/domains/resident/utils/testSchema')
const {
    makeClientWithSupportUser,
    makeClientWithStaffUser,
    makeClientWithResidentUser,
} = require('@condo/domains/user/utils/testSchema')

const { ERRORS, CACHE_TTL } = require('./SendB2CAppPushMessageService')


const APPLE_TEST_VOIP_PUSHTOKEN = conf[APPLE_CONFIG_TEST_VOIP_PUSHTOKEN_ENV] || null

describe('SendB2CAppPushMessageService', () => {
    let admin, supportClient, user, residentClient, resident, appAttrs, b2cApp

    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        supportClient = await makeClientWithSupportUser()
        residentClient = await makeClientWithResidentAccessAndProperty()

        const [b2c] = await createTestB2CApp(admin)
        const [residentData] = await createTestResident(admin, residentClient.user, residentClient.property)

        user = residentClient.user
        resident = residentData
        b2cApp = b2c
        appAttrs = {
            type: B2C_APP_MESSAGE_PUSH_TYPE,
            app: { id: b2cApp.id },
            user: { id: user.id },
            resident: { id: resident.id },
        }
    })

    describe('access checks', () => {
        test('Admin can SendB2CAppPushMessageService', async () => {
            const [message] = await sendB2CAppPushMessageByTestClient(admin, appAttrs)

            expect(message.id).toMatch(UUID_RE)
        })

        test('Support can SendB2CAppPushMessageService', async () => {
            const [b2c] = await createTestB2CApp(supportClient)
            const [message] = await sendB2CAppPushMessageByTestClient(supportClient, {
                ...appAttrs,
                app: { id: b2c.id },
            })

            expect(message.id).toMatch(UUID_RE)
        })

        test('Anonymous cannot SendB2CAppPushMessageService', async () => {
            const anonymousClient = await makeClient()

            await expectToThrowAuthenticationErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(anonymousClient, appAttrs)
            })
        })

        test('Management company admin user cannot SendB2CAppPushMessageService to other users', async () => {
            const client = await makeClientWithRegisteredOrganization()

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(client, appAttrs)
            })
        })

        test('Staff cannot SendB2CAppPushMessageService to other users', async () => {
            const staffClient = await makeClientWithStaffUser()

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(staffClient, appAttrs)
            })
        })

        /** we now require either residentId or propertyId + unitType + unitName which is available only for resident users */
        it.skip('Staff can SendB2CAppPushMessageService to himself', async () => {
            const staffClient = await makeClientWithStaffUser()
            const [message] = await sendB2CAppPushMessageByTestClient(staffClient, {
                ...appAttrs,
                user: { id: staffClient.id },
            })

            expect(message.id).toMatch(UUID_RE)
        })

        test('Resident cannot SendB2CAppPushMessageService to other users', async () => {
            const residentClient1 = await makeClientWithResidentUser()

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(residentClient1, appAttrs)
            })
        })

        test('Resident can SendB2CAppPushMessageService to himself', async () => {
            const [b2c] = await createTestB2CApp(supportClient)
            const [message] = await sendB2CAppPushMessageByTestClient(residentClient, {
                ...appAttrs,
                app: { id: b2c.id },
            })

            expect(message.id).toMatch(UUID_RE)
        })
    })

    describe('errors', () => {
        test('No user with provided id for random id', async () => {
            await expectToThrowGQLErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    user: { id: faker.datatype.uuid() },
                })
            }, ERRORS.USER_NOT_FOUND)
        })

        test('No app with provided id for random id', async () => {
            await expectToThrowGQLErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    app: { id: faker.datatype.uuid() },
                })
            }, ERRORS.APP_NOT_FOUND)
        })

        test('Should have correct dv field (=== 1)', async () => {
            await expectToThrowGQLErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    dv: 2,
                })
            }, ERRORS.DV_VERSION_MISMATCH)
        })

        test('Should have correct sender field [\'Dv must be equal to 1\']', async () => {
            await expectToThrowGQLErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    sender: { dv: 2, fingerprint: faker.random.alphaNumeric(8) },
                })
            }, ERRORS.WRONG_SENDER_FORMAT)
        })

        test('Resident id is missing', async () => {
            const expectedErrorMessage = 'Field "resident" of required type "ResidentWhereUniqueInput!" was not provided'

            await expectToThrowGraphQLRequestError(
                async () => {
                    await sendB2CAppPushMessageByTestClient(admin, {
                        ...appAttrs,
                        resident: undefined,
                    })
                },
                expectedErrorMessage,
            )
        })

        test('User id is missing', async () => {
            const expectedErrorMessage = 'Field "user" of required type "UserWhereUniqueInput!" was not provided'

            await expectToThrowGraphQLRequestError(
                async () => {
                    await sendB2CAppPushMessageByTestClient(admin, {
                        ...appAttrs,
                        user: undefined,
                    })
                },
                expectedErrorMessage,
            )
        })

        test('App id is missing', async () => {
            const expectedErrorMessage = 'Field "app" of required type "B2CAppWhereUniqueInput!" was not provided'

            await expectToThrowGraphQLRequestError(
                async () => {
                    await sendB2CAppPushMessageByTestClient(admin, {
                        ...appAttrs,
                        app: undefined,
                    })
                },
                expectedErrorMessage,
            )
        })

        test('Type is missing', async () => {
            const expectedErrorMessage = 'Field "type" of required type "SendB2CAppPushMessageType!" was not provided'

            await expectToThrowGraphQLRequestError(
                async () => {
                    await sendB2CAppPushMessageByTestClient(admin, {
                        ...appAttrs,
                        type: undefined,
                    })
                },
                expectedErrorMessage,
            )
        })

        test('No resident with provided id for random id', async () => {
            await expectToThrowGQLErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    resident: { id: faker.datatype.uuid() },
                })
            }, ERRORS.RESIDENT_NOT_FOUND)
        })
    })

    describe('Notification throttling checks', () => {
        test('Don\'t send message if AppMessageSetting has numberOfNotificationInWindow: 0', async () => {
            const [b2cApp] = await createTestB2CApp(supportClient)

            await createTestAppMessageSetting(supportClient, {
                b2cApp,
                type: B2C_APP_MESSAGE_PUSH_TYPE,
                numberOfNotificationInWindow: 0,
            })

            await expectToThrowGQLErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    app: { id: b2cApp.id },
                })
            }, {
                code: 'BAD_USER_INPUT',
                type: 'TOO_MANY_REQUESTS',
                message: 'You have to wait {minutesRemaining} min. to be able to send request again',
            })
        })

        test('Don\'t send a notification if there was already a notification in the default time window', async () => {
            const [b2cApp] = await createTestB2CApp(supportClient)

            await createTestAppMessageSetting(supportClient, {
                type: B2C_APP_MESSAGE_PUSH_TYPE,
                b2cApp,
            })
            const [message] = await sendB2CAppPushMessageByTestClient(admin, {
                ...appAttrs,
                app: { id: b2cApp.id },
            })
            expect(message.id).toMatch(UUID_RE)

            await expectToThrowGQLErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    app: { id: b2cApp.id },
                })
            }, {
                code: 'BAD_USER_INPUT',
                type: 'TOO_MANY_REQUESTS',
                message: 'You have to wait {minutesRemaining} min. to be able to send request again',
            })
        })

        test('Don\'t send a notification if the notification limit in the custom time window is exhausted', async () => {
            const [b2cApp] = await createTestB2CApp(supportClient)

            const notificationWindowSize = 3600
            const numberOfNotificationInWindow = 2
            await createTestAppMessageSetting(supportClient, {
                b2cApp,
                notificationWindowSize,
                numberOfNotificationInWindow,
            })

            const [message1] = await sendB2CAppPushMessageByTestClient(admin, {
                ...appAttrs,
                app: { id: b2cApp.id },
            })
            expect(message1.id).toMatch(UUID_RE)

            const [message2] = await sendB2CAppPushMessageByTestClient(admin, {
                ...appAttrs,
                app: { id: b2cApp.id },
            })
            expect(message2.id).toMatch(UUID_RE)

            await expectToThrowGQLErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    app: { id: b2cApp.id },
                })
            }, {
                code: 'BAD_USER_INPUT',
                type: 'TOO_MANY_REQUESTS',
                message: 'You have to wait {minutesRemaining} min. to be able to send request again',
            })
        })

        test('Check working CACHE_TTL config', async () => {
            const [message1] = await sendB2CAppPushMessageByTestClient(admin, {
                ...appAttrs,
                type: CANCELED_CALL_MESSAGE_PUSH_TYPE,
            })

            expect(message1.id).toMatch(UUID_RE)

            await new Promise((resolve) => setTimeout(resolve, CACHE_TTL[CANCELED_CALL_MESSAGE_PUSH_TYPE] * 1000))

            const [message2] = await sendB2CAppPushMessageByTestClient(admin, {
                ...appAttrs,
                type: CANCELED_CALL_MESSAGE_PUSH_TYPE,
            })

            expect(message2.id).toMatch(UUID_RE)

            // Wait before run next test
            await new Promise((resolve) => setTimeout(resolve, CACHE_TTL[CANCELED_CALL_MESSAGE_PUSH_TYPE] * 1000))
        })
    })

    describe('Checking the sending of available push types in SendB2CAppPushMessageService', () => {
        test('Push with type B2B_APP_MESSAGE_PUSH_TYPE is not sent', async () => {
            const expectedErrorMessage = 'Variable "$data" got invalid value "B2B_APP_MESSAGE_PUSH" at "data.type"; Value "B2B_APP_MESSAGE_PUSH" does not exist in "SendB2CAppPushMessageType" enum. Did you mean the enum value "B2C_APP_MESSAGE_PUSH"?'

            await expectToThrowGraphQLRequestError(
                async () => {
                    await sendB2CAppPushMessageByTestClient(admin, {
                        ...appAttrs,
                        type: B2B_APP_MESSAGE_PUSH_TYPE,
                    })
                },
                expectedErrorMessage,
            )
        })
    })

    describe('Checking insertion only the necessary fields in message meta', () => {
        test('CANCELED_CALL_MESSAGE_PUSH', async () => {
            const voipIncomingCallId = '1234'
            const [{ id }] = await sendB2CAppPushMessageByTestClient(admin, {
                ...appAttrs,
                type: CANCELED_CALL_MESSAGE_PUSH_TYPE,
                data: {
                    voipIncomingCallId,
                },
            })

            await waitFor(async () => {
                const message = await Message.getOne(admin, { id })

                expect(message.meta.data.voipIncomingCallId).toEqual(voipIncomingCallId)
                expect(message.meta.data.voipAddress).toBeUndefined()
                expect(message.type).toEqual(CANCELED_CALL_MESSAGE_PUSH_TYPE)
            })
        })

        test('VOIP_INCOMING_CALL_MESSAGE_TYPE', async () => {
            const voipType = 'incoming'
            const [{ id }] = await sendB2CAppPushMessageByTestClient(admin, {
                ...appAttrs,
                type: VOIP_INCOMING_CALL_MESSAGE_TYPE,
                data: {
                    voipType,
                },
            })

            await waitFor(async () => {
                const message = await Message.getOne(admin, { id })

                expect(message.meta.data.voipIncomingCallId).toBeUndefined()
                expect(message.meta.data.voipType).toEqual(voipType)
                expect(message.type).toEqual(VOIP_INCOMING_CALL_MESSAGE_TYPE)
            })
        })
    })

    /**
     * This test is needed only for local debugging
     */
    describe.skip('real notification send for debugging', () => {
        test('send VOIP_INCOMING_CALL_MESSAGE_TYPE to real VoIP push token if exists', async () => {
            const user = await makeLoggedInClient()
            const propertyId = 'e360edab-db67-408c-9aef-ddb70c31d3ec'
            // This is app id from condo, make sure to substitute it to one of already existing b2c apps locally for this test to work
            const EXISTING_B2C_APP_ID = 'b252edfd-1097-40ee-a159-05f6d6a1ee95'

            /**
             * NOTE: requires real VoIP push token to be sen in your .env to APPLE_TEST_VOIP_PUSHTOKEN
             * Also need APPLE_CONFIG_JSON
             * */

            const payload = getRandomTokenData({
                devicePlatform: DEVICE_PLATFORM_IOS,
                appId: APP_RESIDENT_ID_IOS,
                pushToken: getRandomFakeSuccessToken(),
                pushTransportVoIP: PUSH_TRANSPORT_APPLE,
                pushTokenVoIP: APPLE_TEST_VOIP_PUSHTOKEN,
            })

            await syncRemoteClientByTestClient(user, payload)

            const [message] = await sendB2CAppPushMessageByTestClient(admin, {
                type: VOIP_INCOMING_CALL_MESSAGE_TYPE,
                app: { id: EXISTING_B2C_APP_ID },
                user: { id: user.user.id },
                data: {
                    body: 'VoIP test body',
                    title: 'VoIP test title',
                    B2CAppContext: JSON.stringify({ propertyId }),
                },
            })

            expect(message.id).toMatch(UUID_RE)
        })
    })

})