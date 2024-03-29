/**
 * Generated by `createschema onboarding.OnBoarding 'completed:Checkbox; stepsTransitions:Json;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { gql } = require('graphql-tag')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')


const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const ON_BOARDING_FIELDS = `{ completed stepsTransitions ${COMMON_FIELDS} type user { id } }`
const OnBoarding = generateGqlQueries('OnBoarding', ON_BOARDING_FIELDS)

const ON_BOARDING_STEP_FIELDS = `{ icon title titleNonLocalized description descriptionNonLocalized action entity onBoarding { id } ${COMMON_FIELDS} completed required order }`
const OnBoardingStep = generateGqlQueries('OnBoardingStep', ON_BOARDING_STEP_FIELDS)

const CREATE_ONBOARDING_MUTATION = gql`
    mutation createOnBoardingByType ($data: CreateOnBoardingInput!) {
        result: createOnBoardingByType(data: $data) {
            id
        }
    }
`

const TOUR_STEP_FIELDS = `{ organization { id } type status order ${COMMON_FIELDS} }`
const TourStep = generateGqlQueries('TourStep', TOUR_STEP_FIELDS)

const SYNC_TOUR_STEPS_MUTATION = gql`
    mutation syncTourSteps ($data: SyncTourStepsInput!) {
        result: syncTourSteps(data: $data) { ok }
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    OnBoarding,
    OnBoardingStep,
    CREATE_ONBOARDING_MUTATION,
    TourStep,
    SYNC_TOUR_STEPS_MUTATION,
/* AUTOGENERATE MARKER <EXPORTS> */
}
