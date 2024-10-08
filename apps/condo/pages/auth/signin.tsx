import { Col, Row } from 'antd'
import Head from 'next/head'
import React from 'react'

import { useIntl } from '@open-condo/next/intl'

import { TabsAuthAction } from '@condo/domains/common/components/HeaderActions'
import { SignInForm } from '@condo/domains/user/components/auth/SignInForm'
import AuthLayout, { AuthPage } from '@condo/domains/user/components/containers/AuthLayout'
import { WelcomeHeaderTitle } from '@condo/domains/user/components/UserWelcomeTitle'

const SignInPage: AuthPage = () => {
    const intl = useIntl()
    const SignInTitleMsg = intl.formatMessage({ id: 'pages.auth.SignInTitle' })

    return (
        <>
            <Head><title>{SignInTitleMsg}</title></Head>
            <Row justify='center'>
                <Col span={16}>
                    <TabsAuthAction currentActiveKey='signin'/>
                </Col>
                <Col span={24}>
                    <SignInForm/>
                </Col>
            </Row>
        </>
    )
}
SignInPage.container = AuthLayout
SignInPage.headerAction = <WelcomeHeaderTitle/>
export default SignInPage