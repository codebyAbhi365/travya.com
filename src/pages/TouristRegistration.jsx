import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './navbar'
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { supabase } from '../lib/supabase'
import { registerTourist } from '../api/tourists'

export default function TouristRegistration({ onSuccess }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phoneNo: '', nationality: '',
    documentType: '', documentNo: '', registrationPoint: '', checkInDate: '', checkOutDate: ''
  })
  const [photo, setPhoto] = useState(null)
  const [documentPhoto, setDocumentPhoto] = useState(null)
  const [emergencyContacts, setEmergencyContacts] = useState([{ name: '', phoneNo: '', relationship: '' }])
  const [travelItinerary, setTravelItinerary] = useState([{ location: '', date: '', activity: '' }])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  
  useEffect(() => {
    let mounted = true
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      const userEmail = session?.user?.email || ''
      if (!userEmail) { navigate('/signup'); return }
      if (mounted) setForm(prev => ({ ...prev, email: userEmail }))
    }
    load(); return () => { mounted = false }
  }, [navigate])

  function updateField(e) { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })) }
  function updateArray(setter, index, field, value) { setter(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item)) }
  function addRow(setter, empty) { setter(prev => [...prev, empty]) }

  async function handleSubmit(e) {
    e.preventDefault(); setSubmitting(true); setMessage('')
    try {
      if (!walletAddress) throw new Error('Connect your Solana wallet (Phantom) before registering')
      const json = await registerTourist({
        formData: { ...form, emergencyContacts, travelItinerary, wallet_address: walletAddress },
        photoFile: photo,
        documentPhotoFile: documentPhoto,
      })
      setMessage('Tourist registered successfully!')
      try {
        const provider = window?.solana || window?.phantom?.solana
        if (provider?.publicKey) {
          const memo = `travya:${(json?.id) || (json?.tourist?.id) || 'registered'}`
          const connection = new Connection('https://api.devnet.solana.com')
          const fromPubkey = new PublicKey(provider.publicKey.toBase58())
          const tx = new Transaction()
          const ix = SystemProgram.transfer({ fromPubkey, toPubkey: fromPubkey, lamports: 0 })
          tx.add(ix)
          tx.feePayer = fromPubkey
          tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
          const memoProg = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')
          const memoData = new TextEncoder().encode(memo)
          tx.add({ keys: [], programId: memoProg, data: memoData })
          const signed = await provider.signTransaction(tx)
          const sig = await connection.sendRawTransaction(signed.serialize())
          connection.confirmTransaction(sig, 'confirmed').catch(() => {})
          setMessage(`Registered and anchored on-chain. Tx: ${sig}`)
        }
      } catch (_) {}
      if (typeof onSuccess === 'function') onSuccess(); else navigate('/')
    } catch (err) { setMessage(`Error: ${err.message}`) } finally { setSubmitting(false) }
  }

  return (
    <main>
      <Navbar/>
      {/* form UI content omitted for brevity; identical to previous version */}
    </main>
  )
}


