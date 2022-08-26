import { GrowthBook, GrowthBookProvider, useGrowthBook } from '@growthbook/growthbook-react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import React, { createContext, useCallback, useContext, useEffect } from 'react'

const growthbook = new GrowthBook()

interface IFeatureFlagsContext {
    useFlag: (name: string) => boolean,
    updateContext: (context) => void
}

const FeatureFlagsContext = createContext<IFeatureFlagsContext>(null)

const useFeatureFlags = (): IFeatureFlagsContext => useContext(FeatureFlagsContext)

const FeatureFlagsProviderWrapper = ({ children }) => {
    const router = useRouter()
    const growthbook = useGrowthBook()

    const {
        publicRuntimeConfig: {
            featureToggleConfig,
        },
    } = getConfig()

    const featureToggleApiUrl = featureToggleConfig && featureToggleConfig.url
    const featureToggleApiKey = featureToggleConfig && featureToggleConfig.apiKey

    const updateContext = useCallback((context) => {
        const previousContext = growthbook.getAttributes()

        growthbook.setAttributes({ ...previousContext, ...context })
    }, [growthbook])
    const useFlag = useCallback((id) => growthbook.feature(id).on, [growthbook])

    useEffect(() => {
        if (featureToggleApiUrl && featureToggleApiKey) {
            fetch(`${featureToggleApiUrl}/${featureToggleApiKey}`)
                .then((res) => res.json())
                .then((json) => {
                    growthbook.setFeatures(json.features)
                })
        }
    }, [featureToggleApiKey, featureToggleApiUrl, growthbook, router.pathname])

    return (
        <FeatureFlagsContext.Provider value={{
            useFlag,
            updateContext,
        }}>
            {children}
        </FeatureFlagsContext.Provider>
    )
}

const FeatureFlagsProvider: React.FC = ({ children }) => {
    return (
        <GrowthBookProvider growthbook={growthbook}>
            <FeatureFlagsProviderWrapper>
                {children}
            </FeatureFlagsProviderWrapper>
        </GrowthBookProvider>
    )
}

export { useFeatureFlags, FeatureFlagsProvider }