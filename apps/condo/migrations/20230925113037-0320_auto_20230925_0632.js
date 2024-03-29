// auto generated by kmigrator
// KMIGRATOR:0320_auto_20230925_0632:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi41IG9uIDIwMjMtMDktMjUgMDY6MzIKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAzMTlfb3JnYW5pemF0aW9uX2lzYXBwcm92ZWRfYW5kX21vcmUnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J29yZ2FuaXphdGlvbmVtcGxveWVlcm9sZScsCiAgICAgICAgICAgIG5hbWU9J2NhblJlYWRJbmNpZGVudHMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGRlZmF1bHQ9VHJ1ZSksCiAgICAgICAgICAgIHByZXNlcnZlX2RlZmF1bHQ9RmFsc2UsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdvcmdhbml6YXRpb25lbXBsb3llZXJvbGUnLAogICAgICAgICAgICBuYW1lPSdjYW5SZWFkVGlja2V0cycsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Cb29sZWFuRmllbGQoZGVmYXVsdD1UcnVlKSwKICAgICAgICAgICAgcHJlc2VydmVfZGVmYXVsdD1GYWxzZSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J29yZ2FuaXphdGlvbmVtcGxveWVlcm9sZWhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdjYW5SZWFkSW5jaWRlbnRzJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nb3JnYW5pemF0aW9uZW1wbG95ZWVyb2xlaGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2NhblJlYWRUaWNrZXRzJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canReadIncidents to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" ADD COLUMN "canReadIncidents" boolean DEFAULT true NOT NULL;
ALTER TABLE "OrganizationEmployeeRole" ALTER COLUMN "canReadIncidents" DROP DEFAULT;
--
-- Add field canReadTickets to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" ADD COLUMN "canReadTickets" boolean DEFAULT true NOT NULL;
ALTER TABLE "OrganizationEmployeeRole" ALTER COLUMN "canReadTickets" DROP DEFAULT;
--
-- Add field canReadIncidents to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" ADD COLUMN "canReadIncidents" boolean NULL;
--
-- Add field canReadTickets to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" ADD COLUMN "canReadTickets" boolean NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canReadTickets to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" DROP COLUMN "canReadTickets" CASCADE;
--
-- Add field canReadIncidents to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" DROP COLUMN "canReadIncidents" CASCADE;
--
-- Add field canReadTickets to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" DROP COLUMN "canReadTickets" CASCADE;
--
-- Add field canReadIncidents to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" DROP COLUMN "canReadIncidents" CASCADE;
COMMIT;

    `)
}
