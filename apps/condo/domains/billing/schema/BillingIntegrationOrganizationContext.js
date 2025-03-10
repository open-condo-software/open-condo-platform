/**
 * Generated by `createschema billing.BillingIntegrationOrganizationContext 'integration:Relationship:BillingIntegration:PROTECT; organization:Relationship:Organization:CASCADE; settings:Json; state:Json' --force`
 */

const { get } = require('lodash')

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { find, getById, GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/billing/access/BillingIntegrationOrganizationContext')
const { validateReport } = require('@condo/domains/billing/utils/validation.utils')
const { hasValidJsonStructure } = require('@condo/domains/common/utils/validation.utils')
const { CONTEXT_FINISHED_STATUS } = require('@condo/domains/miniapp/constants')
const { STATUS_FIELD, getStatusResolver, getStatusDescription } = require('@condo/domains/miniapp/schema/fields/context')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')

const BillingIntegrationOrganizationContext = new GQLListSchema('BillingIntegrationOrganizationContext', {
    schemaDoc: 'Integration state and settings for all organizations. The existence of this object means that there is a configured integration between the `billing data source` and `this API`',
    fields: {
        integration: {
            schemaDoc: 'ID of the integration that is configured to receive data for the organization',
            type: 'Relationship',
            ref: 'BillingIntegration',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
            access: {
                read: true,
                create: true,
                update: false,
            },
        },

        organization: ORGANIZATION_OWNED_FIELD,

        settings: {
            schemaDoc: 'Settings that are required to get data from the `billing data source`. It can also contain fine-tuning optional integration settings. The data structure depends on the integration and defined there',
            type: 'Json',
            isRequired: true,
            hooks: {
                validateInput: (args) => {
                    hasValidJsonStructure(args, true, 1, {})
                },
            },
        },

        status: {
            ...STATUS_FIELD,
            schemaDoc: getStatusDescription('BillingIntegration'),
            hooks: {
                resolveInput: getStatusResolver('BillingIntegration', 'integration'),
            },
            graphQLReturnType: 'String',
        },

        state: {
            schemaDoc: 'The current state of the integration process. Some integration need to store past state or data related to cache files/folders for past state. The data structure depends on the integration and defined there',
            type: 'Json',
            isRequired: true,
            hooks: {
                validateInput: (args) => {
                    hasValidJsonStructure(args, true, 1, {})
                },
            },
        },

        lastReport: {
            schemaDoc: 'Information about last report, such as time of report, period of report, amount of loaded data and etc',
            type: 'Json',
            isRequired: false,
            hooks: {
                validateInput: validateReport,
            },
        },

        currentProblem: {
            schemaDoc: 'Link to a problem occurred during last integration process. Filled automatically, can only be resolved to null manually.',
            type: 'Relationship',
            ref: 'BillingIntegrationProblem',
            isRequired: false,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
            access: {
                read: true,
                create: access.canManageContextProblem,
                update: access.canManageContextProblem,
            },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadBillingIntegrationOrganizationContexts,
        create: access.canManageBillingIntegrationOrganizationContexts,
        update: access.canManageBillingIntegrationOrganizationContexts,
        delete: false,
        auth: true,
    },
    hooks: {
        validateInput: async ({ operation, resolvedData, addValidationError }) => {
            // should have only one explicit (hidden = false) context in organization!
            if (operation === 'create' && resolvedData['status'] === CONTEXT_FINISHED_STATUS) {
                const integration = await getById('BillingIntegration', get(resolvedData, ['integration']))
                if (get(integration, 'isHidden') === true) { return } // we can add as many b2c integrations as we like

                const contextsInThisOrganization = await find('BillingIntegrationOrganizationContext', {
                    integration: { isHidden: false },
                    organization: { id: get(resolvedData, 'organization') },
                    status: CONTEXT_FINISHED_STATUS,
                    deletedAt: null,
                })

                if (contextsInThisOrganization.length > 0) {
                    // TODO(pahaz): DOMA-10368 use GQLError
                    addValidationError('Can\'t create two BillingIntegrationOrganizationContexts in same organization!')
                }
            }
        },
    },
})

module.exports = {
    BillingIntegrationOrganizationContext,
}
