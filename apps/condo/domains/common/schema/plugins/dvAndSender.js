const { composeNonResolveInputHook } = require('@core/keystone/plugins/utils')
const { plugin } = require('@core/keystone/plugins/utils/typing')

const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const { hasDvAndSenderFields } = require('@condo/domains/common/utils/validation.utils')
const { DV_UNKNOWN_VERSION_ERROR } = require('@condo/domains/common/constants/errors')

const dvAndSender = ({ requiredDv = 1 } = {}) => plugin(({ fields = {}, hooks = {}, ...rest }) => {
    const dvField = 'dv'
    const senderField = 'sender'

    fields[dvField] = DV_FIELD
    fields[senderField] = SENDER_FIELD

    const newValidateInput = ({ resolvedData, context, addValidationError }) => {
        if (!hasDvAndSenderFields(resolvedData, context, addValidationError)) return
        const { dv } = resolvedData
        if (dv !== requiredDv) {
            // NOTE: version 1 specific translations. Don't optimize this logic
            return addValidationError(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown \`dv\``)
        }
    }

    const originalValidateInput = hooks.validateInput
    hooks.validateInput = composeNonResolveInputHook(originalValidateInput, newValidateInput)
    return { fields, hooks, ...rest }
})

module.exports = {
    dvAndSender,
}
