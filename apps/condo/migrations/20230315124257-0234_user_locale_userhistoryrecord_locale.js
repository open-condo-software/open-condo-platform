// auto generated by kmigrator
// KMIGRATOR:0234_user_locale_userhistoryrecord_locale:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMC4xIG9uIDIwMjMtMDMtMTUgMDc6NDIKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAyMzNfYmFua2ludGVncmF0aW9ub3JnYW5pemF0aW9uY29udGV4dGhpc3RvcnlyZWNvcmRfYW5kX21vcmUnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3VzZXInLAogICAgICAgICAgICBuYW1lPSdsb2NhbGUnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQ2hhckZpZWxkKGJsYW5rPVRydWUsIGNob2ljZXM9WygncnUnLCAncnUnKSwgKCdlbicsICdlbicpXSwgbWF4X2xlbmd0aD01MCwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3VzZXJoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nbG9jYWxlJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field locale to user
--
ALTER TABLE "User" ADD COLUMN "locale" varchar(50) NULL;
--
-- Add field locale to userhistoryrecord
--
ALTER TABLE "UserHistoryRecord" ADD COLUMN "locale" text NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field locale to userhistoryrecord
--
ALTER TABLE "UserHistoryRecord" DROP COLUMN "locale" CASCADE;
--
-- Add field locale to user
--
ALTER TABLE "User" DROP COLUMN "locale" CASCADE;
COMMIT;

    `)
}
