// auto generated by kmigrator
// KMIGRATOR:0424_remove_ticket_ticket_assignee_exec_org_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMi4xMyBvbiAyMDI0LTA5LTE5IDE1OjI5CgppbXBvcnQgZGphbmdvLmNvbnRyaWIucG9zdGdyZXMuaW5kZXhlcwpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucwoKCmNsYXNzIE1pZ3JhdGlvbihtaWdyYXRpb25zLk1pZ3JhdGlvbik6CgogICAgZGVwZW5kZW5jaWVzID0gWwogICAgICAgICgnX2RqYW5nb19zY2hlbWEnLCAnMDQyM19iaWxsaW5nYWNjb3VudF9iaWxsaW5nYWNjb3VudF9udW1iZXJfZGVsZXRlZGF0JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUluZGV4KAogICAgICAgICAgICBtb2RlbF9uYW1lPSd0aWNrZXQnLAogICAgICAgICAgICBuYW1lPSd0aWNrZXRfYXNzaWduZWVfZXhlY19vcmcnLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRJbmRleCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0ndGlja2V0JywKICAgICAgICAgICAgaW5kZXg9ZGphbmdvLmNvbnRyaWIucG9zdGdyZXMuaW5kZXhlcy5CVHJlZUluZGV4KGZpZWxkcz1bJ29yZ2FuaXphdGlvbicsICdhc3NpZ25lZScsICdleGVjdXRvcicsICdkZWxldGVkQXQnXSwgbmFtZT0ndGlja2V0X29yZ19hc3NpZ25fZXhlY19kZWxldGVkQXQnKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- [CUSTOM] Set Statement Timeout to some large amount - 25 min (25 * 60 => 1500 sec)
--
SET statement_timeout = '1500s';
--
-- Remove index ticket_assignee_exec_org from ticket
--
DROP INDEX IF EXISTS "ticket_assignee_exec_org";
--
-- Create index ticket_org_assign_exec_deletedAt on field(s) organization, assignee, executor, deletedAt of model ticket
--
CREATE INDEX IF NOT EXISTS "ticket_org_assign_exec_deletedAt" ON "Ticket" USING btree ("organization", "assignee", "executor", "deletedAt");
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
-- [CUSTOM] Set Statement Timeout to some large amount - 25 min (25 * 60 => 1500 sec)
--
SET statement_timeout = '1500s';
--
-- Create index ticket_org_assign_exec_deletedAt on field(s) organization, assignee, executor, deletedAt of model ticket
--
DROP INDEX IF EXISTS "ticket_org_assign_exec_deletedAt";
--
-- Remove index ticket_assignee_exec_org from ticket
--
CREATE INDEX IF NOT EXISTS "ticket_assignee_exec_org" ON "Ticket" USING btree ("assignee", "executor", "organization");
--
-- [CUSTOM] Revert Statement Timeout to default amount - 10 secs
--
SET statement_timeout = '10s';
COMMIT;

    `)
}
