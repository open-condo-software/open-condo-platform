/**
 * Generated by `createservice banking.CreateBankAccountRequestService '--type=mutations'`
 */
const { faker } = require('@faker-js/faker')

const { GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { makeLoggedInAdminClient, makeClient, expectToThrowGQLError, expectToThrowAccessDeniedErrorToResult } = require('@open-condo/keystone/test.utils')
const { expectToThrowAuthenticationErrorToResult, waitFor } = require('@open-condo/keystone/test.utils')

const { INCORRECT_PROPERTY_ID } = require('@condo/domains/banking/constants')
const { createBankAccountRequestByTestClient } = require('@condo/domains/banking/utils/testSchema')
const { MESSAGE_SENT_STATUS } = require('@condo/domains/notification/constants/constants')
const { Message } = require('@condo/domains/notification/utils/testSchema')
const { createTestOrganization, createTestOrganizationEmployeeRole, createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')

let admin, client, wrongClient, anonymousClient

describe('CreateBankAccountRequestService', () => {
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        client = await makeClientWithProperty()
        wrongClient = await makeClientWithProperty()
        anonymousClient = await makeClient()
    })

    test('user: can send create bank account request if has canManageBankAccounts access', async () => {
        const [data] = await createBankAccountRequestByTestClient(client, {
            propertyId: client.property.id,
            organizationId: client.organization.id,
        })

        await waitFor(async () => {
            const message = await Message.getOne(admin, { id: data.id })
            expect(message).toBeDefined()
            expect(message.status).toEqual(MESSAGE_SENT_STATUS)
        })
    })

    test('user: can\'t send create bank account request if hasn\'t canManageBankAccounts access', async () => {
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageBankAccounts: false,
        })
        const organizationEmployee = await makeClientWithNewRegisteredAndLoggedInUser()
        const [property] = await createTestProperty(admin, organization)
        await createTestOrganizationEmployee(admin, organization, organizationEmployee.user, role)

        await expectToThrowAccessDeniedErrorToResult(async () => {
            await createBankAccountRequestByTestClient(organizationEmployee, {
                organizationId: organization.id,
                propertyId: property.id,
            })
        })
    })

    test('user: can\'t send create bank account request with unrelated property to the selected organization', async () => {
        await expectToThrowGQLError(async () => {
            await createBankAccountRequestByTestClient(client, {
                propertyId: wrongClient.property.id,
                organizationId: client.organization.id,
            })
        }, {
            code: BAD_USER_INPUT,
            type: INCORRECT_PROPERTY_ID,
            mutation: 'createBankAccountRequest',
            message: 'Incorrect propertyId was provided. Please check that this id related to passed organizationId',
            variable: ['propertyId'],
            messageForUser: 'api.banking.createBankAccountRequest.INCORRECT_PROPERTY_ID',
        }, 'result')
    })

    test('user: can\'t send create bank account request if he is not a member', async () => {
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await createBankAccountRequestByTestClient(wrongClient, {
                propertyId: client.property.id,
                organizationId: client.organization.id,
            })
        })
    })

    test('anonymous: can\'t send create bank account request', async () => {
        await expectToThrowAuthenticationErrorToResult(async () => {
            await createBankAccountRequestByTestClient(anonymousClient, {
                propertyId: faker.datatype.uuid(),
                organizationId: faker.datatype.uuid(),
            })
        })
    })

    test('admin: execute', async () => {
        const [data] = await createBankAccountRequestByTestClient(admin, {
            organizationId: client.organization.id,
            propertyId: client.property.id,
        })

        expect(data).toBeDefined()
        expect(data).toHaveProperty('id')
        expect(data).toHaveProperty('status')
    })
})
