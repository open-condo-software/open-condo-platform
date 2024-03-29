// auto generated by kmigrator
// KMIGRATOR:0156_ticket_lastcommentat_ticketchange_lastcommentatfrom_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMCBvbiAyMDIyLTA3LTI3IDEzOjEyCgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucywgbW9kZWxzCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwMTU1X21ldGVyX2IyYmFwcF9tZXRlcl9iMmNhcHBfbWV0ZXJoaXN0b3J5cmVjb3JkX2IyYmFwcF9hbmRfbW9yZScpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0ndGlja2V0JywKICAgICAgICAgICAgbmFtZT0nbGFzdENvbW1lbnRBdCcsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5EYXRlVGltZUZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSd0aWNrZXRjaGFuZ2UnLAogICAgICAgICAgICBuYW1lPSdsYXN0Q29tbWVudEF0RnJvbScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5EYXRlVGltZUZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSd0aWNrZXRjaGFuZ2UnLAogICAgICAgICAgICBuYW1lPSdsYXN0Q29tbWVudEF0VG8nLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuRGF0ZVRpbWVGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0ndGlja2V0aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2xhc3RDb21tZW50QXQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuRGF0ZVRpbWVGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;

--
-- [CUSTOM] Set Statement Timeout to some large amount - 25 min (25 * 60 => 1500 sec)
--
SET statement_timeout = '1500s';   
 
--
-- Add field lastCommentAt to ticket
--
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "lastCommentAt" timestamp with time zone NULL;
--
-- Add field lastCommentAtFrom to ticketchange
--
ALTER TABLE "TicketChange" ADD COLUMN IF NOT EXISTS "lastCommentAtFrom" timestamp with time zone NULL;
--
-- Add field lastCommentAtTo to ticketchange
--
ALTER TABLE "TicketChange" ADD COLUMN IF NOT EXISTS "lastCommentAtTo" timestamp with time zone NULL;
--
-- Add field lastCommentAt to tickethistoryrecord
--
ALTER TABLE "TicketHistoryRecord" ADD COLUMN IF NOT EXISTS "lastCommentAt" timestamp with time zone NULL;

UPDATE "Ticket"
SET "lastCommentAt" = "TicketCommentsTime"."lastCommentAt"
FROM "TicketCommentsTime"
WHERE "TicketCommentsTime".ticket = "Ticket".id;

--
-- [CUSTOM] Revert Statement Timeout to default amount - 10 secs
--
SET statement_timeout = '10s';

COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field lastCommentAt to tickethistoryrecord
--
ALTER TABLE "TicketHistoryRecord" DROP COLUMN "lastCommentAt" CASCADE;
--
-- Add field lastCommentAtTo to ticketchange
--
ALTER TABLE "TicketChange" DROP COLUMN "lastCommentAtTo" CASCADE;
--
-- Add field lastCommentAtFrom to ticketchange
--
ALTER TABLE "TicketChange" DROP COLUMN "lastCommentAtFrom" CASCADE;
--
-- Add field lastCommentAt to ticket
--
ALTER TABLE "Ticket" DROP COLUMN "lastCommentAt" CASCADE;
COMMIT;

    `)
}
