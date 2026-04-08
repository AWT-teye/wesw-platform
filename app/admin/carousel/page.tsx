import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toggleSlideActive, deleteSlide } from "./actions";

export const dynamic = "force-dynamic";

export default async function CarouselListPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hero_slides")
    .select("id, title, subtitle, image_url, display_order, is_active")
    .eq("is_archived", false)
    .order("display_order", { ascending: true });

  const items = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">캐러셀 관리</h1>
        <Link href="/admin/carousel/new" className="rounded-md bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white hover:opacity-90">
          + 새 슬라이드
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">순서</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">이미지</th>
              <th className="px-4 py-3">노출</th>
              <th className="px-4 py-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">등록된 슬라이드가 없습니다.</td></tr>
            )}
            {items.map((s) => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{s.display_order}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{s.title}</p>
                  {s.subtitle && <p className="text-xs text-gray-500">{s.subtitle}</p>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 truncate max-w-xs">{s.image_url}</td>
                <td className="px-4 py-3">
                  <form action={async () => { "use server"; await toggleSlideActive(s.id, !s.is_active); }}>
                    <button type="submit" className={`rounded-full px-2 py-1 text-xs font-bold ${s.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                      {s.is_active ? "ON" : "OFF"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/carousel/${s.id}`} className="rounded border border-gray-300 px-2 py-1 text-xs hover:border-[#FF6B00] hover:text-[#FF6B00]">편집</Link>
                    <form action={async () => { "use server"; await deleteSlide(s.id); }}>
                      <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">삭제</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
