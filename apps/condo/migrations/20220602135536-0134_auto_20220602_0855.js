// auto generated by kmigrator
// KMIGRATOR:0134_auto_20220602_0855:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi43IG9uIDIwMjItMDYtMDIgMDg6NTUKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAxMzNfdXNlcnRpY2tldGNvbW1lbnRyZWFkdGltZV91bmlxdWVfdXNlcl9hbmRfdGlja2V0JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdtZXNzYWdlJywKICAgICAgICAgICAgbmFtZT0ndW5pcUtleScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J21lc3NhZ2VoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0ndW5pcUtleScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkQ29uc3RyYWludCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nbWVzc2FnZScsCiAgICAgICAgICAgIGNvbnN0cmFpbnQ9bW9kZWxzLlVuaXF1ZUNvbnN0cmFpbnQoY29uZGl0aW9uPW1vZGVscy5RKCgnZGVsZXRlZEF0X19pc251bGwnLCBUcnVlKSksIGZpZWxkcz0oJ3VzZXInLCAndHlwZScsICd1bmlxS2V5JyksIG5hbWU9J21lc3NhZ2VfdW5pcXVlX3VzZXJfdHlwZV91bmlxS2V5JyksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZENvbnN0cmFpbnQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J21lc3NhZ2UnLAogICAgICAgICAgICBjb25zdHJhaW50PW1vZGVscy5VbmlxdWVDb25zdHJhaW50KGNvbmRpdGlvbj1tb2RlbHMuUSgoJ3VzZXJfX2lzbnVsbCcsIFRydWUpLCAoJ2RlbGV0ZWRBdF9faXNudWxsJywgVHJ1ZSkpLCBmaWVsZHM9KCd0eXBlJywgJ3VuaXFLZXknKSwgbmFtZT0nbWVzc2FnZV91bmlxdWVfdHlwZV91bmlxS2V5JyksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field uniqKey to message
--
ALTER TABLE "Message" ADD COLUMN "uniqKey" text NULL;
--
-- Add field uniqKey to messagehistoryrecord
--
ALTER TABLE "MessageHistoryRecord" ADD COLUMN "uniqKey" text NULL;
--
-- Create constraint message_unique_user_type_uniqKey on model message
--
CREATE UNIQUE INDEX "message_unique_user_type_uniqKey" ON "Message" ("user", "type", "uniqKey") WHERE "deletedAt" IS NULL;
--
-- Create constraint message_unique_type_uniqKey on model message
--
CREATE UNIQUE INDEX "message_unique_type_uniqKey" ON "Message" ("type", "uniqKey") WHERE ("user" IS NULL AND "deletedAt" IS NULL);
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Create constraint message_unique_type_uniqKey on model message
--
DROP INDEX IF EXISTS "message_unique_type_uniqKey";
--
-- Create constraint message_unique_user_type_uniqKey on model message
--
DROP INDEX IF EXISTS "message_unique_user_type_uniqKey";
--
-- Add field uniqKey to messagehistoryrecord
--
ALTER TABLE "MessageHistoryRecord" DROP COLUMN "uniqKey" CASCADE;
--
-- Add field uniqKey to message
--
ALTER TABLE "Message" DROP COLUMN "uniqKey" CASCADE;
COMMIT;

    `)
}
