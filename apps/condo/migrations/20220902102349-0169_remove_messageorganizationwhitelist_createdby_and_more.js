// auto generated by kmigrator
// KMIGRATOR:0169_remove_messageorganizationwhitelist_createdby_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMSBvbiAyMDIyLTA5LTAyIDA3OjIzCgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucwoKCmNsYXNzIE1pZ3JhdGlvbihtaWdyYXRpb25zLk1pZ3JhdGlvbik6CgogICAgZGVwZW5kZW5jaWVzID0gWwogICAgICAgICgnX2RqYW5nb19zY2hlbWEnLCAnMDE2OF9tZXJnZV8yMDIyMDgzMF8xNDI4JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKIyAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKIyAgICAgICAgICAgIG1vZGVsX25hbWU9J21lc3NhZ2Vvcmdhbml6YXRpb253aGl0ZWxpc3QnLAojICAgICAgICAgICAgbmFtZT0nY3JlYXRlZEJ5JywKIyAgICAgICAgKSwKIyAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKIyAgICAgICAgICAgIG1vZGVsX25hbWU9J21lc3NhZ2Vvcmdhbml6YXRpb253aGl0ZWxpc3QnLAojICAgICAgICAgICAgbmFtZT0nb3JnYW5pemF0aW9uJywKIyAgICAgICAgKSwKIyAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKIyAgICAgICAgICAgIG1vZGVsX25hbWU9J21lc3NhZ2Vvcmdhbml6YXRpb253aGl0ZWxpc3QnLAojICAgICAgICAgICAgbmFtZT0ndXBkYXRlZEJ5JywKIyAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkRlbGV0ZU1vZGVsKAogICAgICAgICAgICBuYW1lPSdtZXNzYWdlb3JnYW5pemF0aW9ud2hpdGVsaXN0JywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuRGVsZXRlTW9kZWwoCiAgICAgICAgICAgIG5hbWU9J21lc3NhZ2Vvcmdhbml6YXRpb253aGl0ZWxpc3RoaXN0b3J5cmVjb3JkJywKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Delete model messageorganizationwhitelist
--
DROP TABLE "MessageOrganizationWhiteList" CASCADE;
--
-- Delete model messageorganizationwhitelisthistoryrecord
--
DROP TABLE "MessageOrganizationWhiteListHistoryRecord" CASCADE;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Delete model messageorganizationwhitelisthistoryrecord
--
CREATE TABLE "MessageOrganizationWhiteListHistoryRecord" ("organization" uuid NULL, "type" text NULL, "description" text NULL, "id" uuid NOT NULL PRIMARY KEY, "v" integer NULL, "createdAt" timestamp with time zone NULL, "updatedAt" timestamp with time zone NULL, "createdBy" uuid NULL, "updatedBy" uuid NULL, "deletedAt" timestamp with time zone NULL, "newId" jsonb NULL, "dv" integer NULL, "sender" jsonb NULL, "history_date" timestamp with time zone NOT NULL, "history_action" varchar(50) NOT NULL, "history_id" uuid NOT NULL);
--
-- Delete model messageorganizationwhitelist
--
CREATE TABLE "MessageOrganizationWhiteList" ("type" text NOT NULL, "description" text NOT NULL, "id" uuid NOT NULL PRIMARY KEY, "v" integer NOT NULL, "createdAt" timestamp with time zone NULL, "updatedAt" timestamp with time zone NULL, "deletedAt" timestamp with time zone NULL, "newId" uuid NULL, "dv" integer NOT NULL, "sender" jsonb NOT NULL, "createdBy" uuid NULL, "organization" uuid NOT NULL, "updatedBy" uuid NULL);
CREATE INDEX "MessageOrganizationWhiteListHistoryRecord_history_id_4b31975c" ON "MessageOrganizationWhiteListHistoryRecord" ("history_id");
ALTER TABLE "MessageOrganizationWhiteList" ADD CONSTRAINT "MessageOrganizationWhiteList_createdBy_8125526b_fk_User_id" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "MessageOrganizationWhiteList" ADD CONSTRAINT "MessageOrganizationW_organization_e80178d6_fk_Organizat" FOREIGN KEY ("organization") REFERENCES "Organization" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "MessageOrganizationWhiteList" ADD CONSTRAINT "MessageOrganizationWhiteList_updatedBy_21ea4ee5_fk_User_id" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE UNIQUE INDEX "message_organization_white_list_unique_organization_and_type" ON "MessageOrganizationWhiteList" ("organization", "type") WHERE "deletedAt" IS NULL;
CREATE INDEX "MessageOrganizationWhiteList_createdAt_89e2c532" ON "MessageOrganizationWhiteList" ("createdAt");
CREATE INDEX "MessageOrganizationWhiteList_updatedAt_4e00a185" ON "MessageOrganizationWhiteList" ("updatedAt");
CREATE INDEX "MessageOrganizationWhiteList_deletedAt_8eeb154a" ON "MessageOrganizationWhiteList" ("deletedAt");
CREATE INDEX "MessageOrganizationWhiteList_createdBy_8125526b" ON "MessageOrganizationWhiteList" ("createdBy");
CREATE INDEX "MessageOrganizationWhiteList_organization_e80178d6" ON "MessageOrganizationWhiteList" ("organization");
CREATE INDEX "MessageOrganizationWhiteList_updatedBy_21ea4ee5" ON "MessageOrganizationWhiteList" ("updatedBy");
COMMIT;

    `)
}
