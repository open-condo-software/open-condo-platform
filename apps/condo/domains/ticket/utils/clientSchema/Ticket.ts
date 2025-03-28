/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; details:Text; meta?:Json;`
 */

import {
    Ticket,
    TicketCreateInput,
    TicketUpdateInput,
    QueryAllTicketsArgs,
    TicketStatusTypeType,
} from '@app/condo/schema'
import dayjs, { Dayjs } from 'dayjs'
import { get, isUndefined, isNull } from 'lodash'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { Ticket as TicketGQL } from '@condo/domains/ticket/gql'

const RELATIONS = ['status', 'client', 'contact', 'operator', 'assignee', 'organization', 'source', 'property', 'executor', 'related', 'classifier']
const DISCONNECT_ON_NULL = ['assignee', 'executor', 'contact']
const IGNORE_FIELDS = ['invoices', 'existedInvoices', 'createdByType', 'initialNotDraftInvoices', 'invoicesInNotCanceledStatus']

export interface ITicketFormState {
    id?: undefined
    organization?: string
    status?: string
    source?: string
    classifier?: string
    canReadByResident?: boolean
    lastResidentCommentAt?: string
    assignee?: string
    operator?: string
    client?: string
    contact?: string
    clientPhone?: string
    clientName?: string
    deadline?: Dayjs
    sectionName?: string
    floorName?: string
    unitName?: string
}

type TicketMutationType = TicketUpdateInput | TicketCreateInput

function convertToFormState (ticket: Ticket): ITicketFormState | undefined {
    if (!ticket) return
    const result: ITicketFormState = {}
    const deadline = ticket['deadline']
    const statusType = get(ticket,  'status.type', null)
    const deferredUntil = statusType === TicketStatusTypeType.Deferred ? ticket['deferredUntil'] : undefined

    for (const key of Object.keys(ticket)) {
        const relationId = get(ticket[key], 'id')
        result[key] = relationId || ticket[key]

        if (key === 'createdBy') {
            result['createdByType'] = get(ticket[key], 'type')
        }
    }

    result['deadline'] = !isNull(deadline) ? dayjs(deadline) : deadline
    deferredUntil && (result['deferredUntil'] = deferredUntil && dayjs(deferredUntil))
    result['statusType'] = statusType

    return result
}

function formValuesProcessor (formValues: ITicketFormState): TicketMutationType {
    const result: TicketMutationType = {}
    for (const key of Object.keys(formValues)) {
        if (IGNORE_FIELDS.includes(key)) continue
        
        const isRelation = RELATIONS.includes(key)
        if (isRelation) {
            if (DISCONNECT_ON_NULL.includes(key) && formValues[key] === null) {
                result[key] = { disconnectAll: true }
            } else if (formValues[key]) {
                result[key] = { connect: { id: formValues[key] } }
            }
        } else if (!isUndefined(formValues[key])) {
            if (key === 'deadline' && !isNull(formValues[key])) {
                result[key] = formValues[key].toISOString()
            }
            result[key] = formValues[key]
        }
    }

    return result
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
} = generateReactHooks<Ticket, TicketCreateInput, TicketUpdateInput, QueryAllTicketsArgs>(TicketGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
    convertToFormState,
    formValuesProcessor,
}