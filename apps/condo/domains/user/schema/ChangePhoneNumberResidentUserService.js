/**
 * Generated by `createservice user.ChangePhoneNumberResidentUserService`
 */

const { GQLCustomSchema } = require('@core/keystone/schema')
const access = require('@condo/domains/user/access/ChangePhoneNumberResidentUserService')
const { ConfirmPhoneAction, User } = require('@condo/domains/user/utils/serverSchema')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@core/keystone/errors')
const { NOT_FOUND, DV_VERSION_MISMATCH } = require('@condo/domains/common/constants/errors')

/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const errors = {
    UNABLE_TO_FIND_CONFIRM_PHONE_ACTION: {
        code: BAD_USER_INPUT,
        type: NOT_FOUND,
        mutation: 'changePhoneNumberResidentUser',
        message: 'Unable to find a non-expired confirm phone action, that corresponds to provided token',
        variable: ['data', 'token'],
        messageForUser: 'api.user.changePhoneNumberResidentUser.UNABLE_TO_FIND_CONFIRM_PHONE_ACTION',
    },
    DV_VERSION_MISMATCH: {
        mutation: 'changePhoneNumberResidentUser',
        variable: ['data', 'dv'],
        code: BAD_USER_INPUT,
        type: DV_VERSION_MISMATCH,
        message: 'Wrong value for data version number',
    },
}

const ChangePhoneNumberResidentUserService = new GQLCustomSchema('ChangePhoneNumberResidentUserService', {
    types: [
        {
            access: true,
            type: 'input ChangePhoneNumberResidentUserInput { dv: Int!, sender: SenderFieldInput!, token: String! }',
        },
        {
            access: true,
            type: 'type ChangePhoneNumberResidentUserOutput { status: String! }',
        },
    ],

    mutations: [
        {
            access: access.canChangePhoneNumberResidentUser,
            schema: 'changePhoneNumberResidentUser(data: ChangePhoneNumberResidentUserInput!): ChangePhoneNumberResidentUserOutput',
            doc: {
                summary: 'Changes a phone of a resident, that corresponds to confirmed phone number, specified via token',
                errors,
            },
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data: { token, dv, sender } } = args
                if (dv !== 1) throw new GQLError(errors.DV_VERSION_MISMATCH, context)
                if (!context.authedItem.id) throw new Error('Internal error inside the access check. We assume that the user should exists!')
                const userId = context.authedItem.id
                const action = await ConfirmPhoneAction.getOne(context,
                    {
                        expiresAt_gte: new Date().toISOString(),
                        token,
                        completedAt: null,
                        isPhoneVerified: true,
                    }
                )
                if (!action) {
                    throw new GQLError(errors.UNABLE_TO_FIND_CONFIRM_PHONE_ACTION, context)
                }
                const { phone, isPhoneVerified } = action
                await User.update(context, userId, { sender, phone, isPhoneVerified, dv: 1 })
                await ConfirmPhoneAction.update(context, action.id, { completedAt: new Date().toISOString(), sender, dv: 1 })
                return {
                    status: 'ok',
                }
            },
        },
    ],

})

module.exports = {
    ChangePhoneNumberResidentUserService,
}
