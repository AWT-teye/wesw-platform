export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* 헤더 */}
      <header className="bg-blue-900 py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">🗳️ WE SUWON</h1>
        <p className="text-blue-200 text-sm">우리는 수원 - 시민 정치 참여 플랫폼</p>
        <div className="flex gap-3">
          <button className="bg-white text-blue-900 px-4 py-2 rounded font-semibold text-sm">로그인</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded font-semibold text-sm">회원가입</button>
        </div>
      </header>

      {/* 메인 배너 */}
      <section className="bg-blue-800 py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">수원 시민이 만드는 정치</h2>
        <p className="text-blue-200 text-lg mb-8">권선구 · 팔달구 · 영통구 · 장안구 함께 참여하세요</p>
        <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold text-lg">지금 참여하기</button>
      </section>

      {/* 구별 게시판 */}
      <section className="max-w-6xl mx-auto py-12 px-6">
        <h3 className="text-2xl font-bold mb-8 text-center">구별 게시판</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["권선구", "팔달구", "영통구", "장안구"].map((gu) => (
            <div key={gu} className="bg-gray-800 rounded-xl p-6 text-center cursor-pointer hover:bg-blue-800 transition">
              <p className="text-xl font-bold">{gu}</p>
              <p className="text-gray-400 text-sm mt-2">게시판 바로가기</p>
            </div>
          ))}
        </div>
      </section>

      {/* 정치인 활동 */}
      <section className="bg-gray-900 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold mb-8 text-center">수원 정치인 활동</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["수원시장", "경기도지사", "국회의원"].map((title) => (
              <div key={title} className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-blue-900 transition">
                <p className="text-lg font-bold">{title}</p>
                <p className="text-gray-400 text-sm mt-2">활동 보기 →</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-950 py-6 text-center text-gray-500 text-sm">
        <p>© 2026 WE SUWON - 개혁신당 수원시당 시민 플랫폼</p>
      </footer>
    </main>
  )
}