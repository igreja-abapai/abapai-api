export function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildWordStartPattern(search: string, delimiters = '[[:space:]]'): string {
    const trimmed = search.trim();
    if (!trimmed) return '';

    return `(^|${delimiters})${escapeRegExp(trimmed)}`;
}
