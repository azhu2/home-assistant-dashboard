/** Formatter reformats an entity value */
export type Formatter<E> = (from: E) => string;

export const NoOp: Formatter<any> = (from: any) => from;

/** ToThousands converts a number 12345 to format 12.3k */
export const ToThousands: Formatter<number> = (from: number) => `${(from / 1000).toFixed(1)}k`;

/** ToFixed sets a fixed number of deciaml digits */
export const WithPrecision: (digits: number) => Formatter<number> = (digits) => (from: number) => `${from.toFixed(digits)}`;
