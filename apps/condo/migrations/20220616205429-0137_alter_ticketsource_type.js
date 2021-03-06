// auto generated by kmigrator
// KMIGRATOR:0137_alter_ticketsource_type:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi43IG9uIDIwMjItMDYtMTYgMTU6NTQKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAxMzZfb3JnYW5pemF0aW9uX3Rpbl9hbHRlcl9vcmdhbml6YXRpb25oaXN0b3J5cmVjb3JkX3RpbicpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5BbHRlckZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSd0aWNrZXRzb3VyY2UnLAogICAgICAgICAgICBuYW1lPSd0eXBlJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkNoYXJGaWVsZChjaG9pY2VzPVsoJ2VtYWlsJywgJ2VtYWlsJyksICgnbW9iaWxlX2FwcCcsICdtb2JpbGVfYXBwJyksICgncmVtb3RlX3N5c3RlbScsICdyZW1vdGVfc3lzdGVtJyksICgnY2FsbCcsICdjYWxsJyksICgnb3RoZXInLCAnb3RoZXInKSwgKCd2aXNpdCcsICd2aXNpdCcpLCAoJ3dlYl9hcHAnLCAnd2ViX2FwcCcpLCAoJ29yZ2FuaXphdGlvbl9zaXRlJywgJ29yZ2FuaXphdGlvbl9zaXRlJyksICgnbWVzc2VuZ2VyJywgJ21lc3NlbmdlcicpLCAoJ3NvY2lhbF9uZXR3b3JrJywgJ3NvY2lhbF9uZXR3b3JrJyksICgnbW9iaWxlX2FwcF9zdGFmZicsICdtb2JpbGVfYXBwX3N0YWZmJyksICgnbW9iaWxlX2FwcF9yZXNpZGVudCcsICdtb2JpbGVfYXBwX3Jlc2lkZW50JyldLCBtYXhfbGVuZ3RoPTUwKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
        BEGIN;
            INSERT INTO "TicketSource" (dv, sender, type, name, id, v, "createdAt", "updatedAt", "deletedAt", "newId", "createdBy", "organization", "updatedBy") VALUES (1, '{"dv": 1, "fingerprint": "initial"}', 'mobile_app_staff', 'Приложение техника', '291e093c-050b-4dbd-96d1-da67c5826b6d', 1, '2022-06-16 00:00:00.000000', '2022-06-16 00:00:00.000000', null, null, null, null, null) ON CONFLICT (id) DO NOTHING;
            INSERT INTO "TicketSource" (dv, sender, type, name, id, v, "createdAt", "updatedAt", "deletedAt", "newId", "createdBy", "organization", "updatedBy") VALUES (1, '{"dv": 1, "fingerprint": "initial"}', 'mobile_app_resident', 'Приложение жителя', '830d1d89-2d17-4c5b-96d1-21b5cd01a6d3', 1, '2022-06-16 00:00:00.000000', '2022-06-16 00:00:00.000000', null, null, null, null, null) ON CONFLICT (id) DO NOTHING; 
    
            UPDATE "TicketSource" SET name = 'ticket.source.EMAIL.name' WHERE id = '0e9af80b-b5f0-4667-9f8e-577f1cab1a21';
            UPDATE "TicketSource" SET name = 'ticket.source.MOBILE_APP.name' WHERE id = '3068d49a-a45c-4c3a-a02d-ea1a53e1febb';
            UPDATE "TicketSource" SET name = 'ticket.source.REMOTE_SYSTEM.name' WHERE id = '69067480-e117-4e4d-8875-3970c79d6da3'; 
            UPDATE "TicketSource" SET name = 'ticket.source.CALL.name' WHERE id = '779d7bb6-b194-4d2c-a967-1f7321b2787f';
            UPDATE "TicketSource" SET name = 'ticket.source.OTHER.name' WHERE id = '7da1e3be-06ba-4c9e-bba6-f97f278ac6e4';
            UPDATE "TicketSource" SET name = 'ticket.source.VISIT.name' WHERE id = '8e12e1c4-3911-4cdb-acce-4c20f19d4f9b';
            UPDATE "TicketSource" SET name = 'ticket.source.WEB_APP.name' WHERE id = 'a6737b2f-0e48-45e3-bd94-71952668666a';
            UPDATE "TicketSource" SET name = 'ticket.source.ORGANIZATION_SITE.name' WHERE id = 'afb00440-25f8-4508-8f9f-4edc1dc47de7';
            UPDATE "TicketSource" SET name = 'ticket.source.MESSENGER.name' WHERE id = 'b2e93f41-fa8a-40a0-8748-d404e1a46639';
            UPDATE "TicketSource" SET name = 'ticket.source.SOCIAL_NETWORK.name' WHERE id = 'e5946771-2b04-498d-a600-5bed68a2d751';
            UPDATE "TicketSource" SET name = 'ticket.source.MOBILE_APP_STAFF.name' WHERE id = '291e093c-050b-4dbd-96d1-da67c5826b6d';
            UPDATE "TicketSource" SET name = 'ticket.source.MOBILE_APP_RESIDENT.name' WHERE id = '830d1d89-2d17-4c5b-96d1-21b5cd01a6d3';
        END;
    `)
}

exports.down = async (knex) => {
    await knex.raw(`
        BEGIN;
            DELETE FROM "MeterReadingSource" WHERE id = '830d1d89-2d17-4c5b-96d1-21b5cd01a6d3';
            DELETE FROM "MeterReadingSource" WHERE id = '291e093c-050b-4dbd-96d1-da67c5826b6d';

            UPDATE "TicketSource" SET name = 'Эл. почта (e-mail)' WHERE id = '0e9af80b-b5f0-4667-9f8e-577f1cab1a21';
            UPDATE "TicketSource" SET name = 'ЛК приложение' WHERE id = '3068d49a-a45c-4c3a-a02d-ea1a53e1febb';
            UPDATE "TicketSource" SET name = 'ГИС ЖКХ' WHERE id = '69067480-e117-4e4d-8875-3970c79d6da3';
            UPDATE "TicketSource" SET name = 'Звонок' WHERE id = '779d7bb6-b194-4d2c-a967-1f7321b2787f';
            UPDATE "TicketSource" SET name = 'Другое' WHERE id = '7da1e3be-06ba-4c9e-bba6-f97f278ac6e4';
            UPDATE "TicketSource" SET name = 'Личный визит' WHERE id = '8e12e1c4-3911-4cdb-acce-4c20f19d4f9b';
            UPDATE "TicketSource" SET name = 'ЛК сайт' WHERE id = 'a6737b2f-0e48-45e3-bd94-71952668666a';
            UPDATE "TicketSource" SET name = 'Сайт организации' WHERE id = 'afb00440-25f8-4508-8f9f-4edc1dc47de7';
            UPDATE "TicketSource" SET name = 'Мессенджеры (tg, watsapp, viber, ..)' WHERE id = 'b2e93f41-fa8a-40a0-8748-d404e1a46639';
            UPDATE "TicketSource" SET name = 'Соц. сети (vk, fb, ..)' WHERE id = 'e5946771-2b04-498d-a600-5bed68a2d751';            
        END;
    `)
}