/**
 * Generated by `createservice miniapp.SendB2BAppPushMessageService '--type=mutations'`
 */

const { URL } = require('url')

const { get } = require('lodash')
const pick = require('lodash/pick')

const conf = require('@open-condo/config')
const { GQLError, GQLErrorCode: { FORBIDDEN, BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { GQLCustomSchema, getByCondition } = require('@open-condo/keystone/schema')

const { NOT_FOUND, WRONG_VALUE } = require('@condo/domains/common/constants/errors')
const { isSafeUrl } = require('@condo/domains/common/utils/url.utils')
const access = require('@condo/domains/miniapp/access/SendB2BAppPushMessageService')
const {
    CONTEXT_FINISHED_STATUS,
    DEFAULT_NOTIFICATION_WINDOW_DURATION_IN_SECONDS,
    DEFAULT_NOTIFICATION_WINDOW_MAX_COUNT,
} = require('@condo/domains/miniapp/constants')
const { B2B_APP_MESSAGE_TYPES, MESSAGE_META } = require('@condo/domains/notification/constants/constants')
const { sendMessage } = require('@condo/domains/notification/utils/serverSchema')
const { RedisGuard } = require('@condo/domains/user/utils/serverSchema/guards')


function isValidUrl (inputUrl) {
    try {
        if (!isSafeUrl(inputUrl)) {
            return false
        }

        const parsedUrl = new URL(inputUrl)
        return parsedUrl.origin === conf.SERVER_URL
    } catch (e) {
        return false
    }
}

const redisGuard = new RedisGuard()
/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const ERRORS = {
    NO_B2B_CONTEXT: {
        mutation: 'sendB2BAppPushMessage',
        variable: ['data', 'app'],
        code: FORBIDDEN,
        type: NOT_FOUND,
        message: 'No completed B2BContext in "Finished" status found for the provided organization and B2BApp.',
    },
    NO_B2B_APP_ACCESS_RIGHT: {
        mutation: 'sendB2BAppPushMessage',
        variable: ['data', 'app'],
        code: FORBIDDEN,
        type: NOT_FOUND,
        message: 'No B2BAppAccessRight found for the provided user and B2BApp.',
    },
    USER_IS_NOT_AN_EMPLOYEE: {
        mutation: 'sendB2BAppPushMessage',
        variable: ['data', 'user'],
        code: FORBIDDEN,
        type: NOT_FOUND,
        message: 'The provided user is not an employee of the specified organization.',
    },
    NO_B2B_APP_ROLE_FOR_EMPLOYEE_ROLE_AND_B2B_APP: {
        mutation: 'sendB2BAppPushMessage',
        code: FORBIDDEN,
        type: NOT_FOUND,
        message: 'No B2BAppRole found for the provided user, organization and B2BApp',
    },
    INVALID_URL: {
        mutation: 'sendB2BAppPushMessage',
        variable: ['data', 'meta', 'data', 'url'],
        code: BAD_USER_INPUT,
        type: WRONG_VALUE,
        message: 'Invalid URL: must start with server url and be safe',
    },
}

const SendB2BAppPushMessageService = new GQLCustomSchema('SendB2BAppPushMessageService', {
    types: [
        {
            access: true,
            type: `enum B2BAppMessageType { ${B2B_APP_MESSAGE_TYPES.join(' ')} }`,
        },
        {
            access: true,
            type: 'input SendB2BAppPushMessageInput { dv: Int!, sender: SenderFieldInput!, user: UserWhereUniqueInput!, organization: OrganizationWhereUniqueInput!, app: B2BAppWhereUniqueInput!, type: B2BAppMessageType!, meta: JSON!, }',
        },
        {
            access: true,
            type: 'type SendB2BAppPushMessageOutput { status: String!, id: String! }',
        },
    ],
    
    mutations: [
        {
            access: access.canSendB2BAppPushMessage,
            schema: 'sendB2BAppPushMessage(data: SendB2BAppPushMessageInput!): SendB2BAppPushMessageOutput',
            doc: {
                summary: 'Sends message of specified type from B2BApp (service user connected to B2BApp) to specified employee (user in organization)',
                description: `
                    B2BApp must has finished context with organization and B2BAccessRight with B2BAccessRightSet with canExecuteSendB2BAppPushMessage right 
                    between service user (who make request) and B2BApp. Employee must has a B2BAppRole with B2BApp. 
                    Settings for each type of message contains in AppMessageSetting schema.
                    Each message type has specific set of required fields which are defined in the meta field: \n\n\`${JSON.stringify(pick(MESSAGE_META, B2B_APP_MESSAGE_TYPES), null, '\t')}\`
                `,
                errors: ERRORS,
            },
            resolver: async (parent, args, context) => {
                const {
                    data: {
                        dv,
                        sender,
                        user: userFilter,
                        organization: organizationFilter,
                        app: b2bAppFilter,
                        type,
                        meta,
                    },
                } = args
                const authedItemId = get(context, 'authedItem.id', null)

                if (meta.data?.url && !isValidUrl(meta.data.url)) {
                    throw new GQLError(ERRORS.INVALID_URL, context)
                }

                const appSettings = await getByCondition('AppMessageSetting', {
                    b2bApp: { ...b2bAppFilter, deletedAt: null },
                    type,
                    deletedAt: null,
                })

                await redisGuard.checkCustomLimitCounters(
                    `sendB2BAppPushMessage:app:${b2bAppFilter.id}:${type}:org:${organizationFilter.id}:user:${userFilter.id}`,
                    get(appSettings, 'notificationWindowSize') ?? DEFAULT_NOTIFICATION_WINDOW_DURATION_IN_SECONDS,
                    get(appSettings, 'numberOfNotificationInWindow') ?? DEFAULT_NOTIFICATION_WINDOW_MAX_COUNT,
                    context,
                )

                const user = await getByCondition('User', {
                    ...userFilter,
                    deletedAt: null,
                })
                if (!user) {
                    throw new GQLError(ERRORS.USER_IS_NOT_AN_EMPLOYEE, context)
                }
                const messageLocale = get(user, 'locale', conf.DEFAULT_LOCALE)

                const b2bAppContext = await getByCondition('B2BAppContext', {
                    organization: { ...organizationFilter, deletedAt: null },
                    app: { ...b2bAppFilter, deletedAt: null },
                    status: CONTEXT_FINISHED_STATUS,
                    deletedAt: null,
                })
                if (!b2bAppContext) {
                    throw new GQLError(ERRORS.NO_B2B_CONTEXT, context)
                }

                const b2bAppAccessRight = await getByCondition('B2BAppAccessRight', {
                    accessRightSet: {
                        app: { ...b2bAppFilter, deletedAt: null },
                        canExecuteSendB2BAppPushMessage: true,
                        deletedAt: null,
                    },
                    user: { id: authedItemId, deletedAt: null },
                    deletedAt: null,
                })
                if (!b2bAppAccessRight) {
                    throw new GQLError(ERRORS.NO_B2B_APP_ACCESS_RIGHT, context)
                }

                const employee = await getByCondition('OrganizationEmployee', {
                    organization: { ...organizationFilter, deletedAt: null },
                    user: { ...userFilter, deletedAt: null },
                    isAccepted: true,
                    isRejected: false,
                    isBlocked: false,
                    deletedAt: null,
                })
                if (!employee) {
                    throw new GQLError(ERRORS.USER_IS_NOT_AN_EMPLOYEE, context)
                }

                const roleId = get(employee, 'role', null)
                const b2bAppRole = await getByCondition('B2BAppRole', {
                    deletedAt: null,
                    app: { ...b2bAppFilter, deletedAt: null },
                    role: { id: roleId, deletedAt: null },
                })
                if (!roleId || !b2bAppRole) {
                    throw new GQLError(ERRORS.NO_B2B_APP_ROLE_FOR_EMPLOYEE_ROLE_AND_B2B_APP, context)
                }

                const { id, status } = await sendMessage(context, {
                    to: { user: userFilter },
                    organization: organizationFilter,
                    type,
                    lang: messageLocale,
                    meta,
                    dv,
                    sender,
                })

                return {
                    id,
                    status,
                }
            },
        },
    ],
    
})

module.exports = {
    SendB2BAppPushMessageService,
    ERRORS,
}
