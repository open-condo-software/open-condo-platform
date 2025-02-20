/**
 * Generated by `createservice miniapp.AllOrganizationAppsService --type queries`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { execGqlWithoutAccess, generateServerUtils } = require('@open-condo/codegen/generate.server.utils')

const {
    ALL_MINI_APPS_QUERY,
    SEND_B2C_APP_PUSH_MESSAGE_MUTATION,
} = require('@condo/domains/miniapp/gql')
const { SEND_B2B_APP_PUSH_MESSAGE_MUTATION } = require('@condo/domains/miniapp/gql')
/* AUTOGENERATE MARKER <IMPORT> */

async function allOrganizationApps (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: ALL_MINI_APPS_QUERY,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to allOrganizationApps',
        dataPath: 'obj',
    })
}

async function sendB2CAppPushMessage (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: SEND_B2C_APP_PUSH_MESSAGE_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to sendB2CAppPushMessage',
        dataPath: 'result',
    })
}

const B2BApp = generateServerUtils('B2BApp')
const B2BAppContext = generateServerUtils('B2BAppContext')
const B2BAppAccessRight = generateServerUtils('B2BAppAccessRight')
const B2CApp = generateServerUtils('B2CApp')
const B2CAppAccessRight = generateServerUtils('B2CAppAccessRight')
const B2CAppBuild = generateServerUtils('B2CAppBuild')
const B2CAppProperty = generateServerUtils('B2CAppProperty')
const B2BAppPromoBlock = generateServerUtils('B2BAppPromoBlock')
const MessageAppBlackList = generateServerUtils('MessageAppBlackList')
const B2BAppPermission = generateServerUtils('B2BAppPermission')
const B2BAppRole = generateServerUtils('B2BAppRole')
const B2BAppAccessRightSet = generateServerUtils('B2BAppAccessRightSet')
const B2BAppNewsSharingConfig = generateServerUtils('B2BAppNewsSharingConfig')
const AppMessageSetting = generateServerUtils('AppMessageSetting')
const B2BAccessToken = generateServerUtils('B2BAccessToken')
async function sendB2BAppPushMessage (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: SEND_B2B_APP_PUSH_MESSAGE_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to sendB2BAppPushMessage',
        dataPath: 'obj',
    })
}

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    allOrganizationApps,
    B2BApp,
    B2BAppContext,
    B2BAppAccessRight,
    B2BAppPermission,
    B2BAppPromoBlock,
    B2BAppRole,
    B2CApp,
    B2CAppAccessRight,
    B2CAppBuild,
    B2CAppProperty,
    sendB2CAppPushMessage,
    MessageAppBlackList,
    B2BAppAccessRightSet,
    B2BAppNewsSharingConfig,
    B2BAccessToken,
    AppMessageSetting,
    sendB2BAppPushMessage,
/* AUTOGENERATE MARKER <EXPORTS> */
}
