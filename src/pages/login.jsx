import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from './navbar'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    try {
      const users = JSON.parse(localStorage.getItem('travya_users') || '[]')
      const user = users.find((u) => u.email === email)
      if (!user) {
        setError('No account found. Please register.')
        return
      }
      if (user.password !== password) {
        setError('Invalid credentials')
        return
      }
      localStorage.setItem('travya_current_user', JSON.stringify({ name: user.name, email: user.email }))
      navigate('/apphome')
    } catch (_) {
      setError('Something went wrong')
    }
  }

  return (
    <main>
      <Navbar/>
      <div className="pt-24" />
      <div className="mx-auto max-w-md px-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2" required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2" required />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-white">Sign in</button>
          <div className="text-sm text-gray-600">
            New here? <Link to="/register" className="underline">Create an account</Link>
          </div>
        </form>
      </div>
    </main>
  )
}


