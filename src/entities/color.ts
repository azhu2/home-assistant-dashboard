/** Represents a color and converts between rgb hex and 0-255 color values. */
export class Color {
    red: number;
    green: number;
    blue: number;

    /** Initializes from a #rrggbb or rrggbb string. */
    constructor(rgb: string);
    /** Initializes from 3 0-255 color values. */
    constructor(r: number, g: number, b: number);
    constructor(rOrRGB: string | number, g?: number, b?: number) {
        if (typeof rOrRGB === 'string') {
            const stripped = rOrRGB.replace('#', '');
            if (stripped.length !== 6) {
                throw new Error(`invalid rgb value - must be of form rrggbb or #rrggbb - ${rOrRGB}`);
            }
            const rPart = stripped.slice(0, 2);
            const gPart = stripped.slice(2, 4);
            const bPart = stripped.slice(4, 6);
            const r = parseInt(rPart, 16);
            const g = parseInt(gPart, 16);
            const b = parseInt(bPart, 16);
            if (!(isValidColorVal(r) && isValidColorVal(g) && isValidColorVal(b))) {
                throw new Error(`color values must be between 00 and ff - ${rOrRGB}`);
            }
            this.red = r;
            this.green = g;
            this.blue = b;
        } else if (typeof rOrRGB === 'number' && typeof g === 'number' && typeof b === 'number') {
            if (!(isValidColorVal(rOrRGB) && isValidColorVal(g) && isValidColorVal(b))) {
                throw new Error(`color values must be between 0 and 255 - r:${rOrRGB} g:${g} b:${b}`);
            }
            this.red = rOrRGB;
            this.green = g;
            this.blue = b;
        } else {
            throw new Error('rgb string or all of r, g, b, numbers must be defined');
        }
    }

    /** rrggbb representation of this color. */
    rgbString(leadingHash?: boolean): string {
        return `${leadingHash ? '#' : ''}${toHexStr(this.red)}${toHexStr(this.green)}${toHexStr(this.blue)}`
    }

    /** Returns a new Color with each color value scaled by scale factor. */
    scale(scale: number): Color {
        return new Color(Math.trunc(this.red * scale), Math.trunc(this.green * scale), Math.trunc(this.blue * scale));
    }
};

export const MAX_COLOR_VALUE = 255;

function isValidColorVal(v: number): boolean {
    return v >= 0 && v <= MAX_COLOR_VALUE;
}

function toHexStr(n: number): string {
    return n.toString(16).padStart(2, '0');
}
