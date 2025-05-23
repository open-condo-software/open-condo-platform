/**
 * Generated by `createschema organization.OrganizationEmployeeRole 'organization:Relationship:Organization:CASCADE; name:Text; statusTransitions:Json; canManageOrganization:Checkbox; canManageEmployees:Checkbox; canManageRoles:Checkbox; canManageIntegrations:Checkbox; canManageProperties:Checkbox; canManageTickets:Checkbox;' --force`
 */

const get = require('lodash/get')

const { writeOnlyServerSideFieldAccess } = require('@open-condo/keystone/access')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { historical, versioned, uuided, tracked, dvAndSender, softDeleted } = require('@open-condo/keystone/plugins')
const { GQLListSchema, itemsQuery } = require('@open-condo/keystone/schema')
const { getLocalized } = require('@open-condo/locales/loader')

const { LOCALES } = require('@condo/domains/common/constants/locale')
const { normalizeText } = require('@condo/domains/common/utils/text')
const access = require('@condo/domains/organization/access/OrganizationEmployeeRole')
const { TICKET_VISIBILITY_OPTIONS, ORGANIZATION_TICKET_VISIBILITY, MIN_ROLE_NAME_LENGTH, MAX_ROLE_DESCRIPTION_LENGTH, MAX_ROLE_NAME_LENGTH } = require('@condo/domains/organization/constants/common')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const { resetOrganizationEmployeesCache } = require('@condo/domains/organization/utils/accessSchema')
const { Organization } = require('@condo/domains/organization/utils/serverSchema')
const { COUNTRY_RELATED_STATUS_TRANSITIONS } = require('@condo/domains/ticket/constants/statusTransitions')

const ROLE_NAME_TRANSLATION_KEYS = [
    'Administrator',
    'Contractor',
    'Dispatcher',
    'Manager',
    'Foreman',
    'Technician',
].map(roleName => `employee.role.${roleName}.name`)

const ALL_ROLE_NAME_TRANSLATIONS = Object.keys(LOCALES).reduce((acc, locale) => {
    acc.push(...ROLE_NAME_TRANSLATION_KEYS.map(key => getLocalized(locale, key)))
    return acc
}, [])
const ALL_ROLE_NAME_TRANSLATIONS_REGEX = new RegExp(`^(${ALL_ROLE_NAME_TRANSLATIONS.join('|')})$`, 'i')

