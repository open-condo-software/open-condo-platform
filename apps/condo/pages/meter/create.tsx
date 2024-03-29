import { Typography, Row, Col, Tabs } from 'antd'
import { Gutter } from 'antd/es/grid/row'
import Head from 'next/head'
import React, { useCallback, useState } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import { Tour } from '@open-condo/ui'



import { PageContent, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import {
    CreateMeterReadingsForm,
    CreatePropertyMeterReadingsForm,
} from '@condo/domains/meter/components/CreateMeterReadingsForm'
import {
    MeterReadAndManagePermissionRequired,
} from '@condo/domains/meter/components/PageAccess'
import { METER_PAGE_TYPES, MeterPageTypes } from '@condo/domains/meter/utils/clientSchema'

interface ICreateMeterPage extends React.FC {
    headerAction?: JSX.Element
    requiredAccess?: React.FC
}

const CREATE_METER_PAGE_GUTTER: [Gutter, Gutter] = [12, 40]

const CreateMeterPage: ICreateMeterPage = () => {
    const intl = useIntl()
    const PageTitle = intl.formatMessage({ id: 'meter.AddMeterReadings' })
    const MeterMessage = intl.formatMessage({ id: 'pages.condo.meter.index.meterTab' })
    const PropertyMeterMessage = intl.formatMessage({ id: 'pages.condo.meter.index.propertyMeterTab' })

    const { link: { role = {} }, organization } = useOrganization()

    const [tab, setTab] = useState<MeterPageTypes>(METER_PAGE_TYPES.meter)

    const handleTabChange = useCallback((tab: MeterPageTypes) => {
        setTab(tab)
    }, [])

    return (
        <>
            <Head>
                <title>{PageTitle}</title>
            </Head>
            <PageWrapper>
                <PageContent>
                    <Row gutter={CREATE_METER_PAGE_GUTTER}>
                        <Col span={24}>
                            <Typography.Title level={1}>{PageTitle}</Typography.Title>
                        </Col>
                        <Tabs activeKey={tab} onChange={handleTabChange}>
                            <Tabs.TabPane tab={MeterMessage} key={METER_PAGE_TYPES.meter} />
                            <Tabs.TabPane tab={PropertyMeterMessage} key={METER_PAGE_TYPES.propertyMeter} />
                        </Tabs>
                        <Col span={24}>
                            {
                                tab === METER_PAGE_TYPES.propertyMeter ? (
                                    <CreatePropertyMeterReadingsForm
                                        organization={organization}
                                        role={role}
                                    />
                                ) : (
                                    <Tour.Provider>
                                        <CreateMeterReadingsForm
                                            organization={organization}
                                            role={role}
                                        />
                                    </Tour.Provider>
                                )
                            }
                        </Col>
                    </Row>
                </PageContent>
            </PageWrapper>
        </>
    )
}

CreateMeterPage.requiredAccess = MeterReadAndManagePermissionRequired

export default CreateMeterPage