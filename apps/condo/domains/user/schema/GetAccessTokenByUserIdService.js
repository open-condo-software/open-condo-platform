const { validate: uuidValidate } = require('uuid')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT, INTERNAL_ERROR } } = require('@open-condo/keystone/errors')
const { GQLCustomSchema } = require('@open-condo/keystone/schema')

const { getAccessTokenForUser } = require('@condo/domains/organization/integrations/sbbol/utils')
const access = require('@condo/domains/user/access/GetAccessTokenByUserIdService')


/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const ERRORS = {
    REFRESH_TOKEN_EXPIRED: {
        query: 'GetAccessTokenByUserIdService',
        code: INTERNAL_ERROR,
        type: 'REFRESH_TOKEN_EXPIRED',
        message: 'SBBOL user refreshToken expired',
        messageForUser: 'api.user.getAccessTokenByUserId.REFRESH_TOKEN_EXPIRED',
    },
    INVALID_USER_ID: {
        query: 'GetAccessTokenByUserIdService',
        code: BAD_USER_INPUT,
        type: 'INVALID_USER_ID',
        message: 'Received userId must be uuid',
        messageForUser: 'api.user.getAccessTokenByUserId.INVALID_USER_ID',
    },
    ERROR_GETTING_ACCESS_TOKEN: {
        query: 'GetAccessTokenByUserIdService',
        code: INTERNAL_ERROR,
        type: 'ERROR_GETTING_ACCESS_TOKEN',
        message: 'Unresolved error in getAccessTokenForUser',
        messageForUser: 'api.user.getAccessTokenByUserId.ERROR_GETTING_ACCESS_TOKEN',
    },
}

const GetAccessTokenByUserIdService = new GQLCustomSchema('GetAccessTokenByUserIdService', {
    types: [
        {
            access: true,
            type: 'input GetAccessTokenByUserIdInput { userId: ID!, type: String! }',
        },
        {
            access: true,
            type: 'type GetAccessTokenByUserIdOutput { accessToken: ID!, ttl: Int! }',
        },
    ],

    queries: [
        {
            access: access.canGetAccessTokenByUserId,
            doc: {
                description: 'To get a token for a specific user, you need to call this query, specifying the required integration type and userId in the parameters. ' +
                    'To pass the rights check, you need to request on behalf of the service user, ' +
                    'and also have an entry in the ExternalTokenAccessRight table that regulates access to tokens of different integrations',
                errors: ERRORS,
            },
            schema: 'getAccessTokenByUserId (data: GetAccessTokenByUserIdInput!): GetAccessTokenByUserIdOutput',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data } = args
                if (!uuidValidate(data.userId)) throw new GQLError(ERRORS.INVALID_USER_ID, context)

                let accessToken, ttl

                try {
                    ({ accessToken, ttl } = await getAccessTokenForUser(data.userId))
                } catch (e) {
                    if (e.message.includes('refreshToken')) {
                        throw new GQLError(ERRORS.REFRESH_TOKEN_EXPIRED, context)
                    }
                    throw new GQLError(ERRORS.ERROR_GETTING_ACCESS_TOKEN, context)
                }

                return { accessToken, ttl }
            },
        },
    ],

})

module.exports = {
    GetAccessTokenByUserIdService,
}