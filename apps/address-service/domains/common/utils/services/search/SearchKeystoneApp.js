const express = require('express')
const { get, set } = require('lodash')

const { getLogger } = require('@open-condo/keystone/logging')

const { getSearchProvider } = require('@address-service/domains/common/utils/services/providerDetectors')
const { SEARCH_ERROR_NOT_FOUND } = require('@address-service/domains/common/utils/services/search/strategies/constants')

const { createBulkSearchStrategy } = require('./strategies')
const { BULK_SEARCH_STRATEGIES } = require('./strategies/constants')
const { StrategyEachItemToPlugins } = require('./strategies/StrategyEachItemToPlugins')

/**
 * @typedef {Object} AddressSearchResult
 * @property {string} addressSource
 * @property {string} address
 * @property {string} addressKey
 * @property {Object} addressMeta
 */

class SearchKeystoneApp {
    /**
     * @param {AbstractSearchPlugin[]} plugins
     */
    constructor (plugins) {
        this.plugins = plugins
        this.logger = getLogger(this.constructor.name)
    }

    send404 ({ res, s, strategy, strategyResult }) {
        this.logger.warn({
            msg: 'Address not found',
            data: {
                s,
                strategy: strategy.constructor.name,
                strategyResult,
                plugins: this.plugins.map((plugin) => plugin.constructor.name),
            },
        })
        res.sendStatus(404)
    }

    /**
     * @param params
     * @returns {Express}
     */
    prepareMiddleware ({ keystone, dev, distDir }) {

        // check for provider is configured
        const provider = getSearchProvider()
        if (!provider) {
            this.logger.warn('⚠️ No provider set. Use only local database for addresses searching')
        }

        if (this.plugins.length === 0) {
            throw new Error('You must add at least one search plugin!')
        }

        // this route can not be used for csrf attack (because no cookies and tokens are used in a public route)
        // nosemgrep: javascript.express.security.audit.express-check-csurf-middleware-usage.express-check-csurf-middleware-usage
        const app = express()

        function setNoCache (req, res, next) {
            res.set('Pragma', 'no-cache')
            res.set('Cache-Control', 'no-cache, no-store')
            next()
        }

        app.get(
            '/search',
            setNoCache,

            /**
             * @typedef {Object} ReqShapeQueryType
             * @property {string} s search string
             * @property {string} [context] search context {@see apps/address-service/domains/common/constants/contexts.js}
             */

            /**
             * @param {IncomingMessage & { query: ReqShapeQueryType }} req
             * @param res
             * @param next
             * @returns {Promise<void>}
             */
            async (req, res, next) => {
                /**
                 * User's search string
                 * @type {string}
                 */
                const s = get(req, ['query', 's'])

                if (!s || typeof s !== 'string') {
                    res.status(400).send('No address to search for. Or wrong ?s= query format')
                    return
                }

                const strategy = new StrategyEachItemToPlugins(keystone, this.plugins)

                set(req, ['body', 'items'], [s])
                for (const p of ['context', 'extractUnit']) {
                    set(req, ['body', p], get(req, ['query', p]))
                }
                try {
                    set(req, ['body', 'helpers'], JSON.parse(get(req, ['query', 'helpers'])))
                } catch (e) {
                    set(req, ['body', 'helpers'], undefined)
                }


                try {
                    const strategyResult = await strategy.search(req)
                    const addressResult = get(strategyResult, ['map', s])
                    if (!addressResult) {
                        this.send404({ res, s, strategy, strategyResult })
                        return
                    }

                    if (addressResult.err) {
                        if (addressResult.err === SEARCH_ERROR_NOT_FOUND) {
                            this.send404({ res, s, strategy, strategyResult })
                            return
                        }
                        throw new Error(`${addressResult.err}: ${addressResult.data}`.trim())
                    }

                    const addressKey = get(addressResult, ['data', 'addressKey'])

                    res.json({
                        ...get(strategyResult, ['addresses', addressKey], {}),
                        unitType: get(addressResult, ['data', 'unitType']),
                        unitName: get(addressResult, ['data', 'unitName']),
                    })
                } catch (err) {
                    this.logger.error({
                        err,
                        msg: 'Search error',
                        data: {
                            s,
                            strategy: strategy.constructor.name,
                            plugins: this.plugins.map((plugin) => plugin.constructor.name),
                        },
                    })
                    res.status(400).send('Search error')
                }
            },
        )

        app.post(
            '/bulkSearch',
            setNoCache,

            /**
             * @typedef {Object} BulkReqShapeQueryType
             * @property {string[]} items search string
             * @property {string} [context] search context {@see apps/address-service/domains/common/constants/contexts.js}
             * @property {string} [strategy] search strategy {@see apps/address-service/domains/common/utils/services/search/strategies/index.js}
             */

            /**
             * @param {IncomingMessage & { body: BulkReqShapeQueryType }} req
             * @param res
             * @param next
             * @returns {Promise<void>}
             */
            async (req, res, next) => {
                let strategy

                try {
                    strategy = createBulkSearchStrategy(req, keystone, this.plugins)
                } catch (err) {
                    const msg = 'Wrong search strategy'
                    this.logger.error({
                        err,
                        msg,
                        data: { allowedStrategies: BULK_SEARCH_STRATEGIES },
                    })
                    res.status(400).send(msg)
                    return
                }

                try {
                    res.json(await strategy.search(req))
                } catch (err) {
                    this.logger.error({
                        err,
                        msg: 'Bulk search error',
                        data: {
                            strategy: strategy.constructor.name,
                            plugins: this.plugins.map((plugin) => plugin.constructor.name),
                        },
                    })
                    res.status(400).send('Bulk search error')
                }
            },
        )

        return app
    }
}

module.exports = { SearchKeystoneApp }
