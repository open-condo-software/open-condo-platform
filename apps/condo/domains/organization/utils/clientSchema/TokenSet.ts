/**
 * Generated by `createschema organization.TokenSet 'user:Relationship:User:SET_NULL; organization:Relationship:Organization:SET_NULL; importRemoteSystem:Text; accessToken:Text; accessTokenExpiresAt:DateTimeUtc; refreshToken:Text; refreshTokenExpiresAt:DateTimeUtc;'`
 */

import {
    TokenSet,
    TokenSetCreateInput,
    TokenSetUpdateInput,
    QueryAllTokenSetsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'
import { TokenSet as TokenSetGQL } from '@condo/domains/organization/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<TokenSet, TokenSetCreateInput, TokenSetUpdateInput, QueryAllTokenSetsArgs>(TokenSetGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
