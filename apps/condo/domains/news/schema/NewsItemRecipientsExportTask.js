/**
 * Generated by `createschema news.NewsItemRecipientsExportTask 'user:Relationship:User:CASCADE; status:Select:processing,completed,error; file?:File'`
 */
const Ajv = require('ajv')
const addFormats = require('ajv-formats')

const { canOnlyServerSideWithoutUserRequest } = require('@open-condo/keystone/access')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const FileAdapter = require('@open-condo/keystone/fileAdapter/fileAdapter')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const { WRONG_VALUE } = require('@condo/domains/common/constants/errors')
const { EXPORT_STATUS_VALUES, PROCESSING, COMPLETED, ERROR } = require('@condo/domains/common/constants/export')
const { getValidator } = require('@condo/domains/common/schema/json.utils')
const access = require('@condo/domains/news/access/NewsItemRecipientsExportTask')
const { exportRecipients } = require('@condo/domains/news/tasks/exportRecipients')
const { UNIT_TYPES } = require('@condo/domains/property/constants/common')

const RECIPIENTS_EXPORT_TASK_FOLDER_NAME = 'NewsItemNewsItemRecipientsExportTask'
const NewsItemRecipientsExportTaskFileAdapter = new FileAdapter(RECIPIENTS_EXPORT_TASK_FOLDER_NAME)
const { getFileMetaAfterChange } = FileAdapter
const setFileMetaAfterChange = getFileMetaAfterChange(NewsItemRecipientsExportTaskFileAdapter, 'file')

const ERRORS = {
    STATUS_IS_ALREADY_COMPLETED: {
        code: BAD_USER_INPUT,
        type: WRONG_VALUE,
        message: 'Status is already completed',
        messageForUser: 'api.news.newsItemRecipientsExportTask.STATUS_IS_ALREADY_COMPLETED',
        variable: ['data', 'status'],
    },
    STATUS_IS_ALREADY_ERROR: {
        code: BAD_USER_INPUT,
        type: WRONG_VALUE,
        message: 'Status is already error',
        messageForUser: 'api.news.newsItemRecipientsExportTask.STATUS_IS_ALREADY_ERROR',
        variable: ['data', 'status'],
    },
}

const ajv = new Ajv()
addFormats(ajv)

const scopesSchema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            property: {
                type: 'object',
                nullable: true,
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id'],
                additionalProperties: false,
            },
            unitType: { enum: [null, ...UNIT_TYPES] },
            unitName: { type: 'string', nullable: true },
        },
        required: [],
        additionalProperties: false,
    },
}

const recipientsExportScopesValidator = getValidator(ajv.compile(scopesSchema))

const NewsItemRecipientsExportTask = new GQLListSchema('NewsItemRecipientsExportTask', {
    schemaDoc: 'Stores data about the exporting',
    fields: {

        user: {
            schemaDoc: 'The user who has started the exporting',
            type: 'Relationship',
            ref: 'User',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        organization: {
            schemaDoc: 'The organization from which the recipients will be exported from',
            type: 'Relationship',
            ref: 'Organization',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        scopes: {
            schemaDoc: 'The array of recipients\' scopes',
            type: 'Json',
            isRequired: true,
            access: {
                read: true,
                create: true,
                update: false,
            },
            hooks: {
                validateInput: recipientsExportScopesValidator,
            },
        },

        status: {
            schemaDoc: 'Status of export job',
            type: 'Select',
            options: EXPORT_STATUS_VALUES,
            isRequired: true,
            defaultValue: PROCESSING,
            access: {
                read: true,
                create: canOnlyServerSideWithoutUserRequest,
                update: true,
            },
        },

        file: {
            schemaDoc: 'Meta information about file, saved outside of database somewhere. Shape of meta information JSON object is specific to file adapter, used by saving a file.',
            type: 'File',
            adapter: NewsItemRecipientsExportTaskFileAdapter,
            access: {
                read: true,
                create: canOnlyServerSideWithoutUserRequest,
                update: canOnlyServerSideWithoutUserRequest,
            },
        },

    },
    hooks: {
        validateInput: async ({ context, resolvedData, existingItem }) => {
            if (existingItem) {
                if (resolvedData['status'] && existingItem['status'] === COMPLETED) {
                    throw new GQLError(ERRORS.STATUS_IS_ALREADY_COMPLETED, context)
                }
                if (resolvedData['status'] && existingItem['status'] === ERROR) {
                    throw new GQLError(ERRORS.STATUS_IS_ALREADY_ERROR, context)
                }
            }
        },
        afterChange: async (args) => {
            const { updatedItem, operation } = args

            await setFileMetaAfterChange(args)
            if (operation === 'create') {
                await exportRecipients.delay(updatedItem.id)
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadNewsItemRecipientsExportTasks,
        create: access.canManageNewsItemRecipientsExportTasks,
        update: access.canManageNewsItemRecipientsExportTasks,
        delete: false,
        auth: true,
    },
})

module.exports = {
    NewsItemRecipientsExportTask,
}
