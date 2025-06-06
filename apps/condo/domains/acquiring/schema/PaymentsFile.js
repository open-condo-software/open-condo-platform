/**
 * Generated by `createschema acquiring.PaymentsFile 'number:Text;file:File;billingIntegrationOrganizationContextId:Text;externalId:Text;account:Text;dateBegin:CalendarDay;dateEnd:CalendarDay;dateLoad:DateTimeUtc;uploadedRecords:Integer;amount:Decimal;amountBring:Decimal;registryName:Text;bankStatus:Text;bankComment:Text;fileName:Text;'`
 */

const FileAdapter = require('@open-condo/keystone/fileAdapter/fileAdapter')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/acquiring/access/PaymentsFile')
const {
    PAYMENTS_FILES_FOLDER_NAME,
} = require('@condo/domains/acquiring/constants/constants')
const {
    PAYMENTS_FILE_STATUSES,
    PAYMENTS_FILE_NEW_STATUS,
    PAYMENTS_FILE_DOWNLOADED_STATUS,
} = require('@condo/domains/acquiring/constants/constants')
const {  MONEY_AMOUNT_FIELD } = require('@condo/domains/common/schema/fields')
const { convertFileNameToUTF8 } = require('@condo/domains/common/utils/fixFileNameEncoding')


const Adapter = new FileAdapter(PAYMENTS_FILES_FOLDER_NAME)

const PaymentsFile = new GQLListSchema('PaymentsFile', {
    schemaDoc: 'Payments file. A file that contains all payments detalization for a common payments order for a period of time.' +
        'Is filled in external integration systems.',
    fields: {

        context: {
            schemaDoc: 'Link to Acquiring Integration Context',
            type: 'Relationship',
            ref: 'AcquiringIntegrationContext',
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        number: {
            schemaDoc: 'The number of payments registry file',
            type: 'Text',
            isRequired: false,
        },

        paymentOrder: {
            schemaDoc: 'Numeric id to define the money transaction',
            type: 'Text',
            isRequired: false,
        },

        file: {
            schemaDoc: 'Payments registry file itself',
            type: 'File',
            isRequired: true,
            adapter: Adapter,
        },

        bankAccount: {
            schemaDoc: 'Bank account of the bank that the money is transferred to',
            type: 'Text',
            isRequired: true,
        },

        paymentPeriodStartDate: {
            schemaDoc: 'Date marking the beginning of the period for which payment transactions are included',
            type: 'CalendarDay',
            isRequired: true,
        },

        paymentPeriodEndDay: {
            schemaDoc: 'Date marking the end of the period for which payment transactions are included',
            type: 'CalendarDay',
            isRequired: true,
        },

        loadedAt: {
            schemaDoc: 'Date when payments file itself was created',
            type: 'DateTimeUtc',
            isRequired: true,
        },

        paymentsCount: {
            schemaDoc: 'The count of payments inside the Payments file',
            type: 'Integer',
            isRequired: true,
        },

        amount: {
            ...MONEY_AMOUNT_FIELD,
            schemaDoc: 'Total amount sum of all payments from payments file',
            isRequired: true,
        },

        amountWithoutFees: {
            ...MONEY_AMOUNT_FIELD,
            schemaDoc: 'Total amount smu of all payments from payments file excluding fees',
            isRequired: true,
        },

        name: {
            schemaDoc: 'Name of the payments file in accounting system',
            type: 'Text',
            isRequired: true,
        },

        status: {
            schemaDoc: `Status of the payments file. Can be one of: ${PAYMENTS_FILE_STATUSES.join(', ')}. After user downloads the file
            its status changes to ${PAYMENTS_FILE_DOWNLOADED_STATUS}`,
            type: 'Select',
            isRequired: true,
            options: PAYMENTS_FILE_STATUSES,
            defaultValue: PAYMENTS_FILE_NEW_STATUS,
        },

        importId: {
            schemaDoc: 'Identifier of corresponding record in external system',
            type: 'Text',
            isRequired: false,
        },

        bankComment: {
            schemaDoc: 'Text description of the payments file about the file content',
            type: 'Text',
            isRequired: false,
        },

    },
    hooks: {
        resolveInput: async ({ resolvedData }) => {
            if (resolvedData['file']) {
                resolvedData['file'].originalFilename = convertFileNameToUTF8(resolvedData['file'].originalFilename)
            }
            return resolvedData
        },
        afterChange: async ({ operation, updatedItem }) => {
            if (updatedItem && Adapter.acl) {
                const { context, file } = updatedItem
                if (file) {
                    const { filename } = file
                    const key = `${PAYMENTS_FILES_FOLDER_NAME}/${filename}`
                    // OBS will lowercase all keys from meta
                    const metaToSet = {
                        listkey: 'AcquiringIntegrationContext',
                        id: context,
                    }
                    await Adapter.acl.setMeta(key, metaToSet)
                }
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadPaymentsFiles,
        create: access.canManagePaymentsFiles,
        update: access.canManagePaymentsFiles,
        delete: false,
        auth: true,
    },
    kmigratorOptions: {
        indexes: [
            {
                type: 'BTreeIndex',
                fields: ['name'],
                name: 'payments_file_name_idx',
            },
            {
                type: 'BTreeIndex',
                fields: ['paymentOrder'],
                name: 'payments_file_paymentOrder_idx',
            },
        ],
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['context', 'name'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'PaymentsFile_uniq_for_context_and_name',
            },
        ],
    },
})

module.exports = {
    PaymentsFile,
}
