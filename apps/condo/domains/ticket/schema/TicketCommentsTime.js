/**
 * Generated by `createschema ticket.TicketCommentsTime 'organization:Relationship:Organization:CASCADE; ticket:Relationship:Ticket:CASCADE; lastCommentAt:DateTimeUtc; lastResidentCommentAt:DateTimeUtc;'`
 */

const { Relationship, DateTimeUtc } = require('@keystonejs/fields')
const { GQLListSchema, getById } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/ticket/access/TicketCommentsTime')
const get = require('lodash/get')
const { addOrganizationFieldPlugin } = require('@condo/domains/organization/schema/plugins/addOrganizationFieldPlugin')

const TicketCommentsTime = new GQLListSchema('TicketCommentsTime', {
    schemaDoc: 'The time of the last comment and the last comment of the resident in a specific ticket',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        ticket: {
            schemaDoc: 'Link to the ticket',
            type: Relationship,
            ref: 'Ticket',
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        lastCommentAt: {
            schemaDoc: 'Time of last comment in this ticket',
            type: DateTimeUtc,
            isRequired: true,
        },

        lastResidentCommentAt: {
            schemaDoc: 'Time of last resident\'s comment in this ticket',
            type: DateTimeUtc,
        },
    },
    plugins: [
        addOrganizationFieldPlugin({ fromField: 'ticket', isRequired: true }),
        uuided(),
        versioned(),
        tracked(),
        softDeleted(),
        historical(),
    ],
    access: {
        read: access.canReadTicketCommentsTimes,
        create: access.canManageTicketCommentsTimes,
        update: access.canManageTicketCommentsTimes,
        delete: false,
        auth: true,
    },
})

module.exports = {
    TicketCommentsTime,
}
