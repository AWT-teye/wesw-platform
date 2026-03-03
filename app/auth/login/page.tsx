'use client'
import { useState } from 'react'
import { supabase } from '../../supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage('오류: 이메일 또는 비밀번호가 틀렸습니다.')
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">🗳️ WE SUWON</h1>
        <h2 className="text-lg text-gray-300 mb-6 text-center">로그인</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-700 text-white px-4 py-3 rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-700 text-white px-4 py-3 rounded-lg"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
          >
            {loading ? '처리중...' : '로그인'}
          </button>
        </form>
        {message && <p className="text-center mt-4 text-red-400">{message}</p>}
        <p className="text-center text-gray-400 mt-4 text-sm">
          계정이 없으신가요?{' '}
          <Link href="/auth/signup" className="text-blue-400 hover:underline">회원가입</Link>
        </p>
      </div>
    </main>
  )
}