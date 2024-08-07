const http = require('http')
const https = require('https')

const FormData = require('form-data')
const { get, isEmpty } = require('lodash')

const conf = require('@open-condo/config')
const { fetch } = require('@open-condo/keystone/fetch')


const { EMAIL_TRANSPORT } = require('../constants/constants')
const { renderTemplate } = require('../templates')

const EMAIL_API_CONFIG = (conf.EMAIL_API_CONFIG) ? JSON.parse(conf.EMAIL_API_CONFIG) : null

const HTTPX_REGEXP = /^http:/
const MAX_TAG_LENGTH = 128

async function prepareMessageToSend (message) {
    const email = get(message, 'email') || get(message, ['user', 'email']) || null

    if (!email) throw new Error('no email to send message')

    const { subject, text, html } = await renderTemplate(EMAIL_TRANSPORT, message)

    const messageType = message.type.slice(0, MAX_TAG_LENGTH)

    return { to: email, emailFrom: message.emailFrom, subject, text, html, meta: message.meta, messageType }
}

/**
 * Send a email message by remote API service
 *
 * @param {Object} args - send email arguments
 * @param {string} args.to - Email address `To` recipient(s). Example: "Bob <bob@host.com>". You can use commas to separate multiple recipients.
 * @param {string?} args.emailFrom - The sender's email address. Examples: 'Vasiliy <pupkin@mailforspam.com>', 'duduka@example.com'.
 * @param {string} args.cc - Email address for `Cc` (Carbon Copy)
 * @param {string} args.bcc - Email address for `Bcc` (Blind Carbon Copy)
 * @param {string} args.subject - Message subject
 * @param {string} args.text - Body of the message. (text version)
 * @param {string} args.html - Body of the message. (HTML version)
 * @param {object} args.meta - The `message.meta` field
 * @param {object} args.messageType - we use message type as tag
 * @typedef {[boolean, Object]} StatusAndMetadata
 * @return {StatusAndMetadata} Status and delivery Metadata (debug only)
 */
async function send ({ to, emailFrom = null, cc, bcc, subject, text, html, meta, messageType } = {}) {
    if (!EMAIL_API_CONFIG) throw new Error('no EMAIL_API_CONFIG')
    if (!to || !to.includes('@')) throw new Error('unsupported to argument format')
    if (!subject) throw new Error('no subject argument')
    if (!text && !html) throw new Error('no text or html argument')
    const { api_url, token, from, useTags, useAttachingData } = EMAIL_API_CONFIG
    const form = new FormData()
    form.append('from', from)

    if (useTags && (!!messageType && typeof messageType === 'string')) {
        form.append('o:tag', messageType)
    }
    if (useAttachingData && meta && !isEmpty(meta.attachingData)) {
        form.append('v:attachingData', JSON.stringify(meta.attachingData))
    }

    if (emailFrom) {
        form.append('h:Reply-To', emailFrom)
    }
    form.append('to', to)
    form.append('subject', subject)
    if (text) form.append('text', text)
    if (cc) form.append('cc', cc)
    if (bcc) form.append('bcc', bcc)
    if (html) form.append('html', html)

    if (meta && meta.attachments) {
        const streamsPromises = meta.attachments.map((attachment) => {
            const { publicUrl, mimetype, originalFilename } = attachment
            return new Promise((resolve) => {
                const httpx = HTTPX_REGEXP.test(publicUrl) ? http : https
                httpx.get(publicUrl, (stream) => {
                    resolve({ originalFilename, mimetype, stream })
                })
            })
        })
        const streamsData = await Promise.all(streamsPromises)
        streamsData.forEach((streamData) => {
            const { originalFilename, mimetype, stream } = streamData
            form.append(
                'attachment',
                stream,
                {
                    filename: originalFilename,
                    contentType: mimetype,
                })
        })
    }

    const auth = `api:${token}`
    const result = await fetch(
        api_url,
        {
            method: 'POST',
            body: form,
            headers: {
                ...form.getHeaders(),
                'Authorization': `Basic ${Buffer.from(auth).toString('base64')}`,
            },
        })
    const status = result.status

    let context, isSent
    if (status === 200) {
        isSent = true
        context = await result.json()
    } else {
        const text = await result.text()
        isSent = false
        context = { text, status }
    }
    return [isSent, context]
}

module.exports = {
    prepareMessageToSend,
    send,
}
