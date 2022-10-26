// auto generated by kmigrator
// KMIGRATOR:0191_auto_20221124_0627:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi45IG9uIDIwMjItMTEtMjQgMDY6MjcKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAxOTBfYmFua2NvbnRyYWN0b3JhY2NvdW50X2Jhbmtjb250cmFjdG9yYWNjb3VudGhpc3RvcnlyZWNvcmQnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J29yZ2FuaXphdGlvbmVtcGxveWVlcm9sZScsCiAgICAgICAgICAgIG5hbWU9J2Nhbk1hbmFnZUJhbmtDb250cmFjdG9yQWNjb3VudHMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGRlZmF1bHQ9RmFsc2UpLAogICAgICAgICAgICBwcmVzZXJ2ZV9kZWZhdWx0PUZhbHNlLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nb3JnYW5pemF0aW9uZW1wbG95ZWVyb2xlaGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2Nhbk1hbmFnZUJhbmtDb250cmFjdG9yQWNjb3VudHMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canManageBankContractorAccounts to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" ADD COLUMN "canManageBankContractorAccounts" boolean DEFAULT false NOT NULL;
ALTER TABLE "OrganizationEmployeeRole" ALTER COLUMN "canManageBankContractorAccounts" DROP DEFAULT;
--
-- Add field canManageBankContractorAccounts to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" ADD COLUMN "canManageBankContractorAccounts" boolean NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canManageBankContractorAccounts to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" DROP COLUMN "canManageBankContractorAccounts" CASCADE;
--
-- Add field canManageBankContractorAccounts to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" DROP COLUMN "canManageBankContractorAccounts" CASCADE;
COMMIT;

    `)
}