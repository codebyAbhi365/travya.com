import React from 'react'
import Navbar from './navbar'

export default function About() {
  return (
    <main>
      <Navbar/>
      <div className="pt-24" />
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-bold">About Travya</h1>
        <p className="mt-4 text-gray-700">Travya is a tourist safety companion that offers real‑time alerts, safe routes, verified stays and a digital tourist ID. This is a frontend‑only demo with local data storage.</p>
      </div>
    </main>
  )
}


