import { DateTime } from 'luxon';

export const CHURCH_TIMEZONE = 'America/Sao_Paulo';

function jsWeekdayToLuxonWeekday(jsWeekday: number): number {
    return jsWeekday === 0 ? 7 : jsWeekday;
}

export function getChurchWeekdayIndex(date: Date): number {
    const luxonWeekday = DateTime.fromJSDate(date, { zone: CHURCH_TIMEZONE }).weekday;
    return luxonWeekday === 7 ? 0 : luxonWeekday;
}

/**
 * Combines a calendar date with an HH:mm time in the church timezone.
 * Worship templates store wall-clock times (e.g. 19:00) that must not depend on server TZ.
 */
export function combineDateWithTimeInChurchTimezone(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map((part) => Number(part));
    const hour = Number.isNaN(hours) ? 19 : hours;
    const minute = Number.isNaN(minutes) ? 0 : minutes;

    const churchDate = DateTime.fromJSDate(date, { zone: CHURCH_TIMEZONE });

    return DateTime.fromObject(
        {
            year: churchDate.year,
            month: churchDate.month,
            day: churchDate.day,
            hour,
            minute,
            second: 0,
            millisecond: 0,
        },
        { zone: CHURCH_TIMEZONE },
    ).toJSDate();
}

/**
 * Parses a scheduledAt value from the client.
 * ISO strings with offset/Z are treated as absolute instants.
 * Datetime-local strings without offset are interpreted as church wall-clock time.
 */
export function parseClientScheduledAt(value: string): Date {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error('scheduledAt is required');
    }

    if (/[zZ]$/.test(trimmed) || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
        return DateTime.fromISO(trimmed, { setZone: true }).toJSDate();
    }

    const localMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2})?$/);
    if (localMatch) {
        return DateTime.fromISO(`${localMatch[1]}T${localMatch[2]}`, {
            zone: CHURCH_TIMEZONE,
        }).toJSDate();
    }

    return DateTime.fromISO(trimmed, { zone: CHURCH_TIMEZONE }).toJSDate();
}

export function parseChurchDateStart(value: string): Date {
    const localMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (localMatch) {
        return DateTime.fromISO(`${localMatch[1]}T00:00:00`, { zone: CHURCH_TIMEZONE }).toJSDate();
    }

    return DateTime.fromJSDate(new Date(value), { zone: CHURCH_TIMEZONE })
        .startOf('day')
        .toJSDate();
}

export function getNextWeekdayOccurrencesInChurchTimezone(
    startFrom: Date,
    jsWeekday: number,
    count: number,
): Date[] {
    const dates: Date[] = [];
    let cursor = DateTime.fromJSDate(startFrom, { zone: CHURCH_TIMEZONE }).startOf('day');
    const targetWeekday = jsWeekdayToLuxonWeekday(jsWeekday);

    while (cursor.weekday !== targetWeekday) {
        cursor = cursor.plus({ days: 1 });
    }

    while (dates.length < count) {
        dates.push(cursor.toJSDate());
        cursor = cursor.plus({ weeks: 1 });
    }

    return dates;
}
