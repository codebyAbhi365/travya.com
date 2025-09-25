import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/10 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold tracking-wide">
              Travya
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm hover:opacity-80 transition-opacity">Home</Link>
            <Link to="/about" className="text-sm hover:opacity-80 transition-opacity">About</Link>
            <Link to="/services" className="text-sm hover:opacity-80 transition-opacity">Services</Link>
            <Link to="/public" className="text-sm hover:opacity-80 transition-opacity">Public</Link>
            <Link to="/police" className="text-sm hover:opacity-80 transition-opacity">Police</Link>
            <Link to="/efirs" className="text-sm hover:opacity-80 transition-opacity">eFIRs</Link>
            <Link to="/login" className="text-sm hover:opacity-80 transition-opacity">Login</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
