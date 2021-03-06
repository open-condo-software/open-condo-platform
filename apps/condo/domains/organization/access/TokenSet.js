/**
 * Generated by `createschema organization.TokenSet 'user:Relationship:User:SET_NULL; organization:Relationship:Organization:SET_NULL; importRemoteSystem:Text; accessToken:Text; accessTokenExpiresAt:DateTimeUtc; refreshToken:Text; refreshTokenExpiresAt:DateTimeUtc;'`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canReadTokenSets ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return !!user.isAdmin
}

async function canManageTokenSets ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return !!user.isAdmin
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTokenSets,
    canManageTokenSets,
}
