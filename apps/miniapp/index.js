const { CondoOIDCMiddleware } = require('@app/miniapp/middlewares/oidc')
const { NextApp } = require('@open-keystone/app-next')

const conf = require('@open-condo/config')
const { HealthCheck, getPostgresHealthCheck, getRedisHealthCheck } = require('@open-condo/keystone/healthCheck')
const { prepareKeystone } = require('@open-condo/keystone/KSv5v6/v5/prepareKeystone')
const { StitchSchemaMiddleware } = require('@open-condo/keystone/stitchSchema')


const lastApp = conf.DISABLE_NEXT_APP ? undefined : new NextApp({ dir: '.' })

const schemas = () => [
    require('@miniapp/domains/user/schema'),
]

const apps = () => [
    new HealthCheck({ checks: [getPostgresHealthCheck(), getRedisHealthCheck()] }),
    new StitchSchemaMiddleware({ apiUrl: '/graphql' }),
    new CondoOIDCMiddleware(),
]

const tasks = () => []

module.exports = prepareKeystone({
    lastApp, schemas, apps, tasks,
})