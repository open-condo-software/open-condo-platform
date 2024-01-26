/**
 * Generated by `createservice acquiring.RegisterMultiPaymentForInvoicesService '--type=mutations' 'invoices:[InvoiceWhereUniqueInput!]!'`
 */

const { faker } = require('@faker-js/faker')
const Big = require('big.js')
const dayjs = require('dayjs')
const { pick } = require('lodash')

const {
    makeLoggedInAdminClient,
    makeClient,
    expectToThrowAuthenticationError,
    expectToThrowAccessDeniedErrorToResult,
} = require('@open-condo/keystone/test.utils')
const { expectToThrowGQLError } = require('@open-condo/keystone/test.utils')

const { CONTEXT_FINISHED_STATUS, CONTEXT_IN_PROGRESS_STATUS } = require('@condo/domains/acquiring/constants/context')
const {
    registerMultiPaymentForInvoicesByTestClient,
    updateTestAcquiringIntegration, Payment, MultiPayment, createTestAcquiringIntegrationContext,
    updateTestAcquiringIntegrationContext,
} = require('@condo/domains/acquiring/utils/testSchema')
const { createTestAcquiringIntegration } = require('@condo/domains/acquiring/utils/testSchema')
const { createTestBillingIntegration, createTestRecipient } = require('@condo/domains/billing/utils/testSchema')
const { INVOICE_STATUS_PUBLISHED } = require('@condo/domains/marketplace/constants')
const { createTestInvoice, updateTestInvoice } = require('@condo/domains/marketplace/utils/testSchema')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithResidentUser } = require('@condo/domains/user/utils/testSchema')

