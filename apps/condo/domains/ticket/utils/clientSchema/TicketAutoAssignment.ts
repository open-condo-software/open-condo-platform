/**
 * Generated by `createschema ticket.TicketAutoAssignment 'assignee:Relationship:OrganizationEmployee:SET_NULL;executor:Relationship:OrganizationEmployee:SET_NULL;classifier:Relationship:TicketClassifier:CASCADE;'`
 */

import {
    TicketAutoAssignment,
    TicketAutoAssignmentCreateInput,
    TicketAutoAssignmentUpdateInput,
    QueryAllTicketAutoAssignmentsArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { TicketAutoAssignment as TicketAutoAssignmentGQL } from '@condo/domains/ticket/gql'


const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useAllObjects,
    useSoftDeleteMany,
} = generateReactHooks<TicketAutoAssignment, TicketAutoAssignmentCreateInput, TicketAutoAssignmentUpdateInput, QueryAllTicketAutoAssignmentsArgs>(TicketAutoAssignmentGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useAllObjects,
    useSoftDeleteMany,
}
