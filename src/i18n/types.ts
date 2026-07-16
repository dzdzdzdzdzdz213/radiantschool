export type Lang = 'fr' | 'en' | 'ar';
export type Dict = Record<string, string | ((...args: string[]) => string)>;
