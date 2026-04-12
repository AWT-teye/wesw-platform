'use client'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Link from 'next/link'

const BOARDS = [
  { name: '수원(거버넌스)', slug: 'suwon', dot: true },
  { name: '장안구', slug: 'jangan', dot: true },
  { name: '영통구', slug: 'yeongtong', dot: true },
  { name: '팔달구', slug: 'paldal', dot: false },
  { name: '권선구', slug: 'gwonseon', dot: false },
  { name: '용인(제조/생산)', slug: 'yongin', dot: false },
  { name: '평택(물류/항만)', slug: 'pyeongtaek', dot: false },
  { name: '화성(기술/실증)', slug: 'hwaseong', dot: false },
  { name: '안산(소부장)', slug: 'ansan', dot: false },
  { name: '안성(식량/비축)', slug: 'anseong', dot: false },
  { name: '이천(수자원)', slug: 'icheon', dot: false },
  { name: '사법', slug: 'judicial', dot: false },
  { name: '행정', slug: 'admin', dot: false },
  { name: '입법', slug: 'legislative', dot: false },
  { name: '국방', slug: 'defense', dot: false },
  { name: '과학', slug: 'science', dot: false },
  { name: '기업', slug: 'business', dot: false },
  { name: '금융', slug: 'finance', dot: false },
  { name: '노동', slug: 'labor', dot: false },
  { name: '인공지능/로봇', slug: 'ai', dot: false },
  { name: '해학', slug: 'humor', dot: false },
]

const TOP3 = [
  { rank: 'TOP 1', title: '수원 하이퍼넥서스 통합 기금 1조 원 조성 선포', likes: 842, author: '박서스설계자', bg: 'bg-orange-600' },
  { rank: 'TOP 2', title: '안성 스마트팜 단지, 하이퍼넥서스 식량 자립률 40% 달성', likes: 721, author: '안성지킴이', bg: 'bg-gray-700' },
  { rank: 'TOP 3', title: '이천 SMR 도입 및 공업용수 통합 관리 시스템 구축 제안', likes: 689, author: '에너지마스터', bg: 'bg-gray-700' },
]

const JEONGTUI = [
  { category: '오늘의 수원시장', title: '수원시장: 하이퍼넥서스 통합 기금 1조 원 조성 선포' },
  { category: '수원시의회 활동', title: '수원시의회: 반도체 고속도로 건설 지원 특별위원회 구성' },
  { category: '경기도 도의회 소식', title: '경기도의원: 경기 남부권역 통합 조례안 발의 준비 완료' },
  { category: '최근 조례 개정안', title: '24건 관련 뉴스 브리핑: 156건' },
]

