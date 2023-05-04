// auto generated by kmigrator
// KMIGRATOR:0265_newsitem_ispublished_newsitem_sentat_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMC4xIG9uIDIwMjMtMDQtMjggMDY6MTgKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAyNjRfYmFua2ludGVncmF0aW9ub3JnYW5pemF0aW9uY29udGV4dF9lbmFibGVkX2FuZF9tb3JlJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSduZXdzaXRlbScsCiAgICAgICAgICAgIG5hbWU9J2lzUHVibGlzaGVkJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChkZWZhdWx0PUZhbHNlKSwKICAgICAgICAgICAgcHJlc2VydmVfZGVmYXVsdD1GYWxzZSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J25ld3NpdGVtJywKICAgICAgICAgICAgbmFtZT0nc2VudEF0JywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkRhdGVUaW1lRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J25ld3NpdGVtaGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2lzUHVibGlzaGVkJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nbmV3c2l0ZW1oaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nc2VudEF0JywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkRhdGVUaW1lRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field isPublished to newsitem
--
ALTER TABLE "NewsItem" ADD COLUMN "isPublished" boolean DEFAULT false NOT NULL;
ALTER TABLE "NewsItem" ALTER COLUMN "isPublished" DROP DEFAULT;
--
-- Add field sentAt to newsitem
--
ALTER TABLE "NewsItem" ADD COLUMN "sentAt" timestamp with time zone NULL;
--
-- Add field isPublished to newsitemhistoryrecord
--
ALTER TABLE "NewsItemHistoryRecord" ADD COLUMN "isPublished" boolean NULL;
--
-- Add field sentAt to newsitemhistoryrecord
--
ALTER TABLE "NewsItemHistoryRecord" ADD COLUMN "sentAt" timestamp with time zone NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field sentAt to newsitemhistoryrecord
--
ALTER TABLE "NewsItemHistoryRecord" DROP COLUMN "sentAt" CASCADE;
--
-- Add field isPublished to newsitemhistoryrecord
--
ALTER TABLE "NewsItemHistoryRecord" DROP COLUMN "isPublished" CASCADE;
--
-- Add field sentAt to newsitem
--
ALTER TABLE "NewsItem" DROP COLUMN "sentAt" CASCADE;
--
-- Add field isPublished to newsitem
--
ALTER TABLE "NewsItem" DROP COLUMN "isPublished" CASCADE;
COMMIT;

    `)
}