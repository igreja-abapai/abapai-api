export const SEARCH_ACCENT_FROM = 'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ';

export const SEARCH_ACCENT_TO = 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC';

export function normalizeSearchText(value: string): string {
    const lower = value.trim().toLowerCase();
    let result = '';

    for (const char of lower) {
        const index = SEARCH_ACCENT_FROM.indexOf(char);
        result += index >= 0 ? SEARCH_ACCENT_TO[index] : char;
    }

    return result;
}

export function translateSqlExpression(columnExpression: string): string {
    return `LOWER(TRANSLATE(${columnExpression}, '${SEARCH_ACCENT_FROM}', '${SEARCH_ACCENT_TO}'))`;
}
