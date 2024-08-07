/**
 * Generated by `createservice billing.AllResidentBillingVirtualReceiptsService --type queries`
 */

const { get } = require('lodash')

const { makeClient } = require('@open-condo/keystone/test.utils')
const { expectToThrowAuthenticationErrorToObjects } = require('@open-condo/keystone/test.utils')

const { CONTEXT_FINISHED_STATUS } = require('@condo/domains/acquiring/constants/context')
const {
    PAYMENT_INIT_STATUS,
    PAYMENT_PROCESSING_STATUS,
    PAYMENT_WITHDRAWN_STATUS,
    PAYMENT_DONE_STATUS,
    PAYMENT_ERROR_STATUS,
} = require('@condo/domains/acquiring/constants/payment')
const {
    makePayer,
    createTestPayment,
    updateTestAcquiringIntegrationContext,
    AcquiringIntegrationContext,
} = require('@condo/domains/acquiring/utils/testSchema')
const { DEFAULT_BILLING_CATEGORY_ID } = require('@condo/domains/billing/constants/constants')
const { ResidentBillingVirtualReceipt,
    createTestRecipient,
    createTestBillingAccount,
} = require('@condo/domains/billing/utils/testSchema')
const { INVOICE_STATUS_PUBLISHED } = require('@condo/domains/marketplace/constants')
const { createTestInvoice } = require('@condo/domains/marketplace/utils/testSchema')
const { createTestServiceConsumer } = require('@condo/domains/resident/utils/testSchema')


const getPayableOrgWithClient = async () => {
    const data = await makePayer()
    await updateTestAcquiringIntegrationContext(data.admin, data.acquiringContext.id, {
        recipient: createTestRecipient(),
    })
    return data
}

const prepareVirtualPayment = async () => {
    const data = await getPayableOrgWithClient()

    const [payment] = await createTestPayment(data.admin, data.organization, null, data.acquiringContext, {
        status: PAYMENT_DONE_STATUS,
        accountNumber: data.serviceConsumer.accountNumber,
    })

    return {
        ...data,
        payment,
    }
}

const isPaymentInsideReceipts = (receipts, payment, { id: serviceConsumerId } ) => {
    return receipts.some(({ id, serviceConsumer }) => id === payment.id && serviceConsumer.id === serviceConsumerId )
}

