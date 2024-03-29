/**
 * Generated by `createschema acquiring.RecurrentPaymentContext 'limit:Text;paymentDay:Integer;settings:Json;billingCategories:Json'`
 */

const access = require('@open-condo/keystone/access')
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

const { RESIDENT } = require('@condo/domains/user/constants/common')

const userFilter = (id) => ({ serviceConsumer: { resident: { user: { id } } } })

async function canReadRecurrentPaymentContexts ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    if (user.type === RESIDENT) {
        return userFilter(user.id)
    }

    return false
}

async function canManageRecurrentPaymentContexts ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true
    if (user.isSupport && access.isSoftDelete(originalInput)) {
        return true
    }

    if (user.type === RESIDENT){
        if (operation === 'create') {
            return true
        } else if (operation === 'update') {
            return userFilter(user.id)
        }
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadRecurrentPaymentContexts,
    canManageRecurrentPaymentContexts,
}
