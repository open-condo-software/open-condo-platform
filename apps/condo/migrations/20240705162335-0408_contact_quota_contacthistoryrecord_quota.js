// auto generated by kmigrator
// KMIGRATOR:0408_contact_quota_contacthistoryrecord_quota:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMi4xIG9uIDIwMjQtMDctMDUgMTE6MjMKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzA0MDZfYXV0b18yMDI0MDYyOV8xNjA5JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdjb250YWN0JywKICAgICAgICAgICAgbmFtZT0ncXVvdGEnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuRGVjaW1hbEZpZWxkKGJsYW5rPVRydWUsIGRlY2ltYWxfcGxhY2VzPTgsIG1heF9kaWdpdHM9MTgsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdjb250YWN0aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J3F1b3RhJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkRlY2ltYWxGaWVsZChibGFuaz1UcnVlLCBkZWNpbWFsX3BsYWNlcz00LCBtYXhfZGlnaXRzPTE4LCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field quota to contact
--
ALTER TABLE "Contact" ADD COLUMN "quota" numeric(18, 8) NULL;
--
-- Add field quota to contacthistoryrecord
--
ALTER TABLE "ContactHistoryRecord" ADD COLUMN "quota" numeric(18, 4) NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field quota to contacthistoryrecord
--
ALTER TABLE "ContactHistoryRecord" DROP COLUMN "quota" CASCADE;
--
-- Add field quota to contact
--
ALTER TABLE "Contact" DROP COLUMN "quota" CASCADE;
COMMIT;

    `)
}
