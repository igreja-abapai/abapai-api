/**
 * Parses flexible date strings used for member ecclesiastical dates.
 * Supports: yyyy, mm/yyyy, dd/mm/yyyy, and ISO yyyy-mm-dd (also partial yyyy-mm).
 */
export function parseFlexibleDate(dateStr?: string | null): Date | null {
    if (!dateStr?.trim()) {
        return null;
    }

    const value = dateStr.trim();

    if (/^\d{4}$/.test(value)) {
        const year = parseInt(value, 10);
        return new Date(year, 0, 1);
    }

    const isoMatch = value.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
    if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = isoMatch[2] ? parseInt(isoMatch[2], 10) - 1 : 0;
        const day = isoMatch[3] ? parseInt(isoMatch[3], 10) : 1;
        const parsed = new Date(year, month, day);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    const parts = value
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean);

    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const parsed = new Date(year, month, day);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    if (parts.length === 2) {
        const month = parseInt(parts[0], 10) - 1;
        const year = parseInt(parts[1], 10);
        const parsed = new Date(year, month, 1);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    const fallback = new Date(value);
    return isNaN(fallback.getTime()) ? null : fallback;
}

export function extractFlexibleDateYear(dateStr?: string | null): number | null {
    const parsed = parseFlexibleDate(dateStr);
    return parsed ? parsed.getFullYear() : null;
}

export type FlexibleDatePrecision = 'year' | 'month' | 'day' | 'unknown';

export function getFlexibleDatePrecision(dateStr?: string | null): FlexibleDatePrecision {
    if (!dateStr?.trim()) {
        return 'unknown';
    }

    const value = dateStr.trim();

    if (/^\d{4}$/.test(value)) {
        return 'year';
    }

    if (/^\d{4}-\d{2}$/.test(value)) {
        return 'month';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return 'day';
    }

    const parts = value
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean);
    if (parts.length === 2) {
        return 'month';
    }
    if (parts.length === 3) {
        return 'day';
    }

    const parsed = parseFlexibleDate(value);
    return parsed ? 'day' : 'unknown';
}

/**
 * Returns true when the flexible date falls in the current or previous calendar year.
 */
export function isWithinLastCalendarYear(
    dateStr: string | null | undefined,
    now = new Date(),
): boolean {
    const year = extractFlexibleDateYear(dateStr);
    if (year === null) {
        return false;
    }

    const currentYear = now.getFullYear();
    return currentYear - year <= 1;
}
