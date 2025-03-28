/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; details:Text; meta?:Json;`
 */

const { get, isEmpty, omit, uniq } = require('lodash')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById, find } = require('@open-condo/keystone/schema')

const { canReadObjectsAsB2BAppServiceUser, canManageObjectsAsB2BAppServiceUser } = require('@condo/domains/miniapp/utils/b2bAppServiceUserAccess')
const {
    checkPermissionsInEmployedOrRelatedOrganizations,
    getEmployedOrRelatedOrganizationsByPermissions,
} = require('@condo/domains/organization/utils/accessSchema')
const { getUserResidents } = require('@condo/domains/resident/utils/accessSchema')
const { Resident } = require('@condo/domains/resident/utils/serverSchema')
const { CANCELED_STATUS_TYPE, BULK_UPDATE_ALLOWED_FIELDS } = require('@condo/domains/ticket/constants')
const {
    AVAILABLE_TICKET_FIELDS_FOR_UPDATE_BY_RESIDENT,
    INACCESSIBLE_TICKET_FIELDS_FOR_MANAGE_BY_RESIDENT,
    INACCESSIBLE_TICKET_FIELDS_FOR_MANAGE_BY_STAFF,
} = require('@condo/domains/ticket/constants/common')
const { RESIDENT, SERVICE, STAFF } = require('@condo/domains/user/constants/common')
const { canDirectlyManageSchemaObjects, canDirectlyReadSchemaObjects } = require('@condo/domains/user/utils/directAccess')

async function canReadTickets (args) {
    const { authentication: { item: user }, listKey, context } = args

    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    const hasDirectAccess = await canDirectlyReadSchemaObjects(user, listKey)
    if (hasDirectAccess) return {}

    if (user.type === SERVICE) {
        return await canReadObjectsAsB2BAppServiceUser(args)
    }

    if (user.type === RESIDENT) {
        const residents = await getUserResidents(context, user)

        if (isEmpty(residents)) return false

        return {
            client: { id: user.id },
            canReadByResident: true,
        }
    }

    const permittedOrganizations = await getEmployedOrRelatedOrganizationsByPermissions(context, user, 'canReadTickets')

    return {
        organization: {
            id_in: permittedOrganizations,
        },
    }
}

async function canManageTickets (args) {
    const { authentication: { item: user }, operation, itemId, itemIds, originalInput, context, listKey } = args

    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    const isBulkRequest = Array.isArray(originalInput)

    const hasDirectAccess = await canDirectlyManageSchemaObjects(user, listKey, originalInput, operation)
    if (hasDirectAccess) return true

    if (isBulkRequest && (user.type !== STAFF || operation !== 'update')) return false

    if (user.type === SERVICE) {
        return await canManageObjectsAsB2BAppServiceUser(args)
    }

    if (user.type === RESIDENT) {
        const changedInaccessibleFields = Object.keys(originalInput).some(field => INACCESSIBLE_TICKET_FIELDS_FOR_MANAGE_BY_RESIDENT.includes(field))
        if (changedInaccessibleFields) return false

        if (operation === 'create') {
            const unitName = get(originalInput, 'unitName', null)
            const propertyId = get(originalInput, ['property', 'connect', 'id'])

            if (!unitName || !propertyId) return false

            const residentsCount = await Resident.count(context, {
                user: { id: user.id },
                property: { id: propertyId, deletedAt: null },
                unitName,
                deletedAt: null,
            })

            return residentsCount > 0
        } else if (operation === 'update') {
            if (!itemId) return false

            const inaccessibleUpdatedFields = omit(originalInput, AVAILABLE_TICKET_FIELDS_FOR_UPDATE_BY_RESIDENT)
            if (!isEmpty(inaccessibleUpdatedFields)) return false

            const ticket = await getById('Ticket', itemId)
            if (!ticket) return false

            const updatedStatusId = get(originalInput, 'status.connect.id')
            if (updatedStatusId) {
                const ticketStatus = await getById('TicketStatus', updatedStatusId)

                if (!ticketStatus) return false
                if (ticketStatus.organization && ticketStatus.organization !== ticket.organization) return false
                if (ticketStatus.type !== CANCELED_STATUS_TYPE) return false
            }

            return ticket.client === user.id
        }
    } else {
        // TODO: DOMA-10832 add check employee organization in Ticket access
        if (isBulkRequest && operation === 'update') {
            if (itemIds.length !== uniq(itemIds).length) return false
            if (itemIds.length !== originalInput.length) return false

            const changedInaccessibleFields = !originalInput.every((updateItem) => {
                return Object.keys(updateItem.data).every(key => BULK_UPDATE_ALLOWED_FIELDS.includes(key))
            })
            if (changedInaccessibleFields) return false

            const tickets = await find('Ticket', {
                id_in: itemIds,
                deletedAt: null,
            })

            const ticketOrganizationIds = uniq(tickets.map(ticket => get(ticket, 'organization', null)))
            if (isEmpty(ticketOrganizationIds) || ticketOrganizationIds.some(ticketOrganizationId => !ticketOrganizationId)) return false
                
            return await checkPermissionsInEmployedOrRelatedOrganizations(context, user, ticketOrganizationIds, 'canManageTickets')
        }

        const changedInaccessibleFields = Object.keys(originalInput).some(field => INACCESSIBLE_TICKET_FIELDS_FOR_MANAGE_BY_STAFF.includes(field))
        if (changedInaccessibleFields) return false

        let organizationId

        if (operation === 'create') {
            organizationId = get(originalInput, ['organization', 'connect', 'id'])
        } else if (operation === 'update') {
            if (!itemId) return false
            const ticket = await getById('Ticket', itemId)
            organizationId = get(ticket, 'organization', null)
        }

        if (!organizationId) return false

        const permission = await checkPermissionsInEmployedOrRelatedOrganizations(context, user, organizationId, 'canManageTickets')
        if (!permission) return false

        const propertyId = get(originalInput, ['property', 'connect', 'id'], null)
        if (propertyId) {
            const property = await getById('Property', propertyId)
            if (!property) return false

            return organizationId === get(property, 'organization')
        }

        return true
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTickets,
    canManageTickets,
}
