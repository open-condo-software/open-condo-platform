/**
 * Generated by `createschema meter.MeterResource 'name:Text;'`
 */

const { LocalizedText } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')

const MeterResource = new GQLListSchema('MeterResource', {
    schemaDoc: 'Kind of consumed resource, measured by meter',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        name: {
            type: LocalizedText,
            isRequired: true,
            template: 'meterResource.*.name',
        },

        measure: {
            type: LocalizedText,
            isRequired: true,
            template: 'meterResource.*.measure',
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: true,
        create: false,
        update: false,
        delete: false,
        auth: false,
    },
    escapeSearch: true,
})

module.exports = {
    MeterResource,
}