describe('AllResidentBillingVirtualReceiptsService', () => {
    describe('Access control', () => {
        let admin, client, payment, serviceConsumer

        beforeAll(async () => {
            const data = await prepareVirtualPayment()
            admin = data.admin
            client = data.client
            payment = data.payment
            serviceConsumer = data.serviceConsumer
        })

        test('user: can read virtual receipt', async () => {
            const receipts = await ResidentBillingVirtualReceipt.getAll(client)
            expect(isPaymentInsideReceipts(receipts, payment, serviceConsumer)).toBeTruthy()
        })

        test('user: can not read virtual receipt for another user', async () => {
            const { client } = await makePayer()
            const receipts = await ResidentBillingVirtualReceipt.getAll(client)
            expect(isPaymentInsideReceipts(receipts, payment, serviceConsumer)).toBeFalsy()
        })

        test('anonymous: can not execute', async () => {
            const anonymous = await makeClient()
            await expectToThrowAuthenticationErrorToObjects(async () => {
                await ResidentBillingVirtualReceipt.getAll(anonymous)
            })
        })

        test('admin: can read empty list since do not have service consumer', async () => {
            const receipts = await ResidentBillingVirtualReceipt.getAll(admin)
            expect(receipts).toHaveLength(0)
        })
    })

    describe('Filter by where input', () => {
        let admin, client, payment, serviceConsumer, anotherServiceConsumer,
            paymentWithSpecificPeriod, paymentWithSpecificToPay, paymentWithAccount

        beforeAll(async () => {
            const data = await prepareVirtualPayment()
            admin = data.admin
            client = data.client
            payment = data.payment
            serviceConsumer = data.serviceConsumer
            const [billingAccount] = await createTestBillingAccount(admin, data.billingContext, data.billingProperty)
            anotherServiceConsumer = (await createTestServiceConsumer(admin, data.resident, data.organization, {
                accountNumber: billingAccount.number,
                acquiringIntegrationContext: { connect: { id: data.acquiringContext.id } },
                billingIntegrationContext: { connect: { id: data.billingContext.id } },
            }))[0]

            // init specific payments
            paymentWithSpecificToPay = (await createTestPayment(
                admin,
                data.organization,
                null,
                data.acquiringContext, { status: PAYMENT_DONE_STATUS,
                    accountNumber: data.serviceConsumer.accountNumber }
            ))[0]
            paymentWithSpecificPeriod = (await createTestPayment(
                admin,
                data.organization,
                null,
                data.acquiringContext, { status: PAYMENT_DONE_STATUS,
                    accountNumber: data.serviceConsumer.accountNumber, period: '2020-01-01' }
            ))[0]
            paymentWithAccount = (await createTestPayment(
                admin,
                data.organization,
                null,
                data.acquiringContext, { status: PAYMENT_DONE_STATUS,
                    accountNumber: anotherServiceConsumer.accountNumber }
            ))[0]
        })

        test('read by id', async () => {
            const receipts = await ResidentBillingVirtualReceipt.getAll(client, {
                id: payment.id,
            })
            expect(isPaymentInsideReceipts(receipts, payment, serviceConsumer)).toBeTruthy()
        })

        test('read by period', async () => {
            const receipts = await ResidentBillingVirtualReceipt.getAll(client, {
                period: paymentWithSpecificPeriod.period,
            })
            expect(isPaymentInsideReceipts(receipts, paymentWithSpecificPeriod, serviceConsumer)).toBeTruthy()
        })

        test('read by toPay', async () => {
            const receipts = await ResidentBillingVirtualReceipt.getAll(client, {
                toPay: paymentWithSpecificToPay.amount,
            })
            expect(isPaymentInsideReceipts(receipts, paymentWithSpecificToPay, serviceConsumer)).toBeTruthy()
        })

        test('read by printableNumber', async () => {
            const receipts = await ResidentBillingVirtualReceipt.getAll(client, {
                printableNumber: anotherServiceConsumer.accountNumber,
            })
            expect(isPaymentInsideReceipts(receipts, paymentWithAccount, anotherServiceConsumer)).toBeTruthy()
        })
    })

    describe('Retrieving logic', () => {
        test('Structure and data are valid', async () => {
            const data = await prepareVirtualPayment()
            const receipts = await ResidentBillingVirtualReceipt.getAll(data.client)
            const aic = await AcquiringIntegrationContext.getOne(data.admin, {
                id: data.acquiringContext.id,
            })
            
            // asserts
            const receipt = receipts.find(({ id }) => data.payment.id)
            expect(isPaymentInsideReceipts(receipts, data.payment, data.serviceConsumer)).toBeTruthy()
            expect(receipt).toBeTruthy()
            expect(receipt).toMatchObject({
                recipient: aic.recipient,
                id: data.payment.id,
                period: data.payment.period,
                toPay: data.payment.amount,
                paid: 'true',
                explicitFee: data.payment.explicitFee,
                printableNumber: data.payment.accountNumber,
                services: [],
                serviceConsumer: {
                    id: data.serviceConsumer.id,
                },
                currencyCode: data.payment.currencyCode,
                category: { id: DEFAULT_BILLING_CATEGORY_ID },
                isPayable: false,
            })
        })
        
        test('Do not return payments with connected receipts', async () => {
            const data = await getPayableOrgWithClient()

            const [payment] = await createTestPayment(
                data.admin,
                data.organization,
                data.billingReceipts[0],
                data.acquiringContext,
                { status: PAYMENT_DONE_STATUS, accountNumber: data.serviceConsumer.accountNumber }
            )

            const receipts = await ResidentBillingVirtualReceipt.getAll(data.client)
            expect(receipts).toHaveLength(0)
        })

        test('Do not return payments with connected invoices', async () => {
            const data = await getPayableOrgWithClient()

            // for invoice payment it is required to have aic in finished status
            await updateTestAcquiringIntegrationContext(data.admin, data.acquiringContext.id, {
                invoiceStatus: CONTEXT_FINISHED_STATUS,
            })

            const [invoice] = await createTestInvoice(data.admin, { id: data.organization.id }, {
                status: INVOICE_STATUS_PUBLISHED,
                client: { connect: { id: data.client.user.id } },
            })

            const [payment] = await createTestPayment(
                data.admin,
                data.organization,
                null,
                data.acquiringContext,
                { status: PAYMENT_DONE_STATUS, accountNumber: data.serviceConsumer.accountNumber, invoice }
            )

            const receipts = await ResidentBillingVirtualReceipt.getAll(data.client)
            expect(receipts).toHaveLength(0)
        })

        test('Return payments with init statuses', async () => {
            const data = await getPayableOrgWithClient()

            const [payment] = await createTestPayment(
                data.admin,
                data.organization,
                null,
                data.acquiringContext,
                { status: PAYMENT_INIT_STATUS, accountNumber: data.serviceConsumer.accountNumber }
            )

            const receipts = await ResidentBillingVirtualReceipt.getAll(data.client)
            expect(receipts).toHaveLength(1)
        })

        test('Return payments with processing statuses', async () => {
            const data = await getPayableOrgWithClient()

            const [payment] = await createTestPayment(
                data.admin,
                data.organization,
                null,
                data.acquiringContext,
                { status: PAYMENT_PROCESSING_STATUS, accountNumber: data.serviceConsumer.accountNumber }
            )

            const receipts = await ResidentBillingVirtualReceipt.getAll(data.client)
            expect(receipts).toHaveLength(1)
        })

        test('Return payments with withdraw statuses', async () => {
            const data = await getPayableOrgWithClient()

            const [payment] = await createTestPayment(
                data.admin,
                data.organization,
                null,
                data.acquiringContext,
                { status: PAYMENT_WITHDRAWN_STATUS, accountNumber: data.serviceConsumer.accountNumber }
            )

            const receipts = await ResidentBillingVirtualReceipt.getAll(data.client)
            expect(receipts).toHaveLength(1)
        })

        test('Return payments with done statuses', async () => {
            const data = await getPayableOrgWithClient()

            const [payment] = await createTestPayment(
                data.admin,
                data.organization,
                null,
                data.acquiringContext,
                { status: PAYMENT_DONE_STATUS, accountNumber: data.serviceConsumer.accountNumber }
            )

            const receipts = await ResidentBillingVirtualReceipt.getAll(data.client)
            expect(receipts).toHaveLength(1)
        })

        test('Do not return payments with error statuses', async () => {
            const data = await getPayableOrgWithClient()

            const [payment] = await createTestPayment(
                data.admin,
                data.organization,
                null,
                data.acquiringContext,
                { status: PAYMENT_ERROR_STATUS, accountNumber: data.serviceConsumer.accountNumber }
            )

            const receipts = await ResidentBillingVirtualReceipt.getAll(data.client)
            expect(receipts).toHaveLength(0)
        })
    })
})