const ERRORS = {
    CANNOT_UPDATE_NOT_EDITABLE_ROLE: {
        code: BAD_USER_INPUT,
        type: 'CANNOT_UPDATE_NOT_EDITABLE_ROLE',
        message: 'Not editable role cannot be updated',
    },
    CANNOT_DELETE_DEFAULT_ROLE: {
        code: BAD_USER_INPUT,
        type: 'CANNOT_DELETE_DEFAULT_ROLE',
        message: 'Default role cannot be deleted',
    },
    CANNOT_UPDATE_FIELD_FOR_DEFAULT_ROLE: {
        code: BAD_USER_INPUT,
        variable: ['data', '?'],
        type: 'CANNOT_UPDATE_FIELD_FOR_DEFAULT_ROLE',
        message: '"{fieldName}" field cannot be updated for default role',
        messageInterpolation: {
            fieldName: '?',
        },
    },
    ROLE_NAME_ALREADY_EXIST: {
        code: BAD_USER_INPUT,
        variable: ['data', 'name'],
        type: 'ROLE_NAME_ALREADY_EXIST',
        message: 'The role name is similar to the default role name',
        messageForUser: 'api.organization.organizationEmployeeRole.ROLE_NAME_ALREADY_EXIST',
    },
    INVALID_ROLE_NAME_LENGTH: {
        code: BAD_USER_INPUT,
        variable: ['data', 'name'],
        type: 'INVALID_ROLE_NAME_LENGTH',
        message: 'Role name length must be between {min} and {max} characters',
        messageForUser: 'api.organization.organizationEmployeeRole.INVALID_ROLE_NAME_LENGTH',
        messageInterpolation: {
            min: MIN_ROLE_NAME_LENGTH,
            max: MAX_ROLE_NAME_LENGTH,
        },
    },
    INVALID_ROLE_DESCRIPTION_LENGTH: {
        code: BAD_USER_INPUT,
        variable: ['data', 'description'],
        type: 'INVALID_ROLE_DESCRIPTION_LENGTH',
        message: 'Role description length cannot be more than {max} characters',
        messageForUser: 'api.organization.organizationEmployeeRole.INVALID_ROLE_DESCRIPTION_LENGTH',
        messageInterpolation: {
            max: MAX_ROLE_NAME_LENGTH,
        },
    },
    EMPLOYEES_WITH_THIS_ROLE_WERE_FOUND: {
        code: BAD_USER_INPUT,
        type: 'EMPLOYEES_WITH_THIS_ROLE_WERE_FOUND',
        variable: ['data', 'description'],
        message: '{employeeCount} employees with this role were found. This role must be revoked from all employees before it can be deleted. ' +
            'You can use the "replaceOrganizationEmployeeRole" mutation to avoid having to do this manually.',
        messageInterpolation: {
            employeeCount: '?', // runtime
        },
    },
    B2B_APP_ROLES_WITH_THIS_ROLE_WERE_FOUND: {
        code: BAD_USER_INPUT,
        variable: ['data', 'description'],
        type: 'B2B_APP_ROLES_WITH_THIS_ROLE_WERE_FOUND',
        message: '{employeeCount} B2BAppRoles with this role were found. This role must be revoked from all B2BAppRoles before it can be deleted. ' +
            'You can use the "replaceOrganizationEmployeeRole" mutation to avoid having to do this manually.',
        messageInterpolation: {
            employeeCount: '?', // runtime
        },
    },
}

