// auto generated by kmigrator
// KMIGRATOR:0037_auto_20210807_0933:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi42IG9uIDIwMjEtMDgtMDcgMDk6MzMKCmltcG9ydCBkamFuZ28uY29udHJpYi5wb3N0Z3Jlcy5maWVsZHMuanNvbmIKZnJvbSBkamFuZ28uZGIgaW1wb3J0IG1pZ3JhdGlvbnMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAwMzZfYXV0b18yMDIxMDgwNl8xMTIyJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdyZXNpZGVudGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdyZXNpZGVudE9yZ2FuaXphdGlvbicsCiAgICAgICAgICAgIGZpZWxkPWRqYW5nby5jb250cmliLnBvc3RncmVzLmZpZWxkcy5qc29uYi5KU09ORmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3Jlc2lkZW50aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J3Jlc2lkZW50UHJvcGVydHknLAogICAgICAgICAgICBmaWVsZD1kamFuZ28uY29udHJpYi5wb3N0Z3Jlcy5maWVsZHMuanNvbmIuSlNPTkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field residentOrganization to residenthistoryrecord
--
ALTER TABLE "ResidentHistoryRecord" ADD COLUMN "residentOrganization" jsonb NULL;
--
-- Add field residentProperty to residenthistoryrecord
--
ALTER TABLE "ResidentHistoryRecord" ADD COLUMN "residentProperty" jsonb NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field residentProperty to residenthistoryrecord
--
ALTER TABLE "ResidentHistoryRecord" DROP COLUMN "residentProperty" CASCADE;
--
-- Add field residentOrganization to residenthistoryrecord
--
ALTER TABLE "ResidentHistoryRecord" DROP COLUMN "residentOrganization" CASCADE;
COMMIT;

    `)
}
