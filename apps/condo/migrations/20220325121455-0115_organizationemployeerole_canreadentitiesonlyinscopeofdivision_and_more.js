// auto generated by kmigrator
// KMIGRATOR:0115_organizationemployeerole_canreadentitiesonlyinscopeofdivision_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMCBvbiAyMDIyLTAzLTI1IDA3OjE1Cgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucywgbW9kZWxzCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwMTE0X2F1dG9fMjAyMjAzMjRfMDcyMCcpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nb3JnYW5pemF0aW9uZW1wbG95ZWVyb2xlJywKICAgICAgICAgICAgbmFtZT0nY2FuUmVhZEVudGl0aWVzT25seUluU2NvcGVPZkRpdmlzaW9uJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChkZWZhdWx0PUZhbHNlKSwKICAgICAgICAgICAgcHJlc2VydmVfZGVmYXVsdD1GYWxzZSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J29yZ2FuaXphdGlvbmVtcGxveWVlcm9sZWhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdjYW5SZWFkRW50aXRpZXNPbmx5SW5TY29wZU9mRGl2aXNpb24nLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canReadEntitiesOnlyInScopeOfDivision to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" ADD COLUMN "canReadEntitiesOnlyInScopeOfDivision" boolean DEFAULT false NOT NULL;
ALTER TABLE "OrganizationEmployeeRole" ALTER COLUMN "canReadEntitiesOnlyInScopeOfDivision" DROP DEFAULT;
--
-- Add field canReadEntitiesOnlyInScopeOfDivision to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" ADD COLUMN "canReadEntitiesOnlyInScopeOfDivision" boolean NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canReadEntitiesOnlyInScopeOfDivision to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" DROP COLUMN "canReadEntitiesOnlyInScopeOfDivision" CASCADE;
--
-- Add field canReadEntitiesOnlyInScopeOfDivision to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" DROP COLUMN "canReadEntitiesOnlyInScopeOfDivision" CASCADE;
COMMIT;

    `)
}
