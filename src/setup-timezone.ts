/**
 * PostgreSQL `timestamp without time zone` values for worship schedules are stored
 * as UTC wall-clock times (e.g. 21:00 for an 18:00 BRT service).
 * Force UTC so pg/Node parse those values consistently on every server.
 */
process.env.TZ = 'UTC';
