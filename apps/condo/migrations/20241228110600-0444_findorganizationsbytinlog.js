// auto generated by kmigrator
// KMIGRATOR:0444_findorganizationsbytinlog:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMC41IG9uIDIwMjQtMTItMjggMDY6MDYKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKaW1wb3J0IGRqYW5nby5kYi5tb2RlbHMuZGVsZXRpb24KCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzA0NDNfYjJiYWNjZXNzdG9rZW5fYjJiYWNjZXNzdG9rZW5oaXN0b3J5cmVjb3JkX2FuZF9tb3JlJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkNyZWF0ZU1vZGVsKAogICAgICAgICAgICBuYW1lPSdmaW5kb3JnYW5pemF0aW9uc2J5dGlubG9nJywKICAgICAgICAgICAgZmllbGRzPVsKICAgICAgICAgICAgICAgICgndXNlclBob25lJywgbW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgndXNlckVtYWlsJywgbW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgndGluJywgbW9kZWxzLlRleHRGaWVsZCgpKSwKICAgICAgICAgICAgICAgICgnaWQnLCBtb2RlbHMuVVVJREZpZWxkKHByaW1hcnlfa2V5PVRydWUsIHNlcmlhbGl6ZT1GYWxzZSkpLAogICAgICAgICAgICAgICAgKCd2JywgbW9kZWxzLkludGVnZXJGaWVsZChkZWZhdWx0PTEpKSwKICAgICAgICAgICAgICAgICgnY3JlYXRlZEF0JywgbW9kZWxzLkRhdGVUaW1lRmllbGQoYmxhbms9VHJ1ZSwgZGJfaW5kZXg9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ3VwZGF0ZWRBdCcsIG1vZGVscy5EYXRlVGltZUZpZWxkKGJsYW5rPVRydWUsIGRiX2luZGV4PVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdkdicsIG1vZGVscy5JbnRlZ2VyRmllbGQoKSksCiAgICAgICAgICAgICAgICAoJ3NlbmRlcicsIG1vZGVscy5KU09ORmllbGQoKSksCiAgICAgICAgICAgICAgICAoJ2NyZWF0ZWRCeScsIG1vZGVscy5Gb3JlaWduS2V5KGJsYW5rPVRydWUsIGRiX2NvbHVtbj0nY3JlYXRlZEJ5JywgbnVsbD1UcnVlLCBvbl9kZWxldGU9ZGphbmdvLmRiLm1vZGVscy5kZWxldGlvbi5TRVRfTlVMTCwgcmVsYXRlZF9uYW1lPScrJywgdG89J19kamFuZ29fc2NoZW1hLnVzZXInKSksCiAgICAgICAgICAgICAgICAoJ3VwZGF0ZWRCeScsIG1vZGVscy5Gb3JlaWduS2V5KGJsYW5rPVRydWUsIGRiX2NvbHVtbj0ndXBkYXRlZEJ5JywgbnVsbD1UcnVlLCBvbl9kZWxldGU9ZGphbmdvLmRiLm1vZGVscy5kZWxldGlvbi5TRVRfTlVMTCwgcmVsYXRlZF9uYW1lPScrJywgdG89J19kamFuZ29fc2NoZW1hLnVzZXInKSksCiAgICAgICAgICAgICAgICAoJ3VzZXInLCBtb2RlbHMuRm9yZWlnbktleShibGFuaz1UcnVlLCBkYl9jb2x1bW49J3VzZXInLCBudWxsPVRydWUsIG9uX2RlbGV0ZT1kamFuZ28uZGIubW9kZWxzLmRlbGV0aW9uLlNFVF9OVUxMLCByZWxhdGVkX25hbWU9JysnLCB0bz0nX2RqYW5nb19zY2hlbWEudXNlcicpKSwKICAgICAgICAgICAgXSwKICAgICAgICAgICAgb3B0aW9ucz17CiAgICAgICAgICAgICAgICAnZGJfdGFibGUnOiAnRmluZE9yZ2FuaXphdGlvbnNCeVRpbkxvZycsCiAgICAgICAgICAgIH0sCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Create model findorganizationsbytinlog
--
CREATE TABLE "FindOrganizationsByTinLog" ("userPhone" text NULL, "userEmail" text NULL, "tin" text NOT NULL, "id" uuid NOT NULL PRIMARY KEY, "v" integer NOT NULL, "createdAt" timestamp with time zone NULL, "updatedAt" timestamp with time zone NULL, "dv" integer NOT NULL, "sender" jsonb NOT NULL, "createdBy" uuid NULL, "updatedBy" uuid NULL, "user" uuid NULL);
ALTER TABLE "FindOrganizationsByTinLog" ADD CONSTRAINT "FindOrganizationsByTinLog_createdBy_0559887d_fk_User_id" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "FindOrganizationsByTinLog" ADD CONSTRAINT "FindOrganizationsByTinLog_updatedBy_48f85e4f_fk_User_id" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "FindOrganizationsByTinLog" ADD CONSTRAINT "FindOrganizationsByTinLog_user_81ee2e1a_fk_User_id" FOREIGN KEY ("user") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "FindOrganizationsByTinLog_createdAt_0cbe3b88" ON "FindOrganizationsByTinLog" ("createdAt");
CREATE INDEX "FindOrganizationsByTinLog_updatedAt_5edfb95c" ON "FindOrganizationsByTinLog" ("updatedAt");
CREATE INDEX "FindOrganizationsByTinLog_createdBy_0559887d" ON "FindOrganizationsByTinLog" ("createdBy");
CREATE INDEX "FindOrganizationsByTinLog_updatedBy_48f85e4f" ON "FindOrganizationsByTinLog" ("updatedBy");
CREATE INDEX "FindOrganizationsByTinLog_user_81ee2e1a" ON "FindOrganizationsByTinLog" ("user");
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Create model findorganizationsbytinlog
--
DROP TABLE "FindOrganizationsByTinLog" CASCADE;
COMMIT;

    `)
}
