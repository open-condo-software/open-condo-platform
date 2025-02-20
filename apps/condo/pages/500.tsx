import { Col, Row } from 'antd'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import React, { useCallback } from 'react'

import { useAuth } from '@open-condo/next/auth'
import { useIntl } from '@open-condo/next/intl'
import { Typography } from '@open-condo/ui'

import { Logo } from '@condo/domains/common/components/Logo'
import { colors } from '@condo/domains/common/constants/style'
import { PageComponentType } from '@condo/domains/common/types'
import { PosterLayout } from '@condo/domains/user/components/containers/PosterLayout'


const LOGO_HEADER_STYLES = { width: '100%', justifyContent: 'space-between' }
const HEADER_LOGO_STYLE: React.CSSProperties = { cursor: 'pointer' }
const TYPOGRAPHY_CONTACT_STYLE: React.CSSProperties = { color: colors.black }

const {
    publicRuntimeConfig: { HelpRequisites: { support_email: SUPPORT_EMAIL = null, support_phone: SUPPORT_PHONE = null } },
} = getConfig()

const Src500 = { poster: '/500Poster.webp', placeholder: '/500PosterPlaceholder.jpg' }

const Custom500: PageComponentType = () => {
    const intl = useIntl()
    const PageTitle = intl.formatMessage( { id: 'pages.condo.error.PageTitle' })
    const DescriptionMessage = intl.formatMessage({ id: 'pages.condo.error.Description' })

    return (
        <Row justify='space-between'>
            <Col span={24}>
                <Row gutter={[0, 24]} justify='center'>
                    <Col span={24}>
                        <Typography.Title>{PageTitle}</Typography.Title>
                    </Col>
                    <Col span={24}>
                        <Typography.Paragraph>
                            {DescriptionMessage}
                        </Typography.Paragraph>
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}

export const ErrorLayoutHeader = () => {
    const { push } = useRouter()
    const { isAuthenticated } = useAuth()

    const handleLogoClick = useCallback(() => {
        if (isAuthenticated) {
            push('/')
        } else {
            push('/auth/signin')
        }
    }, [isAuthenticated, push])

    return (
        <Row style={LOGO_HEADER_STYLES}>
            <Col style={HEADER_LOGO_STYLE}>
                <Logo onClick={handleLogoClick}/>
            </Col>
        </Row>
    )
}

export const ErrorLayoutFooter = () => {
    return SUPPORT_EMAIL && SUPPORT_PHONE && (
        <Typography.Paragraph type='secondary' >
            <Typography.Link
                href={`mailto:${SUPPORT_EMAIL}`}
                style={TYPOGRAPHY_CONTACT_STYLE}
            >
                {SUPPORT_EMAIL}
            </Typography.Link>
                    ,&nbsp;
            <Typography.Link
                href={`tel:${SUPPORT_PHONE}`}
                style={TYPOGRAPHY_CONTACT_STYLE}
            >
                {SUPPORT_PHONE}
            </Typography.Link>
        </Typography.Paragraph>
    )
}

const Error500Layout = (props): React.ReactElement => <PosterLayout
    {...props}
    Header={<ErrorLayoutHeader />}
    Footer={<ErrorLayoutFooter />}
    layoutBgImage={Src500}
/>

Custom500.container = Error500Layout
Custom500.isError = true
Custom500.skipUserPrefetch = true

export default Custom500