describe('RegisterMultiPaymentForInvoicesService', () => {
    let adminClient, anonymousClient
    let acquiringIntegration

    beforeAll(async () => {
        adminClient = await makeLoggedInAdminClient()
        anonymousClient = await makeClient()
        await createTestBillingIntegration(adminClient)
        ;[acquiringIntegration] = await createTestAcquiringIntegration(adminClient, { canGroupReceipts: true })
    })

    describe('execute', () => {
        test('user', async () => {
            const client = await makeClientWithResidentUser()
            await expectToThrowAccessDeniedErrorToResult(async () => {
                await registerMultiPaymentForInvoicesByTestClient(client, {
                    invoices: [{ id: faker.datatype.uuid() }],
                })
            })
        })

        test('anonymous', async () => {
            await expectToThrowAuthenticationError(async () => {
                await registerMultiPaymentForInvoicesByTestClient(anonymousClient, {
                    invoices: [{ id: faker.datatype.uuid() }],
                })
            }, 'result')
        })

        test('admin', async () => {
            const id = faker.datatype.uuid()

            await expectToThrowGQLError(
                async () => await registerMultiPaymentForInvoicesByTestClient(adminClient, {
                    invoices: [{ id }],
                }),
                {
                    code: 'BAD_USER_INPUT',
                    type: 'NOT_FOUND',
                    message: 'Invoices not found: {ids}',
                    messageInterpolation: { ids: id },
                },
                'result',
            )
        })
    })

    describe('validations', () => {
        test('error on duplicates', async () => {
            const id = faker.datatype.uuid()

            await expectToThrowGQLError(
                async () => await registerMultiPaymentForInvoicesByTestClient(adminClient, {
                    invoices: [{ id }, { id }],
                }),
                {
                    code: 'BAD_USER_INPUT',
                    type: 'NOT_UNIQUE',
                    message: 'Found duplicated invoices',
                },
                'result',
            )
        })

        test('error on deleted invoices', async () => {
            const [o10n] = await createTestOrganization(adminClient)
            await createTestAcquiringIntegrationContext(adminClient, o10n, acquiringIntegration, { invoiceStatus: CONTEXT_FINISHED_STATUS })
            const [invoice1] = await createTestInvoice(adminClient, o10n)
            const [invoice2] = await createTestInvoice(adminClient, o10n)

            await updateTestInvoice(adminClient, invoice1.id, { deletedAt: dayjs().toISOString() })
            await updateTestInvoice(adminClient, invoice2.id, { deletedAt: dayjs().toISOString() })

            await expectToThrowGQLError(
                async () => await registerMultiPaymentForInvoicesByTestClient(adminClient, {
                    invoices: [pick(invoice1, 'id'), pick(invoice2, 'id')],
                }),
                {
                    code: 'BAD_USER_INPUT',
                    type: 'NOT_FOUND',
                    message: 'Some of specified invoices with ids {ids} were deleted, so you cannot pay for them anymore',
                    messageInterpolation: { ids: [invoice1.id, invoice2.id].sort().join(',') },
                },
                'result',
            )
        })

        test('error on multiple invoice contexts', async () => {
            const [o10n1] = await createTestOrganization(adminClient)
            const [o10n2] = await createTestOrganization(adminClient)
            await createTestAcquiringIntegrationContext(adminClient, o10n1, acquiringIntegration, { invoiceStatus: CONTEXT_FINISHED_STATUS })
            const [acquiringIntegration2] = await createTestAcquiringIntegration(adminClient)
            await createTestAcquiringIntegrationContext(adminClient, o10n2, acquiringIntegration2, { invoiceStatus: CONTEXT_FINISHED_STATUS })
            const [invoice1] = await createTestInvoice(adminClient, o10n1)
            const [invoice2] = await createTestInvoice(adminClient, o10n2)

            await expectToThrowGQLError(
                async () => await registerMultiPaymentForInvoicesByTestClient(adminClient, {
                    invoices: [pick(invoice1, 'id'), pick(invoice2, 'id')],
                }),
                {
                    code: 'BAD_USER_INPUT',
                    type: 'MULTIPLE_ACQUIRING_INTEGRATION_CONTEXTS',
                    message: 'Listed serviceConsumers are linked to different acquiring integrations',
                },
                'result',
            )
        })

        test('error on deleted acquiring integration', async () => {
            const [o10n] = await createTestOrganization(adminClient)
            const [acquiringIntegration2] = await createTestAcquiringIntegration(adminClient)
            await createTestAcquiringIntegrationContext(adminClient, o10n, acquiringIntegration2, { invoiceStatus: CONTEXT_FINISHED_STATUS })
            const [invoice] = await createTestInvoice(adminClient, o10n)
            await updateTestAcquiringIntegration(adminClient, acquiringIntegration2.id, { deletedAt: dayjs().toISOString() })

            await expectToThrowGQLError(
                async () => await registerMultiPaymentForInvoicesByTestClient(adminClient, {
                    invoices: [pick(invoice, 'id')],
                }),
                {
                    code: 'BAD_USER_INPUT',
                    type: 'ACQUIRING_INTEGRATION_IS_DELETED',
                    message: 'Cannot pay via deleted acquiring integration with id "{id}"',
                    messageInterpolation: { id: acquiringIntegration2.id },
                },
                'result',
            )
        })

        test('error on unpublished invoices', async () => {
            const [o10n] = await createTestOrganization(adminClient)
            await createTestAcquiringIntegrationContext(adminClient, o10n, acquiringIntegration, { invoiceStatus: CONTEXT_FINISHED_STATUS })
            const [invoice1] = await createTestInvoice(adminClient, o10n, { status: INVOICE_STATUS_PUBLISHED })
            const [invoice2] = await createTestInvoice(adminClient, o10n)

            await expectToThrowGQLError(
                async () => await registerMultiPaymentForInvoicesByTestClient(adminClient, {
                    invoices: [pick(invoice1, 'id'), pick(invoice2, 'id')],
                }),
                {
                    code: 'BAD_USER_INPUT',
                    type: 'INVOICES_ARE_NOT_PUBLISHED',
                    message: 'Found invoices with not "published" status',
                },
                'result',
            )
        })

        test('error on not unique invoice.client', async () => {
            const [o10n] = await createTestOrganization(adminClient)
            await createTestAcquiringIntegrationContext(adminClient, o10n, acquiringIntegration, { invoiceStatus: CONTEXT_FINISHED_STATUS })
            const residentClient = await makeClientWithResidentUser()
            const [invoice1] = await createTestInvoice(adminClient, o10n, {
                status: INVOICE_STATUS_PUBLISHED,
                client: { connect: { id: residentClient.user.id } },
            })
            const [invoice2] = await createTestInvoice(adminClient, o10n, { status: INVOICE_STATUS_PUBLISHED })

            await expectToThrowGQLError(
                async () => await registerMultiPaymentForInvoicesByTestClient(adminClient, {
                    invoices: [pick(invoice1, 'id'), pick(invoice2, 'id')],
                }),
                {
                    code: 'BAD_USER_INPUT',
                    type: 'NOT_UNIQUE',
                    message: 'All invoices must relate to the same user or be anonymous',
                },
                'result',
            )
        })

        test('error on not finished acquiring context', async () => {
            const [o10n] = await createTestOrganization(adminClient)
            const [acquiringContext] = await createTestAcquiringIntegrationContext(adminClient, o10n, acquiringIntegration, {
                invoiceStatus: CONTEXT_FINISHED_STATUS,
                invoiceRecipient: createTestRecipient(),
            })
            const [invoice1] = await createTestInvoice(adminClient, o10n, { status: INVOICE_STATUS_PUBLISHED })
            const [invoice2] = await createTestInvoice(adminClient, o10n, { status: INVOICE_STATUS_PUBLISHED })

            await updateTestAcquiringIntegrationContext(adminClient, acquiringContext.id, { invoiceStatus: CONTEXT_IN_PROGRESS_STATUS })

            await expectToThrowGQLError(
                async () => await registerMultiPaymentForInvoicesByTestClient(adminClient, {
                    invoices: [pick(invoice1, 'id'), pick(invoice2, 'id')],
                }),
                {
                    code: 'BAD_USER_INPUT',
                    type: 'INVOICE_CONTEXT_NOT_FINISHED',
                    message: 'Invoice context is not finished',
                },
                'result',
            )
        })
    })

    describe('success stories', () => {
        test('register multiPayment for two invoices', async () => {
            const [o10n] = await createTestOrganization(adminClient)
            await createTestAcquiringIntegrationContext(adminClient, o10n, acquiringIntegration, {
                invoiceStatus: CONTEXT_FINISHED_STATUS,
                invoiceRecipient: createTestRecipient(),
                invoiceImplicitFeeDistributionSchema: [{
                    recipient: 'organization',
                    percent: '5',
                }],
            })
            const [invoice1] = await createTestInvoice(adminClient, o10n, { status: INVOICE_STATUS_PUBLISHED })
            const [invoice2] = await createTestInvoice(adminClient, o10n, { status: INVOICE_STATUS_PUBLISHED })

            const [result] = await registerMultiPaymentForInvoicesByTestClient(adminClient, {
                invoices: [pick(invoice1, 'id'), pick(invoice2, 'id')],
            })

            expect(result).toBeDefined()
            expect(result).toHaveProperty('multiPaymentId')

            const multiPaymentId = result.multiPaymentId
            const hostUrl = acquiringIntegration.hostUrl
            expect(result).toMatchObject({
                dv: 1,
                webViewUrl: `${hostUrl}/pay/${multiPaymentId}`,
                feeCalculationUrl: `${hostUrl}/api/fee/${multiPaymentId}`,
                directPaymentUrl: `${hostUrl}/api/pay/${multiPaymentId}`,
                anonymousPaymentUrl: `${hostUrl}/api/anonymous/pay/${multiPaymentId}`,
            })

            const multiPayment = await MultiPayment.getOne(adminClient, { id: multiPaymentId })
            const invoice1Sum = invoice1.rows.reduce((sum, { toPay, count }) => sum.plus(Big(toPay).mul(count)), Big(0))
            const invoice2Sum = invoice2.rows.reduce((sum, { toPay, count }) => sum.plus(Big(toPay).mul(count)), Big(0))

            expect(multiPayment).toBeDefined()
            expect(multiPayment).toHaveProperty('amount', invoice1Sum.plus(invoice2Sum).toString())
            expect(multiPayment.payments).toHaveLength(2)

            const payments = await Payment.getAll(adminClient, { id_in: multiPayment.payments.map(({ id }) => id) })
            expect(payments).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    amount: invoice1Sum.toFixed(8),
                    invoice: expect.objectContaining({ id: invoice1.id }),
                }),
                expect.objectContaining({
                    amount: invoice2Sum.toFixed(8),
                    invoice: expect.objectContaining({ id: invoice2.id }),
                }),
            ]))
        })
    })
})