// auto generated by kmigrator
// KMIGRATOR:0211_auto_20230117_0513:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi43IG9uIDIwMjMtMDEtMTcgMDU6MTMKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKaW1wb3J0IGRqYW5nby5kYi5tb2RlbHMuZGVsZXRpb24KCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAyMTBfYWx0ZXJfcHJvcGVydHlfaXNhcHByb3ZlZCcpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVDb25zdHJhaW50KAogICAgICAgICAgICBtb2RlbF9uYW1lPSdtZXNzYWdlJywKICAgICAgICAgICAgbmFtZT0naGFzX3Bob25lX29yX2VtYWlsX29yX3VzZXInLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nbWVzc2FnZScsCiAgICAgICAgICAgIG5hbWU9J3JlbW90ZUNsaWVudCcsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Gb3JlaWduS2V5KGJsYW5rPVRydWUsIGRiX2NvbHVtbj0ncmVtb3RlQ2xpZW50JywgbnVsbD1UcnVlLCBvbl9kZWxldGU9ZGphbmdvLmRiLm1vZGVscy5kZWxldGlvbi5DQVNDQURFLCByZWxhdGVkX25hbWU9JysnLCB0bz0nX2RqYW5nb19zY2hlbWEucmVtb3RlY2xpZW50JyksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdtZXNzYWdlaGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J3JlbW90ZUNsaWVudCcsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5VVUlERmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWx0ZXJGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nbWVzc2FnZScsCiAgICAgICAgICAgIG5hbWU9J3N0YXR1cycsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5DaGFyRmllbGQoY2hvaWNlcz1bKCdzZW5kaW5nJywgJ3NlbmRpbmcnKSwgKCdyZXNlbmRpbmcnLCAncmVzZW5kaW5nJyksICgncHJvY2Vzc2luZycsICdwcm9jZXNzaW5nJyksICgnZXJyb3InLCAnZXJyb3InKSwgKCdibGFja2xpc3RlZCcsICdibGFja2xpc3RlZCcpLCAoJ3NlbnQnLCAnc2VudCcpLCAoJ2RlbGl2ZXJlZCcsICdkZWxpdmVyZWQnKSwgKCdyZWFkJywgJ3JlYWQnKSwgKCdjYW5jZWxlZCcsICdjYW5jZWxlZCcpXSwgbWF4X2xlbmd0aD01MCksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZENvbnN0cmFpbnQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J21lc3NhZ2UnLAogICAgICAgICAgICBjb25zdHJhaW50PW1vZGVscy5DaGVja0NvbnN0cmFpbnQoY2hlY2s9bW9kZWxzLlEoKCdwaG9uZV9faXNudWxsJywgRmFsc2UpLCAoJ2VtYWlsX19pc251bGwnLCBGYWxzZSksICgndXNlcl9faXNudWxsJywgRmFsc2UpLCAoJ3JlbW90ZUNsaWVudF9faXNudWxsJywgRmFsc2UpLCAoJ2RlbGV0ZWRBdF9faXNudWxsJywgRmFsc2UpLCBfY29ubmVjdG9yPSdPUicpLCBuYW1lPSdoYXNfcGhvbmVfb3JfZW1haWxfb3JfdXNlcl9vcl9yZW1vdGVDbGllbnQnKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
SET statement_timeout = '1500s';
--
-- Remove constraint has_phone_or_email_or_user from model message
--
ALTER TABLE "Message" DROP CONSTRAINT "has_phone_or_email_or_user";
--
-- Add field remoteClient to message
--
ALTER TABLE "Message" ADD COLUMN "remoteClient" uuid NULL CONSTRAINT "Message_remoteClient_1b0e5931_fk_RemoteClient_id" REFERENCES "RemoteClient"("id") DEFERRABLE INITIALLY DEFERRED; SET CONSTRAINTS "Message_remoteClient_1b0e5931_fk_RemoteClient_id" IMMEDIATE;
--
-- Add field remoteClient to messagehistoryrecord
--
ALTER TABLE "MessageHistoryRecord" ADD COLUMN "remoteClient" uuid NULL;
--
-- Alter field status on message
--
--
-- Create constraint has_phone_or_email_or_user_or_remoteClient on model message
--
ALTER TABLE "Message" ADD CONSTRAINT "has_phone_or_email_or_user_or_remoteClient" CHECK (("phone" IS NOT NULL OR "email" IS NOT NULL OR "user" IS NOT NULL OR "remoteClient" IS NOT NULL OR "deletedAt" IS NOT NULL));
CREATE INDEX "Message_remoteClient_1b0e5931" ON "Message" ("remoteClient");

SET statement_timeout = '10s';
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;

-- Mark all rows containing only remoteClient field value because it will be removed and we have non-null constraint for rest significant fields 
SET statement_timeout = '1500s';
UPDATE "Message" SET "deletedAt" = NOW() WHERE "phone" IS NULL AND "email" IS NULL AND "user" IS NULL AND "deletedAt" IS NULL AND "remoteClient" IS NOT NULL;
    
--
-- Create constraint has_phone_or_email_or_user_or_remoteClient on model message
--
ALTER TABLE "Message" DROP CONSTRAINT "has_phone_or_email_or_user_or_remoteClient";
--
-- Alter field status on message
--
--
-- Add field remoteClient to messagehistoryrecord
--
ALTER TABLE "MessageHistoryRecord" DROP COLUMN "remoteClient" CASCADE;
--
-- Add field remoteClient to message
--
ALTER TABLE "Message" DROP COLUMN "remoteClient" CASCADE;
--
-- Remove constraint has_phone_or_email_or_user from model message
--
ALTER TABLE "Message" ADD CONSTRAINT "has_phone_or_email_or_user" CHECK (("user" IS NOT NULL OR "phone" IS NOT NULL OR "email" IS NOT NULL));

SET statement_timeout = '10s';
COMMIT;

    `)
}
