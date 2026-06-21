import { normalizeSearchText } from './search-text.utils';

export { normalizeSearchText } from './search-text.utils';

export function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildWordStartPattern(search: string, delimiters = '[[:space:]]'): string {
    const trimmed = normalizeSearchText(search);
    if (!trimmed) return '';

    return `(^|${delimiters})${escapeRegExp(trimmed)}`;
}
