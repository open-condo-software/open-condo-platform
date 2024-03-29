/**
 * Generated by `createservice notification.DisconnectUserFromRemoteClientService --type mutations`
 */
const { GQLCustomSchema, getByCondition } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/notification/access/DisconnectUserFromRemoteClientService')
const { RemoteClient } = require('@condo/domains/notification/utils/serverSchema')

const DisconnectUserFromRemoteClientService = new GQLCustomSchema('DisconnectUserFromRemoteClientService', {
    types: [
        {
            access: true,
            type: 'input DisconnectUserFromRemoteClientInput { dv: Int!, sender: SenderFieldInput!, deviceId: String! appId: String! }',
        },
        {
            access: true,
            type: 'type DisconnectUserFromRemoteClientOutput { status: String! }',
        },
    ],
    
    mutations: [
        {
            access: access.canDisconnectUserFromRemoteClient,
            schema: 'disconnectUserFromRemoteClient(data: DisconnectUserFromRemoteClientInput!): DisconnectUserFromRemoteClientOutput',
            resolver: async (parent, args, context) => {
                const { data: { dv, sender, deviceId, appId } } = args
                const attrs = { dv, sender, owner: { disconnectAll: true } }
                const existingItem = await getByCondition('RemoteClient', { deviceId, appId, deletedAt: null })

                if (existingItem) await RemoteClient.update(context, existingItem.id, attrs)

                return { status: 'ok' }
            },
        },
    ],
    
})

module.exports = {
    DisconnectUserFromRemoteClientService,
}
