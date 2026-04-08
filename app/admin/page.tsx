import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold">관리자 대시보드</h1>
      <p className="mt-2 text-sm text-gray-600">
        좌측 메뉴에서 관리할 콘텐츠를 선택하세요.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Link
          href="/admin/announcements"
          className="block rounded-lg border border-gray-200 bg-white p-5 hover:border-[#FF6B00] hover:shadow-md"
        >
          <p className="text-xs font-bold text-[#FF6B00]">콘텐츠</p>
          <h2 className="mt-1 text-lg font-extrabold">한마디 (announcements)</h2>
          <p className="mt-2 text-sm text-gray-600">
            메인페이지 한마디 카드 작성/수정/삭제
          </p>
        </Link>
      </div>
    </div>
  );
}
