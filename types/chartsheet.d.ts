declare module "chartsheet" {
  export type ChartType =
    | "bar"
    | "column"
    | "line"
    | "pie"
    | "doughnut"
    | "area"
    | "scatter"
    | "radar";

  export interface ChartSeries {
    ref: string;
    nameRef?: string;
    name?: string;
    colour?: string;
    color?: string;
    xRef?: string;
  }

  export interface ChartAnchor {
    col?: number;
    row?: number;
    colOffset?: number;
    rowOffset?: number;
  }

  export interface ChartSpec {
    type: ChartType;
    series: ChartSeries[];
    sheet?: string;
    title?: string;
    xTitle?: string;
    yTitle?: string;
    categories?: string;
    anchor?: ChartAnchor;
    width?: number;
    height?: number;
    legend?: string | false;
    dataLabels?: boolean;
    numberFormat?: string;
    gridlines?: boolean;
    stacked?: boolean;
    horizontal?: boolean;
    gapWidth?: number;
    name?: string;
  }

  export function addChart(
    workbook: Buffer | Uint8Array | ArrayBuffer,
    spec: ChartSpec,
  ): Promise<Buffer>;

  export function addCharts(
    workbook: Buffer | Uint8Array | ArrayBuffer,
    specs: ChartSpec[],
  ): Promise<Buffer>;

  export function validate(
    workbook: Buffer | Uint8Array | ArrayBuffer,
  ): Promise<{ valid: boolean; errors: string[] }>;
}
