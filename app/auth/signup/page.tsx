'use client'
import { useState } from 'react'
import { supabase } from '../../supabase'
import Link from 'next/link'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) {
      setMessage('오류: ' + error.message)
    } else {
      setMessage('✅ 가입 완료! 이메일을 확인해주세요.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">🗳️ WE SUWON</h1>
        <h2 className="text-lg text-gray-300 mb-6 text-center">회원가입</h2>
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-700 text-white px-4 py-3 rounded-lg"
            required
          />
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
            placeholder="비밀번호 (6자 이상)"
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
            {loading ? '처리중...' : '회원가입'}
          </button>
        </form>
        {message && <p className="text-center mt-4 text-green-400">{message}</p>}
        <p className="text-center text-gray-400 mt-4 text-sm">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:underline">로그인</Link>
        </p>
      </div>
    </main>
  )
}