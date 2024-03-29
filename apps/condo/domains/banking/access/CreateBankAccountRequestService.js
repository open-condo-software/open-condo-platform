/**
 * Generated by `createservice banking.CreateBankAccountRequestService '--type=mutations'`
 */
const get = require('lodash/get')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

const { checkOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')

async function canCreateBankAccountRequest ({ authentication: { item: user }, args: { data } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    const organizationId = get(data, 'organizationId')
    if (!organizationId) return false

    return await checkOrganizationPermission(user.id, organizationId, 'canManageBankAccounts')
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canCreateBankAccountRequest,
}
