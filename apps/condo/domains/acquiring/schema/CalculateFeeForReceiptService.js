/**
 * Generated by `createservice acquiring.CalculateFeeForReceiptService --type queries`
 */
const Big = require('big.js')
const { isNil } = require('lodash')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { GQLCustomSchema, getById, find } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/acquiring/access/CalculateFeeForReceiptService')
const {
    RESIDENT_CALCULATE_FEE_FOR_RECEIPT_WINDOW_IN_SEC,
    MAX_RESIDENT_CALCULATE_FEE_FOR_RECEIPT_WINDOW_IN_SEC_CALLS_BY_WINDOW_SEC,
} = require('@condo/domains/acquiring/constants/constants')
const { CONTEXT_FINISHED_STATUS } = require('@condo/domains/acquiring/constants/context')
const { GQL_ERRORS: { PAYMENT_AMOUNT_LESS_THAN_MINIMUM } } = require('@condo/domains/acquiring/constants/errors')
const { CANNOT_FIND_ALL_BILLING_RECEIPTS } = require('@condo/domains/acquiring/constants/errors')
const {
    getAcquiringIntegrationContextFormula,
    FeeDistribution,
} = require('@condo/domains/acquiring/utils/serverSchema/feeDistribution')
const { RESIDENT } = require('@condo/domains/user/constants/common')
const { RedisGuard } = require('@condo/domains/user/utils/serverSchema/guards')

const ERRORS = {
    PAYMENT_AMOUNT_LESS_THAN_MINIMUM: {
        ...PAYMENT_AMOUNT_LESS_THAN_MINIMUM,
        query: 'calculateFeeForReceipt',
    },
    CANNOT_FIND_BILLING_RECEIPT: {
        query: 'calculateFeeForReceipt',
        variable: ['data', 'receipt', 'id'],
        code: BAD_USER_INPUT,
        type: CANNOT_FIND_ALL_BILLING_RECEIPTS,
        message: 'Cannot find specified BillingReceipt with id {missingReceiptId}',
    },
}

const redisGuard = new RedisGuard()

const checkLimits = async (userId, context) => {
    await redisGuard.checkCustomLimitCounters(
        `calculate_fee_for_receipt:user:${userId}`,
        RESIDENT_CALCULATE_FEE_FOR_RECEIPT_WINDOW_IN_SEC,
        MAX_RESIDENT_CALCULATE_FEE_FOR_RECEIPT_WINDOW_IN_SEC_CALLS_BY_WINDOW_SEC,
        context,
    )
}

const CalculateFeeForReceiptService = new GQLCustomSchema('CalculateFeeForReceiptService', {
    types: [
        {
            access: true,
            type: 'input CalculateFeeForReceiptInput { receipt: BillingReceiptWhereUniqueInput!, amount: String! }',
        },
        {
            access: true,
            type: 'type CalculateFeeForReceiptOutput { amountWithoutExplicitFee: String!, explicitFee: String!, explicitServiceCharge: String! }',
        },
    ],
    
    queries: [
        {
            access: access.canCalculateFeeForReceipt,
            schema: 'calculateFeeForReceipt (data: CalculateFeeForReceiptInput!): CalculateFeeForReceiptOutput',
            resolver: async (parent, args, context) => {
                if (context.authedItem.type === RESIDENT) {
                    await checkLimits(context.authedItem.id)
                }

                const { data: { receipt: { id: receiptId }, amount } } = args

                const [billingReceipt] = await find('BillingReceipt', {
                    id: receiptId,
                    deletedAt: null,
                    context: {
                        deletedAt: null,
                        integration: {
                            deletedAt: null,
                        },
                    },
                })

                if (isNil(billingReceipt)) {
                    throw new GQLError({
                        ...ERRORS.CANNOT_FIND_BILLING_RECEIPT,
                        messageInterpolation: { missingReceiptId: receiptId },
                    }, context)
                }
                const billingContext = await getById('BillingIntegrationOrganizationContext', billingReceipt.context)
                const billingIntegration = await getById('BillingIntegration', billingContext.integration)
                const [acquiringContext] = await find('AcquiringIntegrationContext', {
                    organization: { id: billingContext.organization },
                    deletedAt: null,
                    status: CONTEXT_FINISHED_STATUS,
                    integration: {
                        supportedBillingIntegrationsGroup: billingIntegration.group,
                        deletedAt: null,
                    },
                })
                const acquiringIntegration = await  getById('AcquiringIntegration', acquiringContext.integration)

                const formula = await getAcquiringIntegrationContextFormula(context, acquiringContext.id)
                const feeCalculator = new FeeDistribution(formula)

                const { type, explicitFee = '0' } = feeCalculator.calculate(amount)
                const explicitFees = type === 'service'
                    ? { explicitServiceCharge: String(explicitFee), explicitFee: '0' }
                    : { explicitServiceCharge: '0', explicitFee: String(explicitFee) }

                const amountToPay = Big(amount)
                    .add(Big(explicitFees.explicitFee))
                    .add(Big(explicitFees.explicitServiceCharge))
                if (acquiringIntegration.minimumPaymentAmount && Big(amountToPay).lt(acquiringIntegration.minimumPaymentAmount)) {
                    throw new GQLError({
                        ...ERRORS.PAYMENT_AMOUNT_LESS_THAN_MINIMUM,
                        messageInterpolation: { minimumPaymentAmount: Big(acquiringIntegration.minimumPaymentAmount).toString() },
                    }, context)
                }

                return {
                    amountWithoutExplicitFee: Big(amount).toString(),
                    explicitFee: Big(explicitFees.explicitFee).toString(),
                    explicitServiceCharge: Big(explicitFees.explicitServiceCharge).toString(),
                }
            },
        },
    ],
    
})

module.exports = {
    CalculateFeeForReceiptService,
}