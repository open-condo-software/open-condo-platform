/**
 * Generated by `createschema onboarding.UserHelpRequestFile 'userHelpRequest?:Relationship:UserHelpRequest:CASCADE;file:File'`
 */
const FileAdapter = require('@open-condo/keystone/fileAdapter/fileAdapter')
const { getFileMetaAfterChange } = require('@open-condo/keystone/fileAdapter/fileAdapter')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/onboarding/access/UserHelpRequestFile')
const { USER_HELP_REQUEST_FOLDER_NAME } = require('@condo/domains/onboarding/constants/userHelpRequest')


const Adapter = new FileAdapter(USER_HELP_REQUEST_FOLDER_NAME)
const fileMetaAfterChange = getFileMetaAfterChange(Adapter)

const UserHelpRequestFile = new GQLListSchema('UserHelpRequestFile', {
    schemaDoc: 'File related to user help request',
    fields: {
        userHelpRequest: {
            type: 'Relationship',
            ref: 'UserHelpRequest',
            kmigratorOptions: { null: true, on_delete: 'models.CASCADE' },
        },
        file: {
            adapter: Adapter,
            type: 'File',
        },
    },
    hooks: {
        afterChange: fileMetaAfterChange,
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadUserHelpRequestFiles,
        create: access.canManageUserHelpRequestFiles,
        update: access.canManageUserHelpRequestFiles,
        delete: false,
        auth: true,
    },
})

module.exports = {
    UserHelpRequestFile,
}
