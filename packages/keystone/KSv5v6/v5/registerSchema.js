const { Relationship, Integer, Float, Slug, Virtual, Url, Uuid, Checkbox, DateTimeUtc, CalendarDay, Decimal, Password } = require('@keystonejs/fields')
const { AuthedRelationship } = require('@keystonejs/fields-authed-relationship')
const { get, isObject, isString } = require('lodash')

const { Text } = require('@open-condo/keystone/fields')

const { Json, SignedDecimal, AutoIncrementInteger, LocalizedText, DateInterval, FileWithUTF8Name, Select } = require('../../fields')
const { HiddenRelationship } = require('../../plugins/utils/HiddenRelationship')
const { GQL_SCHEMA_TYPES, GQL_CUSTOM_SCHEMA_TYPE, GQL_LIST_SCHEMA_TYPE } = require('../../schema')

function _defaultAdminUiColumns (fields) {
    const res = []
    if (fields.createdBy) res.push('createdBy')
    if (fields.createdAt) res.push('createdAt')
    return res.join(',')
}

function applyKeystoneV5AdminFixes (schema) {
    // https://v5.keystonejs.com/api/create-list#labelresolver
    if (!schema.labelResolver) {
        schema.labelResolver = (item) => (item.name) ? `${item.name} -- <${item.id}>` : item.id
    }
    schema.adminConfig = {
        defaultPageSize: 50,
        maximumPageSize: 100,
        defaultSort: '-createdAt',
        defaultColumns: _defaultAdminUiColumns(schema.fields),
        ...get(schema, 'adminConfig', {}),
    }
    return schema
}

/** @deprecated it's part of internal API use prepareKeystone instead */
function convertStringToTypes (schema) {
    const mapping = {
        CalendarDay,
        Checkbox,
        DateTimeUtc,
        Decimal,
        File: FileWithUTF8Name,
        Float,
        Integer,
        Password,
        Relationship,
        Select,
        Slug,
        Text,
        Url,
        Uuid,
        Virtual,
        Json,
        SignedDecimal,
        AutoIncrementInteger,
        LocalizedText,
        AuthedRelationship,
        HiddenRelationship,
        DateInterval,
    }

    if (!schema.fields) throw new Error('convertStringToTypes(): wrong schema type! no fields!')
    Object.keys(schema.fields).forEach((field) => {
        const fieldObj = schema.fields[field]
        if (fieldObj && !isObject(fieldObj)) throw new Error(`convertStringToTypes(): field "${field}" is not an object like!`)
        const type = fieldObj.type
        if (!type) throw new Error(`convertStringToTypes(): field "${field}" no "type" attr`)
        let ks5type
        if (isString(type)) {
            // convert to object!
            ks5type = get(mapping, type)
            if (!ks5type) throw new Error(`convertStringToTypes(): field "${field}" unknown "type" == ${type}`)
        } else if (isObject(type)) {
            ks5type = get(mapping, get(type, 'type'), type)
        }

        fieldObj['type'] = ks5type
    })
    return schema
}

function registerKeystone5Schema (gqlSchemaObject, keystone, globalPreprocessors = []) {
    const addSchema = (schemaObj) => registerKeystone5Schema(schemaObj, keystone, globalPreprocessors)
    if (gqlSchemaObject._type === GQL_LIST_SCHEMA_TYPE) {
        gqlSchemaObject._register(globalPreprocessors, { addSchema })
        gqlSchemaObject._keystone = keystone
        keystone.createList(gqlSchemaObject.name, {
            ...applyKeystoneV5AdminFixes(convertStringToTypes(gqlSchemaObject.registeredSchema)),
            queryLimits: { maxResults: 1000 },
        })  // create gqlSchemaObject._keystone.lists[gqlSchemaObject.name] as List type
        const keystoneList = get(keystone, ['lists', gqlSchemaObject.name])
        if (keystoneList) {
            // We need to save a shallow copy of createList config argument because
            // we want to use it in a future for kMigrator or some another extensions which need to define extra schema
            // extensions! It allow to use `this._keystone.lists[this.name].createListConfig`
            keystoneList.createListConfig = { ...gqlSchemaObject.schema }
            keystoneList.processedCreateListConfig = { ...gqlSchemaObject.registeredSchema }
        }
    } else if (gqlSchemaObject._type === GQL_CUSTOM_SCHEMA_TYPE) {
        gqlSchemaObject._register(globalPreprocessors, { addSchema })
        gqlSchemaObject._keystone = keystone
        keystone.extendGraphQLSchema(gqlSchemaObject.registeredSchema)
    } else {
        throw new Error('unknown schema object')
    }
}

/** @deprecated it's part of internal API use prepareKeystone instead */
function registerSchemas (keystone, modulesList, globalPreprocessors = []) {
    modulesList.forEach(
        (module) => {
            if (GQL_SCHEMA_TYPES.includes(module._type)) {
                registerKeystone5Schema(module, keystone, globalPreprocessors)
            } else {
                Object.values(module).forEach(
                    (GQLSchema) => {
                        if (GQL_SCHEMA_TYPES.includes(GQLSchema._type)) {
                            registerKeystone5Schema(GQLSchema, keystone, globalPreprocessors)
                        } else {
                            console.warn('Wrong schema module export format! What\'s this? ', GQLSchema)
                        }
                    })
            }
        })
}

module.exports = {
    convertStringToTypes,
    registerSchemas,
}
