/**
 * Generated by `createschema ticket.CallRecordFragment 'ticket:Relationship:Ticket:CASCADE;callRecord:Relationship:CallRecord:CASCADE;'`
 */

import {
    CallRecordFragment,
    CallRecordFragmentCreateInput,
    CallRecordFragmentUpdateInput,
    QueryAllCallRecordFragmentsArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { CallRecordFragment as CallRecordFragmentGQL } from '@condo/domains/ticket/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
} = generateReactHooks<CallRecordFragment, CallRecordFragmentCreateInput, CallRecordFragmentUpdateInput, QueryAllCallRecordFragmentsArgs>(CallRecordFragmentGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
}
