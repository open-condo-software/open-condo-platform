import { useMemo } from 'react'
import { TicketPropertyHintWhereInput } from '@app/condo/schema'

import { FiltersMeta } from '@condo/domains/common/utils/filters.utils'
import { getStringContainsFilter } from '@condo/domains/common/utils/tables.utils'

const filterName = getStringContainsFilter('name')

export const usePropertyScopeTableFilters = (): Array<FiltersMeta<TicketPropertyHintWhereInput>> => {
    return useMemo(() => {
        return [
            {
                keyword: 'search',
                filters: [
                    filterName,
                ],
                combineType: 'OR',
            },
        ]
    }, [])
}