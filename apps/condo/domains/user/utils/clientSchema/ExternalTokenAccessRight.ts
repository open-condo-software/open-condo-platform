/**
 * Generated by `createschema user.ExternalTokenAccessRight 'type:Text; user:Relationship:User:CASCADE;'`
 */

import {
    ExternalTokenAccessRight,
    ExternalTokenAccessRightCreateInput,
    ExternalTokenAccessRightUpdateInput,
    QueryAllExternalTokenAccessRightsArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { ExternalTokenAccessRight as ExternalTokenAccessRightGQL } from '@condo/domains/user/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<ExternalTokenAccessRight, ExternalTokenAccessRightCreateInput, ExternalTokenAccessRightUpdateInput, QueryAllExternalTokenAccessRightsArgs>(ExternalTokenAccessRightGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
