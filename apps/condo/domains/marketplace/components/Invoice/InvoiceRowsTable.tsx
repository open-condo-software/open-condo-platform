import { Invoice } from '@app/condo/schema'
import { Table as AntdTable } from 'antd'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import React, { useCallback, useMemo } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { Typography } from '@open-condo/ui'

import { Table } from '@condo/domains/common/components/Table/Index'
import { getTableCellRenderer } from '@condo/domains/common/components/Table/Renders'
import { DEFAULT_INVOICE_CURRENCY_CODE } from '@condo/domains/marketplace/constants'
import { MarketItem } from '@condo/domains/marketplace/utils/clientSchema'
import { getMoneyRender } from '@condo/domains/marketplace/utils/clientSchema/Invoice'
import { PriceMeasuresType } from '@condo/domains/marketplace/utils/clientSchema/MarketItem'


const useInvoiceRowsTableColumns = (currencyCode, marketItems) => {
    const intl = useIntl()
    const NameMessage = intl.formatMessage({ id: 'pages.condo.marketplace.invoice.id.table.header.name' })
    const SkuMessage = intl.formatMessage({ id: 'pages.condo.marketplace.invoice.id.table.header.sku' })
    const CountMessage = intl.formatMessage({ id: 'pages.condo.marketplace.invoice.id.table.header.count' })
    const PriceMessage = intl.formatMessage({ id: 'pages.condo.marketplace.invoice.id.table.header.price' })
    const ToPayMessage = intl.formatMessage({ id: 'pages.condo.marketplace.invoice.id.table.header.toPay' })
    const ContractPriceMessage = intl.formatMessage({ id: 'pages.condo.marketplace.invoice.form.contractPrice' }).toLowerCase()

    const render = useMemo(() => getTableCellRenderer(), [])
    const renderWithEmptyValue = useCallback((value) => {
        if (!value) return '—'

        return render(value)
    }, [render])
    const moneyRender = useMemo(() => getMoneyRender(intl, currencyCode), [currencyCode, intl])
    const toPayRender = useCallback((row, count, options = {}) => {

        const showMeasure = get(options, 'showMeasure', false)

        const toPay = get(row, 'toPay')
        const isMin = get(row, 'isMin')
        const measure: PriceMeasuresType = get(row, 'measure')

        let value
        if (isMin) {
            if (toPay === '0') {
                value = ContractPriceMessage
            } else {
                const toPayStr = String(+toPay * count)
                value = moneyRender(toPayStr, true)
            }
        } else {
            const toPayStr = String(+toPay * count)
            value = moneyRender(toPayStr, false)
        }

        if (value !== ContractPriceMessage && showMeasure) {
            value += measure ? `/${intl.formatMessage({ id: `pages.condo.marketplace.measure.${measure}.short` })}` : ''
        }

        return renderWithEmptyValue(value)
    }, [ContractPriceMessage, moneyRender, renderWithEmptyValue])

    const renderMarketItemName = useCallback((value, row) => {
        const sku = get(row, 'sku')
        if (!sku) {
            return render(value)
        }

        const marketItemWithSameSku = marketItems.find(marketItem => marketItem.sku === sku)
        if (!marketItemWithSameSku) {
            return render(value)
        }

        const renderLink = getTableCellRenderer({ href: `/marketplace/marketItem/${marketItemWithSameSku.id}`, target: '_blank' })
        return renderLink(value)
    }, [marketItems, render])

    return [
        {
            title: NameMessage,
            dataIndex: 'name',
            key: 'name',
            width: '30%',
            render: renderMarketItemName,
        },
        {
            title: SkuMessage,
            dataIndex: 'sku',
            key: 'sku',
            width: '23%',
            render: renderWithEmptyValue,
        },
        {
            title: CountMessage,
            dataIndex: 'count',
            key: 'count',
            width: '9%',
            render,
        },
        {
            title: PriceMessage,
            dataIndex: 'toPay',
            key: 'toPay',
            width: '19%',
            render: (_, row) => toPayRender(row, 1, { showMeasure: true }),
        },
        {
            title: ToPayMessage,
            key: 'totalToPay',
            width: '19%',
            render: (row) => toPayRender(row, get(row, 'count')),
        },
    ]
}

type InvoiceRowsTableProps = {
    invoice: Invoice
}

export const InvoiceRowsTable: React.FC<InvoiceRowsTableProps> = ({ invoice }) => {
    const intl = useIntl()
    const NegotiatedPriceMessage = intl.formatMessage({ id: 'pages.condo.marketplace.invoice.form.contractPrice' }).toLowerCase()

    const currencyCode = get(invoice, 'currencyCode') || DEFAULT_INVOICE_CURRENCY_CODE
    const rows = useMemo(() => get(invoice, 'rows') || [], [invoice])
    const organizationId = get(invoice, 'organization.id') || get(invoice, 'organization')
    const skuItems = rows.map(({ sku }) => sku).filter(Boolean)

    const { objs: marketItems, loading: marketItemsLoading } = MarketItem.useObjects({
        where: {
            sku_in: skuItems,
            organization: { id: organizationId },
        },
    }, { skip: isEmpty(skuItems) || !organizationId })

    const orderColumns = useInvoiceRowsTableColumns(currencyCode, marketItems)

    const moneyRender = useMemo(() => getMoneyRender(intl, currencyCode), [currencyCode, intl])
    const totalPrice = rows.filter(row => row.toPay !== '0').reduce((acc, row) => acc + Number(row.toPay) * row.count, 0)
    const hasMinPrice = rows.some(row => row.isMin)
    const isNegotiatedPay = rows.every(row => row.isMin && row.toPay === '0')

    const SummaryContent = useCallback(() => (
        <AntdTable.Summary fixed>
            <AntdTable.Summary.Row>
                {
                    Array.from({ length: orderColumns.length - 1 }, (_, index) => index)
                        .map(index => <AntdTable.Summary.Cell key={index} index={index} colSpan={1} />)
                }
                <AntdTable.Summary.Cell index={orderColumns.length} colSpan={1}>
                    <Typography.Text strong>{isNegotiatedPay ? NegotiatedPriceMessage : moneyRender(String(totalPrice), hasMinPrice)}</Typography.Text>
                </AntdTable.Summary.Cell>
            </AntdTable.Summary.Row>
        </AntdTable.Summary>
    ), [NegotiatedPriceMessage, hasMinPrice, isNegotiatedPay, moneyRender, orderColumns.length, totalPrice])

    return (
        <Table
            totalRows={rows.length}
            loading={marketItemsLoading}
            dataSource={rows}
            columns={orderColumns}
            pagination={false}
            summary={SummaryContent}
        />
    )
}