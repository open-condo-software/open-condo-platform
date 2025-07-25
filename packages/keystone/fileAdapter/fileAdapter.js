const { existsSync, mkdirSync } = require('fs')

const { LocalFileAdapter } = require('@open-keystone/file-adapters')
const express = require('express')
const { isEmpty, get } = require('lodash')

const conf = require('@open-condo/config')
const { AwsFileAdapter, AWSFilesMiddleware } = require('@open-condo/keystone/fileAdapter/awsFileAdapter')
const { SberCloudFileAdapter, OBSFilesMiddleware } = require('@open-condo/keystone/fileAdapter/sberCloudFileAdapter')

const { DEFAULT_FILE_ADAPTER } = require('./constants')


class NoFileAdapter {

    get error () {
        return new Error('[error] NoFileAdapter configured. Add env record for s3 storage')
    }

    save () {
        return Promise.reject(this.error)
    }

    getFilename () {
        throw this.error
    }

    publicUrl () {
        throw this.error
    }

}

class LocalFilesMiddleware {
    constructor ({ path, src }) {
        if (typeof path !== 'string') throw new Error('LocalFilesMiddleware requires a "path" option, which must be a string.')
        if (typeof src !== 'string') throw new Error('LocalFilesMiddleware requires a "src" option, which must be a string.')
        this._path = path
        this._src = src
    }

    prepareMiddleware () {
        // this route serve a static file to the user browser and does not have any operation for csrf attacking
        // also, it used for development purposes only (see conf.FILE_FIELD_ADAPTER configuration)
        // nosemgrep: javascript.express.security.audit.express-check-csurf-middleware-usage.express-check-csurf-middleware-usage
        const app = express()
        app.use(this._path, express.static(this._src))
        return app
    }
}

class FileAdapter {
    constructor (folder, isPublic = false, saveFileName = false) {
        const type = conf.FILE_FIELD_ADAPTER || DEFAULT_FILE_ADAPTER
        this.folder = folder
        this.type = type
        this.isPublic = isPublic
        this.saveFileName = saveFileName
        let Adapter = null
        switch (type) {
            case 'local':
                Adapter = this.createLocalFileApapter()
                break
            case 'sbercloud':
                Adapter = this.createSbercloudFileApapter()
                break
            case 'aws':
                Adapter = this.createAwsFileAdapter()
                break
        }
        if (!Adapter) {
            // No fallback to local file adapter
            if (conf.NODE_ENV === 'production') {
                throw new Error('File adapter is not configured. You need to check FILE_FIELD_ADAPTER and their configs')
            } else {
                // TODO(pahaz): DOMA-1569 remove this backward compatibility and throw an error
                Adapter = new NoFileAdapter()
                console.error('File adapter is not configured')
            }
        }
        return Adapter
    }

    createLocalFileApapter () {
        if (!this.isConfigValid(conf, ['MEDIA_ROOT', 'MEDIA_URL', 'SERVER_URL'])) {
            return null
        }
        const config = {
            src: `${conf.MEDIA_ROOT}/${this.folder}`,
            path: `${conf.SERVER_URL}${conf.MEDIA_URL}/${this.folder}`,
        }

        if (this.saveFileName) {
            config.getFilename = ({ originalFilename }) => originalFilename
        }

        return new LocalFileAdapter(config)
    }

    getEnvConfig (name, required) {
        const config = conf[name] ? JSON.parse(conf[name]) : {}
        if (!this.isConfigValid(config, required)) {
            return null
        }
        return config
    }

    isConfigValid (config, required = []) {
        const missedFields = required.filter(field => !get(config, field))
        if (!isEmpty(missedFields)) {
            console.error(`FileAdapter type=${this.type} has missing fields in config variable: ${[missedFields.join(', ')]}`)
            return false
        }
        return true
    }

    createSbercloudFileApapter () {
        const config = this.getEnvConfig('SBERCLOUD_OBS_CONFIG', [
            'bucket',
            's3Options.server',
            's3Options.access_key_id',
            's3Options.secret_access_key',
        ])
        if (!config) {
            return null
        }
        return new SberCloudFileAdapter({ ...config, folder: this.folder, isPublic: this.isPublic, saveFileName: this.saveFileName })
    }

    createAwsFileAdapter () {
        const config = this.getEnvConfig('AWS_CONFIG', [
            'bucket',
            's3Options.region',
            's3Options.accessKeyId',
            's3Options.secretAccessKey',
        ])

        if (!config) {
            return null
        }
        return new AwsFileAdapter({ ...config, folder: this.folder, isPublic: this.isPublic, saveFileName: this.saveFileName })
    }

    // TODO(pahaz): DOMA-1569 it's better to create just a function. But we already use FileAdapter in many places. I just want to save a backward compatibility
    static makeFileAdapterMiddleware () {
        const type = conf.FILE_FIELD_ADAPTER || DEFAULT_FILE_ADAPTER
        if (type === 'local') {
            if (!existsSync(conf.MEDIA_ROOT)) {
                mkdirSync(conf.MEDIA_ROOT)
            }
            return new LocalFilesMiddleware({ path: conf.MEDIA_URL, src: conf.MEDIA_ROOT })
        } else if (type === 'sbercloud') {
            return new OBSFilesMiddleware()
        } else if (type === 'aws') {
            return new AWSFilesMiddleware()
        }
        else {
            throw new Error('Unknown file field adapter. You need to check FILE_FIELD_ADAPTER')
        }
    }
}

/**
 * Set meta using fileAdapter acl, which used later to check access to file.
 * @param fileAdapter - file's adapter
 * @param fieldPath - name of file field inside model
 * @returns {(function({updatedItem: *, listKey: *}): Promise<void>)|*}
 */
function getFileMetaAfterChange (fileAdapter, fieldPath = 'file') {
    return async function afterChange ({ updatedItem, listKey }) {
        if (updatedItem && fileAdapter.acl && fileAdapter.acl.setMeta) {
            const file = get(updatedItem, fieldPath)
            if (file) {
                const { filename } = file
                const folder = get(fileAdapter, 'folder', '')
                const key = `${folder}/${filename}`
                // OBS will lowercase all keys from meta
                await fileAdapter.acl.setMeta(key, {
                    listkey: listKey,
                    id: updatedItem.id,
                })
            }
        }
    }
}

module.exports = FileAdapter
exports = module.exports
exports.getFileMetaAfterChange = getFileMetaAfterChange
