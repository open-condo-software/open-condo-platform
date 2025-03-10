/**
 * Generated by `createschema meter.MeterUserSetting 'user:Relationship:User:CASCADE; meter:Relationship:Meter:CASCADE; name:Text'`
 */

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/meter/access/MeterUserSetting')
const { RESIDENT } = require('@condo/domains/user/constants/common')


const MeterUserSetting = new GQLListSchema('MeterUserSetting', {
    schemaDoc: `Custom user setting that a user with type ${RESIDENT} can assign to a specific meter device to make it easier to understand what kind of device it is`,
    fields: {

        user: {
            schemaDoc: 'User that created their custom meter setting',
            type: 'Relationship',
            ref: 'User',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        meter: {
            schemaDoc: 'Meter for which the user created custom setting',
            type: 'Relationship',
            ref: 'Meter',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        name: {
            schemaDoc: 'Custom meter name that a user assigned to a specific meter',
            type: 'Text',
            isRequired: true,
        },

    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['user', 'meter'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'Meter_user_setting_unique_user_meter',
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadMeterUserSetting,
        create: access.canManageMeterUserSetting,
        update: access.canManageMeterUserSetting,
        delete: false,
        auth: true,
    },
})

module.exports = {
    MeterUserSetting,
}
