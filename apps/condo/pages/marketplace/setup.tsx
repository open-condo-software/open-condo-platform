import { Row, Col, RowProps } from 'antd'
import get from 'lodash/get'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import { StepItem } from '@open-condo/ui'
import { Typography, Steps } from '@open-condo/ui'

import { CONTEXT_FINISHED_STATUS } from '@condo/domains/acquiring/constants/context'
import { AcquiringIntegrationContext } from '@condo/domains/acquiring/utils/clientSchema'
import { useOnboardingProgress } from '@condo/domains/billing/hooks/useOnboardingProgress'
import { PageHeader, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { TablePageContent } from '@condo/domains/common/components/containers/BaseLayout/BaseLayout'
import { PageComponentType } from '@condo/domains/common/types'
import { OfferSetupPage } from '@condo/domains/marketplace/components/MarketplaceOnboarding/OfferSetupPage'
import { RequisitesSetup } from '@condo/domains/marketplace/components/MarketplaceOnboarding/RequisitesSetup'
import {
    MarketplaceSetupPermissionRequired,
} from '@condo/domains/marketplace/components/PageAccess'


const STEPS_GUTTER: RowProps['gutter'] = [60, 60]
const FULL_COL_SPAN = 24

type MarketplaceOnboardingPageProps = {
    onFinish: () => void
    withVerification?: boolean
}

const MarketplaceOnboardingPage: PageComponentType<MarketplaceOnboardingPageProps> = ({ onFinish, withVerification }) => {
    const intl = useIntl()

    const PageTitle = intl.formatMessage({ id: 'pages.condo.marketplace.settings.mainTitle' })
    const RequisitesSettingsTitle = intl.formatMessage({ id: 'pages.condo.marketplace.settings.requisites.title' })
    const OfferSettingsTitle = intl.formatMessage({ id: 'pages.condo.marketplace.settings.offer.title' })
    const StepNoReturnMessage = intl.formatMessage({ id: 'accrualsAndPayments.setup.noReturn' })

    const router = useRouter()

    const [currentStep] = useOnboardingProgress(withVerification)

    const { organization } = useOrganization()
    const orgId = get(organization, 'id', null)

    const {
        obj: acquiringContext,
        loading: acquiringContextLoading,
        error: acquiringContextError,
        refetch: refetchAcquiringContext,
    } = AcquiringIntegrationContext.useObject({
        where: {
            organization: { id: orgId },
        },
    })

    const handleFinishSetup = useCallback(async () => {
        await refetchAcquiringContext()
    }, [refetchAcquiringContext])

    // if setup is already done --> forward back to marketplace main page
    useEffect(() => {
        if (get(acquiringContext, 'invoiceStatus') === CONTEXT_FINISHED_STATUS && !acquiringContextError && !acquiringContextLoading) {
            router.push('/marketplace')
        }
    }, [acquiringContext, acquiringContextError, acquiringContextLoading, router])

    const stepItems: Array<StepItem> = useMemo(() => {
        const steps: Array<StepItem> = [
            { title: RequisitesSettingsTitle, breakPoint: true },
            { title: OfferSettingsTitle },
        ]
        return steps
    }, [
        RequisitesSettingsTitle,
        OfferSettingsTitle,
    ])

    const handleReturn = useCallback((newStep: number) => {
        router.push({ query: { ...router.query, step: newStep } }, undefined, { shallow: true })
    }, [router])

    const currentScreen = useMemo(() => {
        if (currentStep === 1) {
            return <OfferSetupPage onFinish={handleFinishSetup}/>
        }

        return <RequisitesSetup />
    }, [currentStep, handleFinishSetup])

    return (
        <>
            <Head>
                <title>{PageTitle}</title>
            </Head>
            <PageWrapper>
                <PageHeader title={<Typography.Title>{PageTitle}</Typography.Title>}/>
                <TablePageContent>
                    <Row gutter={STEPS_GUTTER}>
                        <Col span={FULL_COL_SPAN}>
                            <Steps
                                onChange={handleReturn}
                                items={stepItems}
                                current={currentStep}
                                noReturnMessage={StepNoReturnMessage}
                            />
                        </Col>
                        <Col span={FULL_COL_SPAN}>
                            {currentScreen}
                        </Col>
                    </Row>
                </TablePageContent>
            </PageWrapper>
        </>
    )
}

MarketplaceOnboardingPage.requiredAccess = MarketplaceSetupPermissionRequired

export default MarketplaceOnboardingPage
