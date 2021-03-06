// auto generated by kmigrator
// KMIGRATOR:0139_remove_ticketclassifier_createdby_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMC40IG9uIDIwMjItMDYtMjEgMDY6NTQKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwMTM4X2IyY2FwcF9iMmNhcHBhY2Nlc3NyaWdodGhpc3RvcnlyZWNvcmRfYW5kX21vcmUnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwojICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAojICAgICAgICAgICAgbW9kZWxfbmFtZT0ndGlja2V0Y2xhc3NpZmllcicsCiMgICAgICAgICAgICBuYW1lPSdjcmVhdGVkQnknLAojICAgICAgICApLAojICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAojICAgICAgICAgICAgbW9kZWxfbmFtZT0ndGlja2V0Y2xhc3NpZmllcicsCiMgICAgICAgICAgICBuYW1lPSdvcmdhbml6YXRpb24nLAojICAgICAgICApLAojICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAojICAgICAgICAgICAgbW9kZWxfbmFtZT0ndGlja2V0Y2xhc3NpZmllcicsCiMgICAgICAgICAgICBuYW1lPSdwYXJlbnQnLAojICAgICAgICApLAojICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAojICAgICAgICAgICAgbW9kZWxfbmFtZT0ndGlja2V0Y2xhc3NpZmllcicsCiMgICAgICAgICAgICBuYW1lPSd1cGRhdGVkQnknLAojICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3RpY2tldCcsCiAgICAgICAgICAgIG5hbWU9J2NsYXNzaWZpZXInLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0ndGlja2V0Y2hhbmdlJywKICAgICAgICAgICAgbmFtZT0nY2xhc3NpZmllckRpc3BsYXlOYW1lRnJvbScsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSd0aWNrZXRjaGFuZ2UnLAogICAgICAgICAgICBuYW1lPSdjbGFzc2lmaWVyRGlzcGxheU5hbWVUbycsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSd0aWNrZXRjaGFuZ2UnLAogICAgICAgICAgICBuYW1lPSdjbGFzc2lmaWVySWRGcm9tJywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3RpY2tldGNoYW5nZScsCiAgICAgICAgICAgIG5hbWU9J2NsYXNzaWZpZXJJZFRvJywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3RpY2tldGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdjbGFzc2lmaWVyJywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuRGVsZXRlTW9kZWwoCiAgICAgICAgICAgIG5hbWU9J3RpY2tldGNsYXNzaWZpZXInLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5EZWxldGVNb2RlbCgKICAgICAgICAgICAgbmFtZT0ndGlja2V0Y2xhc3NpZmllcmhpc3RvcnlyZWNvcmQnLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Remove field classifier from ticket
--
SET CONSTRAINTS "Ticket_classifier_7a786997_fk_TicketClassifier_id" IMMEDIATE; ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_classifier_7a786997_fk_TicketClassifier_id";
ALTER TABLE "Ticket" DROP COLUMN "classifier" CASCADE;
--
-- Remove field classifierDisplayNameFrom from ticketchange
--
ALTER TABLE "TicketChange" DROP COLUMN "classifierDisplayNameFrom" CASCADE;
--
-- Remove field classifierDisplayNameTo from ticketchange
--
ALTER TABLE "TicketChange" DROP COLUMN "classifierDisplayNameTo" CASCADE;
--
-- Remove field classifierIdFrom from ticketchange
--
ALTER TABLE "TicketChange" DROP COLUMN "classifierIdFrom" CASCADE;
--
-- Remove field classifierIdTo from ticketchange
--
ALTER TABLE "TicketChange" DROP COLUMN "classifierIdTo" CASCADE;
--
-- Remove field classifier from tickethistoryrecord
--
ALTER TABLE "TicketHistoryRecord" DROP COLUMN "classifier" CASCADE;
--
-- Delete model ticketclassifier
--
DROP TABLE "TicketClassifier" CASCADE;
--
-- Delete model ticketclassifierhistoryrecord
--
DROP TABLE "TicketClassifierHistoryRecord" CASCADE;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Delete model ticketclassifierhistoryrecord
--
CREATE TABLE "TicketClassifierHistoryRecord" ("dv" integer NULL, "sender" jsonb NULL, "organization" uuid NULL, "parent" uuid NULL, "fullName" jsonb NULL, "name" text NULL, "id" uuid NOT NULL PRIMARY KEY, "v" integer NULL, "createdAt" timestamp with time zone NULL, "updatedAt" timestamp with time zone NULL, "createdBy" uuid NULL, "updatedBy" uuid NULL, "deletedAt" timestamp with time zone NULL, "newId" jsonb NULL, "history_date" timestamp with time zone NOT NULL, "history_action" varchar(50) NOT NULL, "history_id" uuid NOT NULL);
--
-- Delete model ticketclassifier
--
CREATE TABLE "TicketClassifier" ("dv" integer NOT NULL, "sender" jsonb NOT NULL, "name" text NOT NULL, "id" uuid NOT NULL PRIMARY KEY, "v" integer NOT NULL, "createdAt" timestamp with time zone NULL, "updatedAt" timestamp with time zone NULL, "deletedAt" timestamp with time zone NULL, "newId" uuid NULL, "createdBy" uuid NULL, "organization" uuid NULL, "parent" uuid NULL, "updatedBy" uuid NULL);
--
-- Remove field classifier from tickethistoryrecord
--
ALTER TABLE "TicketHistoryRecord" ADD COLUMN "classifier" uuid NULL;
--
-- Remove field classifierIdTo from ticketchange
--
ALTER TABLE "TicketChange" ADD COLUMN "classifierIdTo" uuid NULL;
--
-- Remove field classifierIdFrom from ticketchange
--
ALTER TABLE "TicketChange" ADD COLUMN "classifierIdFrom" uuid NULL;
--
-- Remove field classifierDisplayNameTo from ticketchange
--
ALTER TABLE "TicketChange" ADD COLUMN "classifierDisplayNameTo" text NULL;
--
-- Remove field classifierDisplayNameFrom from ticketchange
--
ALTER TABLE "TicketChange" ADD COLUMN "classifierDisplayNameFrom" text NULL;
--
-- Remove field classifier from ticket
--
ALTER TABLE "Ticket" ADD COLUMN "classifier" uuid NULL CONSTRAINT "Ticket_classifier_7a786997_fk_TicketClassifier_id" REFERENCES "TicketClassifier"("id") DEFERRABLE INITIALLY DEFERRED; SET CONSTRAINTS "Ticket_classifier_7a786997_fk_TicketClassifier_id" IMMEDIATE;
CREATE INDEX "TicketClassifierHistoryRecord_history_id_f8f5a454" ON "TicketClassifierHistoryRecord" ("history_id");
ALTER TABLE "TicketClassifier" ADD CONSTRAINT "TicketClassifier_createdBy_d2aed76e_fk_User_id" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "TicketClassifier" ADD CONSTRAINT "TicketClassifier_organization_1327189b_fk_Organization_id" FOREIGN KEY ("organization") REFERENCES "Organization" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "TicketClassifier" ADD CONSTRAINT "TicketClassifier_parent_e74abbbf_fk_TicketClassifier_id" FOREIGN KEY ("parent") REFERENCES "TicketClassifier" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "TicketClassifier" ADD CONSTRAINT "TicketClassifier_updatedBy_14e04db3_fk_User_id" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "TicketClassifier_createdAt_f1ea1adb" ON "TicketClassifier" ("createdAt");
CREATE INDEX "TicketClassifier_updatedAt_274460f0" ON "TicketClassifier" ("updatedAt");
CREATE INDEX "TicketClassifier_deletedAt_e5847f14" ON "TicketClassifier" ("deletedAt");
CREATE INDEX "TicketClassifier_createdBy_d2aed76e" ON "TicketClassifier" ("createdBy");
CREATE INDEX "TicketClassifier_organization_1327189b" ON "TicketClassifier" ("organization");
CREATE INDEX "TicketClassifier_parent_e74abbbf" ON "TicketClassifier" ("parent");
CREATE INDEX "TicketClassifier_updatedBy_14e04db3" ON "TicketClassifier" ("updatedBy");
CREATE INDEX "Ticket_classifier_7a786997" ON "Ticket" ("classifier");
COMMIT;

    `)
}
