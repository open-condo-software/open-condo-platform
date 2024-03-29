/**
 * Generated by `createschema news.NewsItemScope 'newsItem:Relationship:NewsItem:CASCADE; property:Relationship:Property:CASCADE; unitType:Select:get,from,constant,unit_types; unitName:Text'`
 */

import {
    NewsItemScope,
    NewsItemScopeCreateInput,
    NewsItemScopeUpdateInput,
    QueryAllNewsItemScopesArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { NewsItemScope as NewsItemScopeGQL } from '@condo/domains/news/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useAllObjects,
    useSoftDeleteMany,
    useCreateMany,
} = generateReactHooks<NewsItemScope, NewsItemScopeCreateInput, NewsItemScopeUpdateInput, QueryAllNewsItemScopesArgs>(NewsItemScopeGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useAllObjects,
    useSoftDeleteMany,
    useCreateMany,
}
