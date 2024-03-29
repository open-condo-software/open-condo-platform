const { get, isObject, isString } = require('lodash')
const pluralize = require('pluralize')


const PERMISSION_FIELD = {
    type: 'Checkbox',
    defaultValue: false,
    kmigratorOptions: { default: false },
}

const READ_ONLY_PERMISSION_FIELD = {
    ...PERMISSION_FIELD,
    access: {
        read: true,
        create: false,
        update: false,
    },
}

const getReadOnlyPermissionFieldNames = (config) => {
    return Object.entries(config)
        .map(([schemaName, schemaConfig]) => {
            const readOnlyFieldsBySchema = []
            if (!get(schemaConfig, 'canBeRead', true)) {
                readOnlyFieldsBySchema.push(`canRead${pluralize.plural(schemaName)}`)
            }
            if (!get(schemaConfig, 'canBeManaged', true)) {
                readOnlyFieldsBySchema.push(`canManage${pluralize.plural(schemaName)}`)
            }
            return readOnlyFieldsBySchema
        })
        .flat()
}

const getPermissionFieldNames = (config) => {
    return Object.entries(config)
        .map(([schemaName]) => {
            const canReadName = `canRead${pluralize.plural(schemaName)}`
            const canManageName = `canManage${pluralize.plural(schemaName)}`
            return [canReadName, canManageName]
        })
        .flat()
}

/**
 * @param permissionFieldName {string}
 * @return {string}
 */
const getSchemaDocForReadOnlyPermissionField = (permissionFieldName) => {
    if (!isString(permissionFieldName) || permissionFieldName.trim().length < 1) throw new Error('"permissionFieldName" must be not empty string!')

    if (permissionFieldName.startsWith('canRead')) {
        return 'Currently, this field is read-only. You cannot get read access for the specified schema.'
    }

    if (permissionFieldName.startsWith('canManage')) {
        return 'Currently, this field is read-only. You cannot get manage access for the specified schema.'
    }

    throw new Error('Permission field name no starts with "canManage" or "canRead"! You should check the implementation!')
}

/**
 *
 * Overrides the default access behavior for the specified schema
 *
 * @typedef {Object} B2bAppServiceUserAccessSchemaConfig
 * @property {Array.<string>} pathToOrganizationId - Way to get the organization id (default value: ['organization', 'id'])
 * @property {boolean} canBeRead - Service users can read schema (default value: true)
 * @property {boolean} canBeManaged - Service users can manage schema (default value: true)
 */

/**
 *
 * Determines which models can be accessed by a service user linked to a B2B app
 *
 * @example Config for Organization schema
 * {
 *    Organization: {
 *       // Default value ['organization', 'id'] => get value from <SchemaName>.organization.id
 *       // But for the Organization schema get value from <SchemaName>.id
 *       pathToOrganizationId: ['id'],
 *       // By default schemas can be manage, but for Organization schema cannot be managed
 *       canBeManaged: false,
 *    },
 * }
 *
 * @typedef {Object.<string, B2bAppServiceUserAccessSchemaConfig>} B2bAppServiceUserAccessConfig
 */

/**
 * Generation of fields for scheme  B2BAppAccessRightSet canRead... and canManage... for the necessary schemes.
 *
 * @param {B2bAppServiceUserAccessConfig} config  - Determines which models can be accessed by a service user linked to a B2B app
 * @return {Object.<string, Object>}
 */
const generatePermissionFields = ({ config }) => {
    if (!isObject(config)) throw new Error('Config not object!')

    const allPermissionFieldNames = getPermissionFieldNames(config)
    const readOnlyPermissionFieldNames = getReadOnlyPermissionFieldNames(config)

    const permissionFields = {}

    for (const permissionFieldName of allPermissionFieldNames) {
        if (readOnlyPermissionFieldNames.includes(permissionFieldName)) {
            permissionFields[permissionFieldName] = {
                ...READ_ONLY_PERMISSION_FIELD,
                schemaDoc: getSchemaDocForReadOnlyPermissionField(permissionFieldName),
            }
        } else {
            permissionFields[permissionFieldName] = PERMISSION_FIELD
        }
    }

    return permissionFields
}

module.exports = {
    generatePermissionFields,
    getSchemaDocForReadOnlyPermissionField,
    PERMISSION_FIELD,
    READ_ONLY_PERMISSION_FIELD,
}
