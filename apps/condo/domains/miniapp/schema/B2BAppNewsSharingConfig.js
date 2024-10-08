/**
 * Generated by `createschema miniapp.B2BAppNewsSharingConfig 'publishUrl:Text; previewUrl:Text; getRecipientsUrl:Text;'`
 */

const FileAdapter = require('@open-condo/keystone/fileAdapter/fileAdapter')
const { getFileMetaAfterChange } = require('@open-condo/keystone/fileAdapter/fileAdapter')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/miniapp/access/B2BAppNewsSharingConfig')
const { NEWS_SHARING_PUSH_NOTIFICATION_SETTINGS } = require('@condo/domains/miniapp/constants')

const NEWS_SHARING_FILE_ADAPTER = new FileAdapter('news-sharing')

const iconMetaAfterChange = getFileMetaAfterChange(NEWS_SHARING_FILE_ADAPTER, 'icon')

const previewPictureMetaAfterChange = getFileMetaAfterChange(NEWS_SHARING_FILE_ADAPTER, 'previewPicture')

/**
 * News Sharing B2BApp
 *
 * News Sharing B2BApp allow b2b users to share their NewsItem to external source like Telegram or Whatsapp from /news page
 *
 *                         [ viber-sharing-miniapp ] -> [ viber ]
 * [ condo /news page ] ->              ...                    ...
 *                         [ telegram-sharing-miniapp ] -> [ telegram ]
 *
 * To create miniapp that can be embedded to /news page developer should provide API and information defined here
 *
 * @type {GQLListSchema}
 */
const B2BAppNewsSharingConfig = new GQLListSchema('B2BAppNewsSharingConfig', {

    schemaDoc: 'News Sharing B2BApp allow b2b users to share their NewsItem to external source (like Telegram) from /news page',
    fields: {
        name: {
            schemaDoc: 'Short and simple name of the external source. For example: Telegram',
            type:  'Text',
            isRequired: true,
        },

        icon: {
            schemaDoc: 'App icon. For example: Telegram app icon',
            type: 'File',
            isRequired: false,
            adapter: NEWS_SHARING_FILE_ADAPTER,
        },

        previewPicture: {
            schemaDoc: 'Preview image. For example: Telegram app screenshot',
            type: 'File',
            isRequired: false,
            adapter: NEWS_SHARING_FILE_ADAPTER,
        },

        pushNotificationSettings: {
            schemaDoc: 'Push notification preferences for each B2BApp. The available options include: notifications are sent only for emergency alerts, all notifications are turned off, or all notifications are enabled',
            type: 'Select',
            options: Object.values(NEWS_SHARING_PUSH_NOTIFICATION_SETTINGS),
            isRequired: true,
            defaultValue: NEWS_SHARING_PUSH_NOTIFICATION_SETTINGS.DISABLED,
        },

        // Standard set of methods that should be implemented to create an integration with telegram / viber apps

        publishUrl: {
            schemaDoc: 'URL that publishes NewsItem. Should implement POST publish method. It will be called once news item is ready to be published. Check News domain for reference',
            type: 'Url',
            isRequired: true,
        },

        previewUrl: {
            schemaDoc: 'URL that returns rendered HTML preview of News Item. Used to render NewsItem preview. If not provided, app preview will not be rendered',
            type: 'Url',
            isRequired: false,
        },

        getRecipientsUrl: {
            schemaDoc: 'URL that returns chats and/or channels. Should implement POST getRecipients method. If provided Select control with data from this endpoint will be used in /news/create page, If not provided, condo control will be used',
            type: 'Url',
            isRequired: false,
        },

        // Custom methods that allow to implement custom UI and data structure for sending news
        // Should only be used as a last resort

        customFormUrl: {
            schemaDoc: 'URL that implements customForm. Use only if you need custom NewsItemSharing data structure, for example if . Allows to provide custom UI for sending news. If not provided app will use condo news form',
            type: 'Url',
            isRequired: false,
        },

        getRecipientsCountersUrl: {
            schemaDoc: 'URL that returns number of subscribers for condo scopes. Should implement POST customGetRecipientsCounters method. Allows to provide custom values for recipients counter. If not provided app will use data from getRecipients. If getRecipients is not provided, recipients counter will not be rendered',
            type: 'Url',
            isRequired: false,
        },
    },
    hooks: {
        afterChange: async ({ updatedItem, listKey }) => {
            await iconMetaAfterChange({ updatedItem, listKey })
            await previewPictureMetaAfterChange({ updatedItem, listKey })
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadB2BAppNewsSharingConfigs,
        create: access.canManageB2BAppNewsSharingConfigs,
        update: access.canManageB2BAppNewsSharingConfigs,
        delete: false,
        auth: true,
    },
})

module.exports = {
    B2BAppNewsSharingConfig,
}
