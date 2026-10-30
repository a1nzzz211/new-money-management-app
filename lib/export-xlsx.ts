import writeXlsxFile, { type Cell, type SheetData } from "write-excel-file/node";
import { addCharts, type ChartSpec } from "chartsheet";
import { byCategory, totalsByMonth } from "@/lib/analytics";
import type { TransactionWithCategory } from "@/lib/data";
import { TRANSACTION_TYPE_LABELS } from "@/lib/export";
import { namaBulan, tanggal } from "@/lib/format";

const RUPIAH_FORMAT = '"Rp"#,##0';
const HEADER_BACKGROUND = "#1E293B";
const HEADER_TEXT = "#FFFFFF";

function headerCell(value: string): Cell {
  return {
    value,
    fontWeight: "bold",
    textColor: HEADER_TEXT,
    backgroundColor: HEADER_BACKGROUND,
  };
}

function rupiahCell(value: number, bold = false): Cell {
  return {
    value,
    type: Number,
    format: RUPIAH_FORMAT,
    align: "right",
    fontWeight: bold ? "bold" : undefined,
  };
}

export async function buildTransactionsXlsx(
  rows: TransactionWithCategory[],
): Promise<Buffer> {
  // -------------------------------------------------------------------------
  // Transaksi sheet
  // -------------------------------------------------------------------------
  const transactionData: SheetData = [
    ["Tanggal", "Jenis", "Kategori", "Nominal", "Catatan"].map(headerCell),
    ...rows.map(
      (tx): Cell[] => [
        tx.occurred_on,
        TRANSACTION_TYPE_LABELS[tx.type],
        tx.category?.name ?? "",
        rupiahCell(Number(tx.amount)),
        tx.description ?? "",
      ],
    ),
  ];

  // -------------------------------------------------------------------------
  // Ringkasan sheet
  // -------------------------------------------------------------------------
  const summaryData: SheetData = [];

  summaryData.push([
    {
      value: "Ringkasan Keuangan",
      fontWeight: "bold",
      fontSize: 16,
      columnSpan: 4,
    },
    null,
    null,
    null,
  ]);

  const period =
    rows.length > 0
      ? `${tanggal(rows[0].occurred_on)} – ${tanggal(rows[rows.length - 1].occurred_on)}`
      : "Tidak ada transaksi";

  summaryData.push([
    {
      value: `Periode: ${period}`,
      fontStyle: "italic",
      textColor: "#64748B",
      columnSpan: 4,
    },
    null,
    null,
    null,
  ]);

  summaryData.push([]);

  const totals = { income: 0, expense: 0, savings: 0 };
  for (const tx of rows) {
    totals[tx.type] += Number(tx.amount);
  }
  const net = totals.income - totals.expense - totals.savings;

  const cashFlow: Array<[string, number]> = [
    ["Pemasukan", totals.income],
    ["Pengeluaran", totals.expense],
    ["Tabungan", totals.savings],
    ["Arus Kas Bersih", net],
  ];

  for (const [label, value] of cashFlow) {
    const isNet = label === "Arus Kas Bersih";
    summaryData.push([
      { value: label, fontWeight: isNet ? "bold" : undefined },
      rupiahCell(value, isNet),
    ]);
  }

  const categories = byCategory(rows);

  summaryData.push([]);
  summaryData.push([
    {
      value: "Pengeluaran per Kategori",
      fontWeight: "bold",
      fontSize: 12,
    },
  ]);

  const categoryHeaderIndex = summaryData.length;
  summaryData.push([headerCell("Kategori"), headerCell("Total")]);

  const categoryStartIndex = summaryData.length;
  for (const category of categories) {
    summaryData.push([category.name, rupiahCell(category.total)]);
  }
  const categoryEndIndex = summaryData.length - 1;

  const months = Object.values(totalsByMonth(rows)).sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  summaryData.push([]);
  summaryData.push([
    { value: "Tren Bulanan", fontWeight: "bold", fontSize: 12 },
  ]);

  const trendHeaderIndex = summaryData.length;
  summaryData.push([
    headerCell("Bulan"),
    headerCell("Pemasukan"),
    headerCell("Pengeluaran"),
    headerCell("Tabungan"),
  ]);

  const trendStartIndex = summaryData.length;
  for (const month of months) {
    summaryData.push([
      namaBulan(month.month),
      rupiahCell(month.income),
      rupiahCell(month.expense),
      rupiahCell(month.savings),
    ]);
  }
  const trendEndIndex = summaryData.length - 1;

  // -------------------------------------------------------------------------
  // Workbook
  // -------------------------------------------------------------------------
  const buffer = await writeXlsxFile([
    {
      data: transactionData,
      sheet: "Transaksi",
      columns: [
        { width: 14 },
        { width: 14 },
        { width: 22 },
        { width: 18 },
        { width: 45 },
      ],
      stickyRowsCount: 1,
    },
    {
      data: summaryData,
      sheet: "Ringkasan",
      columns: [
        { width: 30 },
        { width: 18 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
      ],
    },
  ]).toBuffer();

  // -------------------------------------------------------------------------
  // Native charts (1-based Excel row refs)
  // -------------------------------------------------------------------------
  const charts: ChartSpec[] = [];

  if (categories.length > 0) {
    charts.push({
      sheet: "Ringkasan",
      type: "pie",
      title: "Pengeluaran per Kategori",
      categories: `'Ringkasan'!$A$${categoryStartIndex + 1}:$A$${categoryEndIndex + 1}`,
      series: [
        {
          nameRef: `'Ringkasan'!$B$${categoryHeaderIndex + 1}`,
          ref: `'Ringkasan'!$B$${categoryStartIndex + 1}:$B$${categoryEndIndex + 1}`,
        },
      ],
      anchor: { col: 8, row: 0 },
      width: 520,
      height: 320,
      dataLabels: true,
      legend: "b",
      numberFormat: RUPIAH_FORMAT,
    });
  }

  if (months.length > 0) {
    charts.push({
      sheet: "Ringkasan",
      type: "column",
      title: "Tren Bulanan",
      categories: `'Ringkasan'!$A$${trendStartIndex + 1}:$A$${trendEndIndex + 1}`,
      series: [
        {
          nameRef: `'Ringkasan'!$B$${trendHeaderIndex + 1}`,
          ref: `'Ringkasan'!$B$${trendStartIndex + 1}:$B$${trendEndIndex + 1}`,
          colour: "#22c55e",
        },
        {
          nameRef: `'Ringkasan'!$C$${trendHeaderIndex + 1}`,
          ref: `'Ringkasan'!$C$${trendStartIndex + 1}:$C$${trendEndIndex + 1}`,
          colour: "#ef4444",
        },
        {
          nameRef: `'Ringkasan'!$D$${trendHeaderIndex + 1}`,
          ref: `'Ringkasan'!$D$${trendStartIndex + 1}:$D$${trendEndIndex + 1}`,
          colour: "#3b82f6",
        },
      ],
      anchor: { col: 8, row: 18 },
      width: 560,
      height: 340,
      legend: "b",
      numberFormat: RUPIAH_FORMAT,
    });
  }

  return charts.length > 0 ? addCharts(buffer, charts) : buffer;
}
