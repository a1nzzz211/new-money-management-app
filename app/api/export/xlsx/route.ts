import { createClient } from "@/lib/supabase/server";
import { listAllTransactions } from "@/lib/data";
import { hariIni } from "@/lib/format";
import { parseExportRange } from "@/lib/export";
import { buildTransactionsXlsx } from "@/lib/export-xlsx";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = parseExportRange(searchParams);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: "Sesi tidak ditemukan, silakan masuk kembali" },
      { status: 401 },
    );
  }

  let rows: Awaited<ReturnType<typeof listAllTransactions>>;
  try {
    rows = await listAllTransactions(supabase, {
      userId: user.id,
      ...parsed.range,
    });
  } catch {
    return Response.json(
      { error: "Gagal mengekspor data transaksi, silakan coba lagi" },
      { status: 500 },
    );
  }

  let buffer: Buffer;
  try {
    buffer = await buildTransactionsXlsx(rows);
  } catch {
    return Response.json(
      { error: "Gagal membuat file XLSX, silakan coba lagi" },
      { status: 500 },
    );
  }

  const filename = `transaksi-${hariIni()}.xlsx`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
