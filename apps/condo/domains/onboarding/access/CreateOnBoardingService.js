/**
 * Generated by `createservice onboarding.CreateOnBoardingService`
 */

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

async function canCreateOnBoarding ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return true
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canCreateOnBoarding,
}