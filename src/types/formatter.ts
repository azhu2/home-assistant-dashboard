/** Formatter reformats an entity value */
export type Formatter<E> = (from: E) => string;

/** ToThounsands converts a number 12345 to format 12.3k */
export const ToThousands: Formatter<number> = (from: number) => `${(from / 1000).toFixed(1)}k`;
