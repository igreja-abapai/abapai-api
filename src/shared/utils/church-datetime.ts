import { DateTime } from 'luxon';

export const CHURCH_TIMEZONE = 'America/Sao_Paulo';

/**
 * Combines a calendar date with an HH:mm time in the church timezone.
 * Worship templates store wall-clock times (e.g. 19:00) that must not depend on server TZ.
 */
export function combineDateWithTimeInChurchTimezone(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map((part) => Number(part));
    const hour = Number.isNaN(hours) ? 19 : hours;
    const minute = Number.isNaN(minutes) ? 0 : minutes;

    return DateTime.fromObject(
        {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour,
            minute,
            second: 0,
            millisecond: 0,
        },
        { zone: CHURCH_TIMEZONE },
    ).toJSDate();
}
