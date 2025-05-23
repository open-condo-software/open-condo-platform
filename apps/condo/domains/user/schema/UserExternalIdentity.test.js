/**
 * Generated by `createschema user.UserExternalIdentity`
 */

const { faker } = require('@faker-js/faker')

const {
    makeLoggedInAdminClient,
} = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowInternalError,
} = require('@open-condo/keystone/test.utils')

const { SBER_ID_IDP_TYPE } = require('@condo/domains/user/constants/common')
const {
    UserAdmin,
    UserExternalIdentity,
    createTestUserExternalIdentity,
    makeClientWithResidentUser,
    makeClientWithStaffUser,
    makeClientWithServiceUser,
} = require('@condo/domains/user/utils/testSchema')
const {
    makeClientWithSupportUser,
} = require('@condo/domains/user/utils/testSchema')

const getRegisterRequest = (client) => ({
    user: { connect: { id: client.user.id } },
    identityId: faker.random.alphaNumeric(8),
    identityType: SBER_ID_IDP_TYPE,
    meta: {
        dv: 1, city: faker.address.city(), county: faker.address.county(),
    },
})

const assertIdentity = (identity, request) => {
    const {
        user: { connect: { id: userId } },
        identityId,
        identityType,
        meta,
    } = request
    expect(identity).toMatchObject({
        user: { id: userId },
        identityId,
        identityType,
        meta,
    })
}

describe('UserExternalIdentity', () => {
    describe('UserExternalIdentity create', () => {
        test('Denied: RESIDENT', async () => {
            const client = await makeClientWithResidentUser()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestUserExternalIdentity(client)
            })
        })

        test('Denied: STAFF', async () => {
            const client = await makeClientWithStaffUser()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestUserExternalIdentity(client)
            })
        })

        test('Denied: SERVICE', async () => {
            const client = await makeClientWithServiceUser()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestUserExternalIdentity(client)
            })
        })

        test('Allow: admin', async () => {
            const admin = await makeLoggedInAdminClient()
            const identityRequest = getRegisterRequest(admin)

            const [identity] = await createTestUserExternalIdentity(admin, identityRequest)

            assertIdentity(identity, identityRequest)
        })

        test('Validate: deleted user', async () => {
            const admin = await makeLoggedInAdminClient()
            const anotherClient = await makeClientWithServiceUser()
            const identityRequest = getRegisterRequest(anotherClient)

            // soft delete user
            await UserAdmin.update(admin, anotherClient.user.id, {
                dv: 1,
                sender: { dv: 1, fingerprint: faker.datatype.uuid() },
                deletedAt: 'true',
            })

            await expectToThrowInternalError(
                async () => await createTestUserExternalIdentity(admin, identityRequest),
                'Unable to connect a UserExternalIdentity.user<User>',
                ['obj'],
            )
        })
    })

    describe('UserExternalIdentity read', () => {
        let admin, support, staff, service, resident, secondResident, identityRequest,
            staffIdentityRequest, serviceIdentityRequest

        beforeAll(async () => {
            admin = await makeLoggedInAdminClient()
            support = await makeClientWithSupportUser()
            staff = await makeClientWithStaffUser()
            service = await makeClientWithServiceUser()
            resident = await makeClientWithResidentUser()
            secondResident = await makeClientWithResidentUser()
            identityRequest = getRegisterRequest(resident)
            staffIdentityRequest = getRegisterRequest(staff)
            serviceIdentityRequest = getRegisterRequest(service)

            // register users external identity
            await createTestUserExternalIdentity(admin, identityRequest)
            await createTestUserExternalIdentity(admin, getRegisterRequest(secondResident))
            await createTestUserExternalIdentity(admin, staffIdentityRequest)
            await createTestUserExternalIdentity(admin, serviceIdentityRequest)

        })

        test('Allowed: RESIDENT own identity', async () => {
            const identities = await UserExternalIdentity.getAll(resident, {})
            expect(identities).toHaveLength(1)
            assertIdentity(identities[0], identityRequest)
        })

        test('Allowed: STAFF own identity', async () => {
            const identities = await UserExternalIdentity.getAll(staff, {})
            expect(identities).toHaveLength(1)
            assertIdentity(identities[0], staffIdentityRequest)
        })

        test('Allowed: SERVICE own identity', async () => {
            const identities = await UserExternalIdentity.getAll(service, {})
            expect(identities).toHaveLength(1)
            assertIdentity(identities[0], serviceIdentityRequest)
        })

        test('Allowed: admin', async () => {
            const identity = await UserExternalIdentity.getOne(admin, { user: { id: resident.user.id } })
            assertIdentity(identity, identityRequest)
        })
    })

    describe('UserExternalIdentity update', () => {
        let admin, support, staff, service, resident, identity, updateRequest

        beforeAll(async () => {
            admin = await makeLoggedInAdminClient()
            support = await makeClientWithSupportUser()
            staff = await makeClientWithStaffUser()
            service = await makeClientWithServiceUser()
            resident = await makeClientWithResidentUser()
            updateRequest = {
                dv: 1,
                sender: { dv: 1, fingerprint: 'fixOrganizationInnScript' },
                identityId: faker.random.alphaNumeric(8),
            }

            // register users external identity
            await createTestUserExternalIdentity(admin, getRegisterRequest(resident))

            identity = await UserExternalIdentity.getOne(resident, {})
        })

        test('Denied: RESIDENT', async () => {
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await UserExternalIdentity.update(resident, identity.id, {})
            })
        })

        test('Denied: STAFF', async () => {
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await UserExternalIdentity.update(staff, identity.id, updateRequest)
            })
        })

        test('Denied: SERVICE', async () => {
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await UserExternalIdentity.update(service, identity.id, updateRequest)
            })
        })

        test('Allowed: admin', async () => {
            const response = await UserExternalIdentity.update(admin, identity.id, updateRequest)
            expect(response).toMatchObject({ identityId: updateRequest.identityId })
        })
    })

    describe('UserExternalIdentity soft delete', () => {
        let admin, support, staff, service

        beforeAll(async () => {
            admin = await makeLoggedInAdminClient()
            support = await makeClientWithSupportUser()
            staff = await makeClientWithStaffUser()
            service = await makeClientWithServiceUser()
        })

        test('Allowed: RESIDENT', async () => {
            // register users external identity
            const resident = await makeClientWithResidentUser()
            const identityRequest = getRegisterRequest(resident)
            await createTestUserExternalIdentity(admin, identityRequest)
            const identity = await UserExternalIdentity.getOne(resident, {})

            // call delete
            await UserExternalIdentity.softDelete(resident, identity.id)
        })

        test('Denied: STAFF', async () => {
            // register users external identity
            const resident = await makeClientWithResidentUser()
            await createTestUserExternalIdentity(admin, getRegisterRequest(resident))
            const identity = await UserExternalIdentity.getOne(resident, {})

            // call delete
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await UserExternalIdentity.softDelete(staff, identity.id)
            })
        })

        test('Denied: SERVICE', async () => {
            // register users external identity
            const resident = await makeClientWithResidentUser()
            await createTestUserExternalIdentity(admin, getRegisterRequest(resident))
            const identity = await UserExternalIdentity.getOne(resident, {})

            // call delete
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await UserExternalIdentity.softDelete(service, identity.id)
            })
        })

        test('Allowed: admin', async () => {
            // register users external identity
            const resident = await makeClientWithResidentUser()
            await createTestUserExternalIdentity(admin, getRegisterRequest(resident))
            const identity = await UserExternalIdentity.getOne(resident, {})

            // call delete
            await UserExternalIdentity.softDelete(admin, identity.id)
        })
    })
})