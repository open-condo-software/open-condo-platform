import { Col, Row, RowProps, Typography } from 'antd'
import React from 'react'

import { useIntl } from '@open-condo/next/intl'

import { fontSizes } from '@condo/domains/common/constants/style'
import { PageComponentType } from '@condo/domains/common/types'
import { PosterLayout } from '@condo/domains/user/components/containers/PosterLayout'

import { ErrorLayoutFooter, ErrorLayoutHeader } from './500'


const DESCRIPTION_TEXT_STYLE = { fontSize: fontSizes.content }
const ROW_MESSAGE_GUTTER: RowProps['gutter'] = [0, 14]
const Src404 = { poster: '/404Poster.webp', placeholder: '/404PosterPlaceholder.jpg' }

const Custom404: PageComponentType = () => {
    const intl = useIntl()
    const PageTitle = intl.formatMessage( { id: 'pages.condo.error.paymentLinkHandler.NotFoundTitle' })
    const DescriptionMessage = intl.formatMessage({ id: 'pages.condo.error.paymentLinkHandler.NotFoundDescription' })

    return (
        <Row justify='center'>
            <Col span={24}>
                <Row gutter={ROW_MESSAGE_GUTTER}>
                    <Col span={24}>
                        <Typography.Title>{PageTitle}</Typography.Title>
                    </Col>
                    <Col span={24}>
                        <Typography.Paragraph style={DESCRIPTION_TEXT_STYLE}>
                            {DescriptionMessage}
                        </Typography.Paragraph>
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}

const Error404Layout = (props): React.ReactElement => <PosterLayout
    {...props}
    Header={<ErrorLayoutHeader />}
    Footer={<ErrorLayoutFooter />}
    layoutBgImage={Src404}
/>

Custom404.container = Error404Layout
Custom404.isError = true
Custom404.skipUserPrefetch = true

export default Custom404
