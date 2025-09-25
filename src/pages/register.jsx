import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from './navbar'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    try {
      const users = JSON.parse(localStorage.getItem('travya_users') || '[]')
      if (users.some((u) => u.email === email)) {
        setError('Email already registered')
        return
      }
      const user = { name, email, password }
      localStorage.setItem('travya_users', JSON.stringify([...users, user]))
      localStorage.setItem('travya_current_user', JSON.stringify({ name, email }))
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
        <h1 className="text-2xl font-bold">Create account</h1>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm text-gray-600">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2" required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2" required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2" required />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-white">Create account</button>
          <div className="text-sm text-gray-600">
            Already have an account? <Link to="/login" className="underline">Sign in</Link>
          </div>
        </form>
      </div>
    </main>
  )
}


