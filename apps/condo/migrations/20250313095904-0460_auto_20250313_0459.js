// auto generated by kmigrator
// KMIGRATOR:0460_auto_20250313_0459:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi41IG9uIDIwMjUtMDMtMTMgMDQ6NTkKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzA0NTlfYXV0b18yMDI1MDMxMF8xNDQ4JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiMmJhcHBhY2Nlc3NyaWdodHNldCcsCiAgICAgICAgICAgIG5hbWU9J2Nhbk1hbmFnZU9yZ2FuaXphdGlvbkVtcGxveWVlUm9sZXMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGRlZmF1bHQ9RmFsc2UpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYjJiYXBwYWNjZXNzcmlnaHRzZXQnLAogICAgICAgICAgICBuYW1lPSdjYW5SZWFkT3JnYW5pemF0aW9uRW1wbG95ZWVSb2xlcycsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Cb29sZWFuRmllbGQoZGVmYXVsdD1GYWxzZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiMmJhcHBhY2Nlc3NyaWdodHNldGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdjYW5NYW5hZ2VPcmdhbml6YXRpb25FbXBsb3llZVJvbGVzJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYjJiYXBwYWNjZXNzcmlnaHRzZXRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nY2FuUmVhZE9yZ2FuaXphdGlvbkVtcGxveWVlUm9sZXMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canManageOrganizationEmployeeRoles to b2bappaccessrightset
--
ALTER TABLE "B2BAppAccessRightSet" ADD COLUMN "canManageOrganizationEmployeeRoles" boolean DEFAULT false NOT NULL;
ALTER TABLE "B2BAppAccessRightSet" ALTER COLUMN "canManageOrganizationEmployeeRoles" DROP DEFAULT;
--
-- Add field canReadOrganizationEmployeeRoles to b2bappaccessrightset
--
ALTER TABLE "B2BAppAccessRightSet" ADD COLUMN "canReadOrganizationEmployeeRoles" boolean DEFAULT false NOT NULL;
ALTER TABLE "B2BAppAccessRightSet" ALTER COLUMN "canReadOrganizationEmployeeRoles" DROP DEFAULT;
--
-- Add field canManageOrganizationEmployeeRoles to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" ADD COLUMN "canManageOrganizationEmployeeRoles" boolean NULL;
--
-- Add field canReadOrganizationEmployeeRoles to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" ADD COLUMN "canReadOrganizationEmployeeRoles" boolean NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canReadOrganizationEmployeeRoles to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" DROP COLUMN "canReadOrganizationEmployeeRoles" CASCADE;
--
-- Add field canManageOrganizationEmployeeRoles to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" DROP COLUMN "canManageOrganizationEmployeeRoles" CASCADE;
--
-- Add field canReadOrganizationEmployeeRoles to b2bappaccessrightset
--
ALTER TABLE "B2BAppAccessRightSet" DROP COLUMN "canReadOrganizationEmployeeRoles" CASCADE;
--
-- Add field canManageOrganizationEmployeeRoles to b2bappaccessrightset
--
ALTER TABLE "B2BAppAccessRightSet" DROP COLUMN "canManageOrganizationEmployeeRoles" CASCADE;
COMMIT;

    `)
}
