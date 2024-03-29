/**
 * Generated by `createschema marketplace.MarketItemFile 'marketItem:Relationship:MarketItem:CASCADE; file:File;'`
 */

import {
    MarketItemFile,
    MarketItemFileCreateInput,
    MarketItemFileUpdateInput,
    QueryAllMarketItemFilesArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { MarketItemFile as MarketItemFileGQL } from '@condo/domains/marketplace/gql'


const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<MarketItemFile, MarketItemFileCreateInput, MarketItemFileUpdateInput, QueryAllMarketItemFilesArgs>(MarketItemFileGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
