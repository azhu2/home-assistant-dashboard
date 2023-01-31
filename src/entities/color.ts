export class Color {
    red: number;
    green: number;
    blue: number;

    constructor(rgb: string);
    constructor(r: number, g: number, b: number);
    constructor(rOrRGB: string | number, g?: number, b?: number) {
        if (typeof rOrRGB === 'string') {
            const stripped = rOrRGB.replace('#', '');
            if (stripped.length != 6) {
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

    rgbString(): string {
        return `${toHexStr(this.red)}${toHexStr(this.green)}${toHexStr(this.blue)}`
    }

    scale(scale: number): Color {
        return new Color(Math.trunc(this.red * scale), Math.trunc(this.green * scale), Math.trunc(this.blue * scale));
    }
};

function isValidColorVal(v: number): boolean {
    return v >= 0 && v <= 255;
}

function toHexStr(n: number): string {
    return n.toString(16).padEnd(2, '0');
}
