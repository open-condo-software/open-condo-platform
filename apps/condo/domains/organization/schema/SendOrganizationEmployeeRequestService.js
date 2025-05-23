/**
 * Generated by `createservice organization.SendOrganizationEmployeeRequestService --type mutations`
 */

const get = require('lodash/get')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { checkDvAndSender } = require('@open-condo/keystone/plugins/dvAndSender')
const { GQLCustomSchema, getById, getByCondition } = require('@open-condo/keystone/schema')

const { COMMON_ERRORS } = require('@condo/domains/common/constants/errors')
const access = require('@condo/domains/organization/access/SendOrganizationEmployeeRequestService')
const { MAX_ORGANIZATION_EMPLOYEE_REQUEST_RETRIES } = require('@condo/domains/organization/constants/common')
const { OrganizationEmployeeRequest } = require('@condo/domains/organization/utils/serverSchema')
const { checkTotalRequestLimitCountersByUser } = require('@condo/domains/user/utils/serverSchema/requestLimitHelpers')



/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const ERRORS = {
    USER_DOES_NOT_HAVE_PHONE: {
        mutation: 'sendOrganizationEmployeeRequest',
        variable: ['data'],
        code: BAD_USER_INPUT,
        type: 'USER_DOES_NOT_HAVE_PHONE',
        message: 'The user does not have a phone',
    },
    ORGANIZATION_NOT_FOUND: {
        mutation: 'sendOrganizationEmployeeRequest',
        variable: ['data', 'organization'],
        code: BAD_USER_INPUT,
        type: 'ORGANIZATION_NOT_FOUND',
        message: 'Organization not found',
    },
    REQUEST_TO_ORGANIZATION_LIMIT_REACHED: {
        mutation: 'sendOrganizationEmployeeRequest',
        variable: ['data'],
        code: BAD_USER_INPUT,
        type: 'REQUEST_TO_ORGANIZATION_LIMIT_REACHED',
        message: 'A request to the organization limit reached',
        messageForUser: 'api.organization.sendOrganizationEmployeeRequest.REQUEST_TO_ORGANIZATION_LIMIT_REACHED',
    },
    REQUEST_NOT_PROCESSED: {
        mutation: 'sendOrganizationEmployeeRequest',
        variable: ['data'],
        code: BAD_USER_INPUT,
        type: 'REQUEST_NOT_PROCESSED',
        message: 'A request not processed yet. Please wait for a decide on the request from the organization',
        messageForUser: 'api.organization.sendOrganizationEmployeeRequest.REQUEST_NOT_PROCESSED',
    },
    EMPLOYEE_ALREADY_ACCEPTED: {
        mutation: 'sendOrganizationEmployeeRequest',
        variable: ['data'],
        code: BAD_USER_INPUT,
        type: 'EMPLOYEE_ALREADY_ACCEPTED',
        message: 'An accepted employee already exist in this organization',
        messageForUser: 'api.organization.sendOrganizationEmployeeRequest.EMPLOYEE_ALREADY_ACCEPTED',
    },
    EMPLOYEE_INVITATION_ALREADY_SENT: {
        mutation: 'sendOrganizationEmployeeRequest',
        variable: ['data'],
        code: BAD_USER_INPUT,
        type: 'EMPLOYEE_INVITATION_ALREADY_SENT',
        message: 'The invitation has already been sent to the employee.',
        messageForUser: 'api.organization.sendOrganizationEmployeeRequest.EMPLOYEE_INVITATION_ALREADY_SENT',
    },
    DV_VERSION_MISMATCH: {
        ...COMMON_ERRORS.DV_VERSION_MISMATCH,
        mutation: 'sendOrganizationEmployeeRequest',
    },
    WRONG_SENDER_FORMAT: {
        ...COMMON_ERRORS.WRONG_SENDER_FORMAT,
        mutation: 'sendOrganizationEmployeeRequest',
    },
}

const SendOrganizationEmployeeRequestService = new GQLCustomSchema('SendOrganizationEmployeeRequestService', {
    types: [
        {
            access: true,
            type: 'input SendOrganizationEmployeeRequestInput { dv: Int!, sender: SenderFieldInput!, organization: OrganizationWhereUniqueInput! }',
        },
    ],

    mutations: [
        {
            access: access.canSendOrganizationEmployeeRequest,
            doc: {
                summary: 'Creates a request to join the specified organization',
                errors: ERRORS,
            },
            schema: 'sendOrganizationEmployeeRequest(data: SendOrganizationEmployeeRequestInput!): OrganizationEmployeeRequest',
            resolver: async (parent, args, context) => {
                const { data } = args
                const { organization: organizationFromInput, dv, sender } = data
                const authedItemId = get(context, 'authedItem.id', null)
                if (!authedItemId) throw new Error('no authedItemId!')

                checkDvAndSender(data, ERRORS.DV_VERSION_MISMATCH, ERRORS.WRONG_SENDER_FORMAT, context)

                await checkTotalRequestLimitCountersByUser(context, 'sendOrganizationEmployeeRequest', authedItemId, 100)

                const authedItemPhone = get(context, 'authedItem.phone', null)
                // NOTE: Current business process requires phone to create employee
                if (!authedItemPhone) throw new GQLError(ERRORS.USER_DOES_NOT_HAVE_PHONE, context)

                const organization = await getByCondition('Organization', {
                    id: organizationFromInput.id,
                    deletedAt: null,
                })
                if (!organization) throw new GQLError(ERRORS.ORGANIZATION_NOT_FOUND, context)

                const employee = await getByCondition('OrganizationEmployee', {
                    user: { id: authedItemId },
                    organization: { id: organization.id },
                    deletedAt: null,
                })

                if (employee && employee.isAccepted) throw new GQLError(ERRORS.EMPLOYEE_ALREADY_ACCEPTED, context)
                if (employee && !employee.isAccepted && !employee.isRejected) throw new GQLError(ERRORS.EMPLOYEE_INVITATION_ALREADY_SENT, context)

                const existedRequest = await getByCondition('OrganizationEmployeeRequest', {
                    organization: { id: organization.id },
                    user: { id: authedItemId },
                    deletedAt: null,
                })

                let requestId = get(existedRequest, 'id')

                if (!existedRequest) {
                    const createdRequest = await OrganizationEmployeeRequest.create(context, {
                        organization: { connect: { id: organization.id } },
                        user: { connect: { id: authedItemId } },
                        dv,
                        sender,
                    })

                    requestId = createdRequest.id
                } else {
                    if (existedRequest.retries >= MAX_ORGANIZATION_EMPLOYEE_REQUEST_RETRIES - 1) throw new GQLError(ERRORS.REQUEST_TO_ORGANIZATION_LIMIT_REACHED, context)

                    const isNotProcessed = !existedRequest.isRejected && !existedRequest.isAccepted
                    if (isNotProcessed) throw new GQLError(ERRORS.REQUEST_NOT_PROCESSED, context)

                    const updatedRequest = await OrganizationEmployeeRequest.update(context, existedRequest.id, {
                        retries: existedRequest.retries + 1,
                        isAccepted: false,
                        isRejected: false,
                        processedAt: null,
                        processedBy: null,
                        dv,
                        sender,
                    })

                    requestId = updatedRequest.id
                }

                return await getById('OrganizationEmployeeRequest', requestId)
            },
        },
    ],

})

module.exports = {
    SendOrganizationEmployeeRequestService,
}
