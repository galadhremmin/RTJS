interface String {
  /**
    * Digests the string into a single hash value.
    */
  hashCode(): number;
  format(format: string, ...args: string[]): string;
  toCurrency(/* optional */ fractalDigits?: number, /* optional */ showKr?: boolean, /* optional */ roundToHundred?: boolean): string;
}

interface JQueryStatic {
  valHooks: any;
}

declare var G_vmlCanvasManager: any; // IE8 compatibility