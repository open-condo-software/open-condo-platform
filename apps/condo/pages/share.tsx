import dayjs from 'dayjs'
import get from 'lodash/get'
import getConfig from 'next/config'
import Head from 'next/head'
import Router from 'next/router'
import React, { useEffect } from 'react'

import { useIntl } from '@open-condo/next/intl'

import BaseLayout, { PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { LOCALES } from '@condo/domains/common/constants/locale'
import { PageComponentType } from '@condo/domains/common/types'
import { unpackShareData } from '@condo/domains/ticket/utils/shareDataPacker'


function RedirectToTicket ({ ticketId }) {
    const intl = useIntl()
    const RedirectingMessage = intl.formatMessage({ id: 'Redirecting' })

    useEffect(() => {
        const clearHandle = setTimeout(() => {
            Router.push(`/ticket/${ticketId}`)
        }, 0)
        return () => {
            clearTimeout(clearHandle)
        }
    })

    return <h1>{RedirectingMessage}</h1>
}

interface ShareProps {
    number: string
    details: string
    id: string
    date: string
}

const Share: PageComponentType<ShareProps> = ({ date, number, details, id }) => {
    const intl = useIntl()
    const locale = get(LOCALES, intl.locale)
    const localizedDate = locale ? dayjs(date || 0).locale(locale) : dayjs(date || 0)
    const dateFormatted = localizedDate.format('D MMMM YYYY')

    const ShareTitleMessage = intl.formatMessage({ id: 'ticket.shareTitle' }, {
        date: dateFormatted,
        number,
    })
    const ShareDetailsMessage = intl.formatMessage({ id: 'ticket.shareDetails' }, {
        details,
    })

    let origin = 'http://localhost:3000'
    if (typeof window !== 'undefined') {
        origin = window.location.origin
    } else {
        ({
            publicRuntimeConfig: { serverUrl: origin },
        } = getConfig())
    }

    return (
        <>
            <Head>
                <meta property='og:site_name' content={ShareTitleMessage} />
                <meta property='og:title' content={ShareTitleMessage} />
                <meta property='og:description' content={ShareDetailsMessage} />
                <meta property='og:updated_time' content='14400000' />
                <meta property='og:image' content={`${origin}/logoSnippet.png`} />
            </Head>
            <RedirectToTicket ticketId={id} />
        </>
    )
}

export const getServerSideProps = ({ query }) => {
    const packedData = query.q.replace(/\s/gm, '+')
    const shareParams = unpackShareData(packedData)
    return { props: JSON.parse(shareParams) }
}

const EmptyLayout = ({ children, ...props }) => {
    return <BaseLayout
        {...props}
        logoLocation='topMenu'
        className='top-menu-only-layout'
    >
        <PageWrapper>
            {children}
        </PageWrapper>
    </BaseLayout>
}

Share.container = EmptyLayout
Share.skipUserPrefetch = true

export default Share