const OrganizationEmployeeRole = new GQLListSchema('OrganizationEmployeeRole', {
    schemaDoc: 'Employee role name and access permissions',
    fields: {
        organization: ORGANIZATION_OWNED_FIELD,

        // There is no `user` reference, because Organization will have a set of pre-defined roles
        // and each employee will be associated with one of the role, not role with user.

        isDefault: {
            schemaDoc: '(Read-only) Indicates whether the role was added by default when the organization was created.' +
                '\nSuch roles cannot be deleted and their name, description and “ticketVisibilityType” cannot be changed.',
            type: 'Checkbox',
            defaultValue: false,
            isRequired: true,
            kmigratorOptions: { default: false },
            access: writeOnlyServerSideFieldAccess,
        },
        isEditable: {
            schemaDoc: '(Read-only) Indicates whether the role can be edited',
            type: 'Checkbox',
            defaultValue: true,
            isRequired: true,
            kmigratorOptions: { default: true },
            access: writeOnlyServerSideFieldAccess,
        },

        name: {
            schemaDoc: 'Role name. Cannot be changed for default roles',
            type: 'LocalizedText',
            isRequired: true,
            template: 'employee.role.*.name',
            hooks: {
                resolveInput: async ({ resolvedData, fieldPath, existingItem }) => {
                    const newItem = { ...existingItem, ...resolvedData }
                    const isDefaultRole = get(newItem, 'isDefault', false)
                    if (isDefaultRole) return resolvedData[fieldPath]
                    if (resolvedData[fieldPath] === undefined) return resolvedData[fieldPath]
                    return normalizeText(resolvedData[fieldPath]) || ''
                },
                validateInput: async ({ resolvedData, fieldPath, context, existingItem, operation }) => {
                    const newItem = { ...existingItem, ...resolvedData }
                    const isUpdateOperation = operation === 'update'
                    const isDefaultRole = get(newItem, 'isDefault', false)
                    const name = get(resolvedData, fieldPath) || ''

                    if (isUpdateOperation && isDefaultRole) {
                        throw new GQLError({
                            ...ERRORS.CANNOT_UPDATE_FIELD_FOR_DEFAULT_ROLE,
                            variable: ['data', fieldPath],
                            messageInterpolation: {
                                fieldName: fieldPath,
                            },
                        }, context)
                    }

                    if (name.length < MIN_ROLE_NAME_LENGTH || name.length > MAX_ROLE_NAME_LENGTH) {
                        throw new GQLError(ERRORS.INVALID_ROLE_NAME_LENGTH, context)
                    }

                    // cannot be like translations
                    if (name && ALL_ROLE_NAME_TRANSLATIONS_REGEX.test(name)) {
                        throw new GQLError(ERRORS.ROLE_NAME_ALREADY_EXIST, context)
                    }
                },
            },
        },
        description: {
            schemaDoc: 'Role description. Cannot be changed for default roles',
            type: 'LocalizedText',
            isRequired: false,
            template: 'employee.role.*.description',
            hooks: {
                resolveInput: async ({ resolvedData, fieldPath, existingItem }) => {
                    const newItem = { ...existingItem, ...resolvedData }
                    const isDefaultRole = get(newItem, 'isDefault', false)
                    if (isDefaultRole) return resolvedData[fieldPath]
                    if (resolvedData[fieldPath] === undefined) return resolvedData[fieldPath]
                    return normalizeText(resolvedData[fieldPath]) || ''
                },
                validateInput: async ({ resolvedData, fieldPath, context, existingItem, operation }) => {
                    const newItem = { ...existingItem, ...resolvedData }
                    const isUpdateOperation = operation === 'update'
                    const isDefaultRole = get(newItem, 'isDefault', false)
                    const description = get(resolvedData, fieldPath) || ''

                    if (isUpdateOperation && isDefaultRole) {
                        throw new GQLError({
                            ...ERRORS.CANNOT_UPDATE_FIELD_FOR_DEFAULT_ROLE,
                            variable: ['data', fieldPath],
                            messageInterpolation: {
                                fieldName: fieldPath,
                            },
                        }, context)
                    }

                    if (description.length > MAX_ROLE_DESCRIPTION_LENGTH) {
                        throw new GQLError(ERRORS.INVALID_ROLE_DESCRIPTION_LENGTH, context)
                    }
                },
            },
        },
        statusTransitions: {
            schemaDoc: 'Employee status transitions map',
            type: 'Virtual',
            graphQLReturnType: 'JSON',
            resolver: async (item, _, context) => {
                const organizationId = get(item, 'organization')
                const [organization] = await Organization.getAll(
                    context,
                    { id: organizationId },
                    'id country'
                )

                if (!organization) {
                    throw new Error('No organization found for OrganizationEmployeeRole')
                }

                const organizationCountry = get(organization, 'country', 'en')
                return COUNTRY_RELATED_STATUS_TRANSITIONS[organizationCountry]
            },
        },

        canManageOrganization: { type: 'Checkbox', defaultValue: false },
        canReadEmployees: { type: 'Checkbox', defaultValue: true },
        canManageEmployees: { type: 'Checkbox', defaultValue: false },
        canManageRoles: { type: 'Checkbox', defaultValue: false },
        canManageIntegrations: { type: 'Checkbox', defaultValue: false },
        canReadProperties: { type: 'Checkbox', defaultValue: true },
        canManageProperties: { type: 'Checkbox', defaultValue: false },
        canReadDocuments: { type: 'Checkbox', defaultValue: true },
        canManageDocuments: { type: 'Checkbox', defaultValue: false },
        canReadTickets: { type: 'Checkbox', defaultValue: true },
        canManageTickets: { type: 'Checkbox', defaultValue: false },
        canManageMeters: { type: 'Checkbox', defaultValue: true },
        canManageMeterReadings: { type: 'Checkbox', defaultValue: true },
        canReadContacts: { type: 'Checkbox', defaultValue: true },
        canManageContacts: { type: 'Checkbox', defaultValue: false },
        canManageContactRoles: { type: 'Checkbox', defaultValue: false },
        canManageTicketComments: { type: 'Checkbox', defaultValue: true },
        canShareTickets: { type: 'Checkbox', defaultValue: true },
        canReadBillingReceipts: { type: 'Checkbox', defaultValue: false },
        canImportBillingReceipts: { type: 'Checkbox', defaultValue: false },
        canReadPayments: { type: 'Checkbox', defaultValue: false },
        canInviteNewOrganizationEmployees: { type: 'Checkbox', defaultValue: false },
        canBeAssignedAsResponsible: {
            schemaDoc: 'Allows employees with this role to be assigned to tickets as responsible',
            type: 'Checkbox',
            defaultValue: true,
        },
        canBeAssignedAsExecutor: {
            schemaDoc: 'Allows employees with this role to be assigned to tickets as executor',
            type: 'Checkbox',
            defaultValue: true,
        },
        canManageTicketPropertyHints: {
            type: 'Checkbox',
            defaultValue: false,
        },
        ticketVisibilityType: {
            schemaDoc: `Which tickets the employee sees:
                        1) organization - sees all tickets in the organization.
                        2) property - Sees tickets in PropertyScope that have this employee
                        3) propertyAndSpecialization - Sees tickets by employee specialization + PropertyScope
                        4) assigned - sees only those tickets in which he is the executor or responsible
                        `,
            type: 'Select',
            dataType: 'string',
            isRequired: true,
            defaultOption: ORGANIZATION_TICKET_VISIBILITY,
            options: TICKET_VISIBILITY_OPTIONS,
            hooks: {
                validateInput: async ({ existingItem, resolvedData, operation, fieldPath, context }) => {
                    const newItem = { ...existingItem, ...resolvedData }

                    const isUpdateOperation = operation === 'update'
                    const isDefaultRole = get(newItem, 'isDefault', false)

                    if (isUpdateOperation && isDefaultRole) {
                        throw new GQLError({
                            ...ERRORS.CANNOT_UPDATE_FIELD_FOR_DEFAULT_ROLE,
                            variable: ['data', fieldPath],
                            messageInterpolation: {
                                fieldName: fieldPath,
                            },
                        }, context)
                    }
                },
            },
        },
        canManagePropertyScopes: { type: 'Checkbox', defaultValue: false },
        canManageBankAccounts: { type: 'Checkbox', defaultValue: false },
        canManageBankAccountReportTasks: { type: 'Checkbox', defaultValue: false },
        canManageBankIntegrationAccountContexts: { type: 'Checkbox', defaultValue: false },
        canManageBankIntegrationOrganizationContexts: { type: 'Checkbox', defaultValue: false },
        canManageBankContractorAccounts: { type: 'Checkbox', defaultValue: false },
        canManageBankTransactions: { type: 'Checkbox', defaultValue: false },
        canManageBankAccountReports: { type: 'Checkbox', defaultValue: false },
        canReadIncidents: { type: 'Checkbox', defaultValue: true },
        canManageIncidents: { type: 'Checkbox', defaultValue: false },
        canReadNewsItems: { type: 'Checkbox', defaultValue: false },
        canManageNewsItems: { type: 'Checkbox', defaultValue: false },
        canManageNewsItemTemplates: { type: 'Checkbox', defaultValue: false },
        canManageCallRecords: { type: 'Checkbox', defaultValue: false },
        canDownloadCallRecords: { type: 'Checkbox', defaultValue: false },
        canManageMobileFeatureConfigs: { type: 'Checkbox', defaultValue: false },
        canManageB2BApps: { type: 'Checkbox', defaultValue: false },
        canReadAnalytics: { type: 'Checkbox', defaultValue: false },
        canReadInvoices: { type: 'Checkbox', defaultValue: false },
        canManageInvoices: { type: 'Checkbox', defaultValue: false },
        canReadMarketItems: { type: 'Checkbox', defaultValue: false },
        canManageMarketItems: { type: 'Checkbox', defaultValue: false },
        canReadMeters: { type: 'Checkbox', defaultValue: true },
        canReadSettings: { type: 'Checkbox', defaultValue: true },
        canReadExternalReports: { type: 'Checkbox', defaultValue: true },
        canReadServices: { type: 'Checkbox', defaultValue: true },
        canReadCallRecords: { type: 'Checkbox', defaultValue: true },
        canReadMarketItemPrices: { type: 'Checkbox', defaultValue: false },
        canManageMarketItemPrices: { type: 'Checkbox', defaultValue: false },
        canReadMarketPriceScopes: { type: 'Checkbox', defaultValue: false },
        canManageMarketPriceScopes: { type: 'Checkbox', defaultValue: false },
        canReadPaymentsWithInvoices: { type: 'Checkbox', defaultValue: false },
        canReadMarketplace: { type: 'Checkbox', defaultValue: false },
        canManageMarketplace: { type: 'Checkbox', defaultValue: false },
        canReadTour: { type: 'Checkbox', defaultValue: true },
        canManageTour: { type: 'Checkbox', defaultValue: true },
        canReadMarketSetting: { type: 'Checkbox', defaultValue: false },
        canManageMarketSetting: { type: 'Checkbox', defaultValue: false },
        canManageTicketAutoAssignments: { type: 'Checkbox', defaultValue: false },
        canManageOrganizationEmployeeRequests: { type: 'Checkbox', defaultValue: false, kmigratorOptions: { default: false } },
    },
    plugins: [uuided(), versioned(), tracked(), dvAndSender(), historical(), softDeleted()],
    hooks: {
        validateInput: async ({ resolvedData, existingItem, context, operation }) => {
            const newItem = { ...existingItem, ...resolvedData }
            const roleId = get(newItem, 'id')

            const isSoftDelete = Boolean(resolvedData['deletedAt'])
            const isUpdateOperation = operation === 'update'

            const isEditableRole = get(newItem, 'isEditable', false)
            const isDefaultRole = get(newItem, 'isDefault', false)

            if (isDefaultRole && isSoftDelete) {
                throw new GQLError(ERRORS.CANNOT_DELETE_DEFAULT_ROLE, context)
            }

            if (!isEditableRole && isUpdateOperation) {
                throw new GQLError(ERRORS.CANNOT_UPDATE_NOT_EDITABLE_ROLE, context)
            }

            if (isSoftDelete && isUpdateOperation && roleId) {
                const { count: organizationEmployeeCount } = await itemsQuery('OrganizationEmployee', {
                    where: {
                        role: { id: roleId },
                        deletedAt: null,
                    },
                }, { meta: true })

                if (organizationEmployeeCount) {
                    throw new GQLError({
                        ...ERRORS.EMPLOYEES_WITH_THIS_ROLE_WERE_FOUND,
                        messageInterpolation: {
                            employeeCount: organizationEmployeeCount,
                        },
                    }, context)
                }

                const { count: b2bAppRoleCount } = await itemsQuery('B2BAppRole', {
                    where: {
                        role: { id: roleId },
                        deletedAt: null,
                    },
                }, { meta: true })

                if (b2bAppRoleCount) {
                    throw new GQLError({
                        ...ERRORS.B2B_APP_ROLES_WITH_THIS_ROLE_WERE_FOUND,
                        messageInterpolation: {
                            employeeCount: b2bAppRoleCount,
                        },
                    }, context)
                }
            }
        },
        afterChange: async ({ updatedItem, existingItem }) => {
            const roleId = existingItem ? existingItem.id : updatedItem.id
            // NOTE: orgId is not changed, so we can use updatedItem
            const organizationId = updatedItem.organization
            await resetOrganizationEmployeesCache(organizationId, roleId)
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['organization', 'name'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'organization_employee_role_unique_organization_and_name',
            },
        ],
    },
    access: {
        read: access.canReadOrganizationEmployeeRoles,
        create: access.canManageOrganizationEmployeeRoles,
        update: access.canManageOrganizationEmployeeRoles,
        delete: false,
        auth: true,
    },
    escapeSearch: true,
})

module.exports = {
    OrganizationEmployeeRole,
    ERRORS,
}
