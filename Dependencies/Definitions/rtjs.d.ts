declare var require;

interface String {
  /**
    * Digests the string into a single hash value.
    */
  hashCode(): number;
  format(format: string, ...args: string[]): string;
  toCurrency(/* optional */ fractalDigits?: number, /* optional */ showKr?: boolean, /* optional */ roundToHundred?: boolean): string;
}

declare var G_vmlCanvasManager: any; // IE8 compatibility