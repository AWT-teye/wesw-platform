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
    <div className={darkMode ? 'bg-gray-950 text-gray-100 min-h-screen' : 'bg-gray-100 text-gray-900 min-h-screen'}>

      {/* 상단 헤더 */}
      <header className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-2`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* 좌측 로고 */}
          <div className="flex-shrink-0">
            <Link href="/">
              <p className="text-lg font-bold text-orange-400">우리는 수원입니다.</p>
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

      {/* 메인 컨텐츠 3단 레이아웃 */}
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-12 gap-4">

        {/* 좌측: 정취 正聚 */}
        <aside className="col-span-12 md:col-span-3">
          <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-orange-400">📢 정취 正聚</h2>
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
              <div key={i} className={`${post.bg} rounded-lg p-3 cursor-pointer hover:opacity-90 relative`}>
                <p className="text-xs font-bold text-white mb-1">{post.rank}</p>
                <p className="text-sm text-white font-semibold leading-snug line-clamp-3">{post.title}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-orange-300">🔥 {post.likes}</span>
                  <span className="text-xs text-gray-300">{post.author}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 사통팔달 */}
          <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-orange-400">📡 사통팔달 四通八達</h2>
              <div className="flex gap-2">
                <button className="text-xs bg-orange-500 text-white px-2 py-1 rounded">전체</button>
                <button className="text-xs text-gray-400 hover:text-orange-400 px-2 py-1 rounded">인기</button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {SATONG.map((post, i) => (
                <div key={i} className={`${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} rounded p-2 cursor-pointer transition`}>
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
          <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
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
          <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-orange-400">활발한 게시판</h2>
            </div>
            <div className="flex flex-col gap-1">
              {BOARDS.map((board, i) => (
                <Link key={board.slug} href={`/board/${board.slug}`}
                  className={`flex items-center justify-between py-1 px-2 rounded text-sm hover:text-orange-400 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition`}>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-4">{i + 1}</span>
                    <span>{board.name}</span>
                  </div>
                  {board.dot && <span className="w-2 h-2 bg-orange-500 rounded-full"></span>}
                </Link>
              ))}
            </div>
            <div className="mt-3 text-center">
              <Link href="/boards" className="text-xs text-gray-400 hover:text-orange-400">전체 게시판 리스트 보기</Link>
            </div>
          </div>
        </aside>
      </div>

      {/* 푸터 */}
      <footer className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-t mt-8 py-4 text-center text-xs text-gray-500`}>
        © 2026 WE SUWON · 우리는 수원입니다 · 개혁신당 수원시당 시민 플랫폼
      </footer>
    </div>
  )
}