const SATONG = [
  { district: '영통구', title: '영통구 신규 데이터센터 유치에 대한 주민 토론', time: '10분 전', likes: 120, color: 'bg-blue-600' },
  { district: '용인', title: '용인 반도체 클러스터 배후 단지 교통난 해소 대책', time: '25분 전', likes: 98, color: 'bg-purple-600' },
  { district: '팔달구', title: '팔달구 전통시장 현대화 사업과 관광 루트 연계', time: '40분 전', likes: 85, color: 'bg-green-600' },
  { district: '안산', title: '안산 소부장 단지 내 로봇 자동화 라인 시범 도입', time: '1시간 전', likes: 77, color: 'bg-yellow-600' },
  { district: '장안구', title: '장안구 노후 주거지 재개발 추진 현황', time: '1시간 전', likes: 65, color: 'bg-red-600' },
]

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setLoginError('아이디 또는 비밀번호 오류')
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className={darkMode ? 'bg-[#0a0a0a] text-gray-100 min-h-screen' : 'bg-white text-gray-900 min-h-screen'}>

      {/* 상단 헤더 */}
      <header className={`${darkMode ? 'bg-gray-900/80 backdrop-blur border-gray-800' : 'bg-white/80 backdrop-blur border-gray-200'} border-b px-4 py-2 sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* 좌측 로고 */}
          <div className="flex-shrink-0">
            <Link href="/">
              <p className="text-lg font-bold text-orange-500">우리는 수원입니다.</p>
              <p className="text-xs text-gray-400">우리는 가능성을 발굴하고 행복을 추구합니다.</p>
            </Link>
          </div>

          {/* 우측 로그인 영역 */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-orange-400">{user.user_metadata?.full_name || user.email}</span>
                <span className="text-xs bg-orange-600 px-2 py-1 rounded text-white">폴코드 준비중</span>
                <button onClick={handleLogout} className="text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">로그아웃</button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="아이디"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`text-sm px-2 py-1 rounded w-32 ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-200 text-gray-900'} border`}
                />
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`text-sm px-2 py-1 rounded w-28 ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-200 text-gray-900'} border`}
                />
                <button type="submit" className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded font-bold">
                  {loading ? '...' : '로그인'}
                </button>
                <span className="text-gray-500 text-xs">|</span>
                <Link href="/auth/signup" className="text-xs text-gray-400 hover:text-orange-400">회원가입</Link>
                <span className="text-gray-500 text-xs">|</span>
                <Link href="/auth/forgot" className="text-xs text-gray-400 hover:text-orange-400">비번찾기</Link>
                <span className="text-gray-500 text-xs">|</span>
                <Link href="/auth/resend" className="text-xs text-gray-400 hover:text-orange-400">인증메일재발송</Link>
              </form>
            )}
            {loginError && <span className="text-red-400 text-xs">{loginError}</span>}
            {/* 다크모드 토글 */}
            <button onClick={() => setDarkMode(!darkMode)} className="ml-2 text-lg" title="다크모드 전환">
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-[#0a0a0a]">
        {/* 배경 장식 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-orange-600/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
          <p className="text-orange-500 text-sm font-semibold tracking-widest uppercase mb-4">WE SUWON</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            모든 가능성을,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">모두에게</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10">
            정희윤이 만드는 <span className="text-orange-400 font-semibold">수원 9.0</span>
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/we/pledge"
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-base transition-colors shadow-lg shadow-orange-500/25"
            >
              공약 보기
            </Link>
            <Link
              href="/we/supporters"
              className="px-8 py-3 border-2 border-orange-500 text-orange-400 hover:bg-orange-500/10 font-bold rounded-lg text-base transition-colors"
            >
              서포터즈 신청
            </Link>
          </div>
        </div>
      </section>

      {/* 수원 현황 숫자 카드 섹션 */}
      <section className={darkMode ? 'bg-gray-900/50 border-y border-gray-800' : 'bg-[#f8f8f8] border-y border-gray-200'}>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <p className={`text-center text-xs font-semibold tracking-widest uppercase mb-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            수원, 지금 이 순간
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 재정자립도 */}
            <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-5 text-center group hover:border-orange-500/50 transition-colors`}>
              <p className={`text-xs mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>재정자립도</p>
              <p className="text-3xl md:text-4xl font-extrabold text-orange-500 mb-1">38.17<span className="text-lg">%</span></p>
              <p className="text-xs text-red-400 font-medium">↓ 89%에서 하락</p>
            </div>
            {/* 합계출산율 */}
            <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-5 text-center group hover:border-orange-500/50 transition-colors`}>
              <p className={`text-xs mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>합계출산율</p>
              <p className="text-3xl md:text-4xl font-extrabold text-orange-500 mb-1">0.71<span className="text-lg">명</span></p>
              <p className="text-xs text-red-400 font-medium">위기 수준</p>
            </div>
            {/* 청년인구 */}
            <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-5 text-center group hover:border-orange-500/50 transition-colors`}>
              <p className={`text-xs mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>청년인구</p>
              <p className="text-2xl md:text-3xl font-extrabold text-orange-500 mb-1">순유출</p>
              <p className="text-xs text-red-400 font-medium">진행중</p>
            </div>
            {/* 사회복지예산 */}
            <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-5 text-center group hover:border-orange-500/50 transition-colors`}>
              <p className={`text-xs mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>사회복지예산 비중</p>
              <p className="text-3xl md:text-4xl font-extrabold text-orange-500 mb-1">42.3<span className="text-lg">%</span></p>
              <p className="text-xs text-red-400 font-medium">강제 부담 증가</p>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 3단 레이아웃 */}
      <section className={darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}>
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-4">

          {/* 좌측: 정취 正聚 */}
          <aside className="col-span-12 md:col-span-3">
            <div className={`${darkMode ? 'bg-gray-900 border-gray-800 hover:border-orange-500/60' : 'bg-white border-gray-200 shadow-sm hover:border-orange-400'} border rounded-xl p-4 transition-colors`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-orange-500">정취 正聚</h2>
                <Link href="/jeongtui" className="text-xs text-gray-400 hover:text-orange-400">더보기</Link>
              </div>
              <div className="flex flex-col gap-4">
                {JEONGTUI.map((item, i) => (
                  <div key={i}>
                    <p className="text-xs text-gray-400 mb-1">{item.category}</p>
                    <p className="text-sm hover:text-orange-400 cursor-pointer leading-snug">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* 중앙: TOP3 + 사통팔달 */}
          <main className="col-span-12 md:col-span-6 flex flex-col gap-4">

            {/* TOP 3 */}
            <div className="grid grid-cols-3 gap-2">
              {TOP3.map((post, i) => (
                <div key={i} className={`${post.bg} rounded-xl p-3 cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all relative`}>
                  <p className="text-xs font-bold text-white mb-1">{post.rank}</p>
                  <p className="text-sm text-white font-semibold leading-snug line-clamp-3">{post.title}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-orange-300">{post.likes}</span>
                    <span className="text-xs text-gray-300">{post.author}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 사통팔달 */}
            <div className={`${darkMode ? 'bg-gray-900 border-gray-800 hover:border-orange-500/60' : 'bg-white border-gray-200 shadow-sm hover:border-orange-400'} border rounded-xl p-4 transition-colors`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-orange-500">사통팔달 四通八達</h2>
                <div className="flex gap-2">
                  <button className="text-xs bg-orange-500 text-white px-2 py-1 rounded">전체</button>
                  <button className="text-xs text-gray-400 hover:text-orange-400 px-2 py-1 rounded">인기</button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {SATONG.map((post, i) => (
                  <div key={i} className={`${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} rounded-lg p-2 cursor-pointer transition`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs ${post.color} text-white px-2 py-0.5 rounded`}>{post.district}</span>
                      <span className="text-xs text-gray-400">{post.time}</span>
                      <span className="text-xs text-orange-400">추천 {post.likes}</span>
                    </div>
                    <p className="text-sm hover:text-orange-400">{post.title}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/board" className="text-sm text-gray-400 hover:text-orange-400">전체 게시판 보기 →</Link>
              </div>
            </div>
          </main>

          {/* 우측: 유저정보 + 게시판 목록 */}
          <aside className="col-span-12 md:col-span-3 flex flex-col gap-4">

            {/* 유저 정보 */}
            <div className={`${darkMode ? 'bg-gray-900 border-gray-800 hover:border-orange-500/60' : 'bg-white border-gray-200 shadow-sm hover:border-orange-400'} border rounded-xl p-4 transition-colors`}>
              {user ? (
                <div>
                  <p className="text-sm font-bold text-orange-400 mb-1">{user.user_metadata?.full_name || user.email}</p>
                  <p className="text-xs text-gray-400 mb-2">폴코드: <span className="text-orange-400">설정 필요</span></p>
                  <p className="text-xs text-gray-400">최신 의견을 등록해보세요</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">로그인하여</p>
                  <p className="text-sm text-orange-400 font-bold mb-3">[폴-코드] 뱃지를 확인하세요!</p>
                  <Link href="/auth/login" className="text-xs bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600">로그인하기</Link>
                </div>
              )}
            </div>

            {/* 활발한 게시판 */}
            <div className={`${darkMode ? 'bg-gray-900 border-gray-800 hover:border-orange-500/60' : 'bg-white border-gray-200 shadow-sm hover:border-orange-400'} border rounded-xl p-4 transition-colors`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-orange-500">활발한 게시판</h2>
              </div>
              <div className="flex flex-col gap-0.5">
                {BOARDS.map((board, i) => (
                  <Link key={board.slug} href={`/board/${board.slug}`}
                    className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-sm hover:text-orange-400 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-orange-50'} transition-all group`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs w-5 text-center rounded ${i < 3 ? 'bg-orange-500 text-white font-bold' : 'text-gray-500'}`}>{i + 1}</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">{board.name}</span>
                    </div>
                    {board.dot && <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>}
                  </Link>
                ))}
              </div>
              <div className="mt-3 text-center">
                <Link href="/boards" className="text-xs text-gray-400 hover:text-orange-400">전체 게시판 리스트 보기</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 푸터 */}
      <footer className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-[#f8f8f8] border-gray-200'} border-t py-6 text-center text-xs text-gray-500`}>
        © 2026 WE SUWON · 우리는 수원입니다 · 개혁신당 수원시당 시민 플랫폼
      </footer>
    </div>
  )
}