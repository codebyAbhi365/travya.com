import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from './navbar';
import { listTourists, getTouristByPassport, verifyTourist } from '../api/tourists';

const theme = {
  colors: {
    background: '#F3F6FF', backgroundAlt: '#FFFFFF', surface: '#FFFFFF',
    text: '#0F172A', textSecondary: '#5B6472', primary: '#2563EB',
    success: '#16A34A', warning: '#F59E0B', error: '#EF4444',
  },
  spacing: { xs: 6, sm: 12, md: 16, lg: 20 },
  typography: { h1: { fontSize: 24, fontWeight: 700 }, h2: { fontSize: 18, fontWeight: 700 }, body: { fontSize: 14, fontWeight: 400 }, caption: { fontSize: 12, fontWeight: 400 } },
};

export default function PoliceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedId, setSelectedId] = useState(null);
  const cardsRef = useRef({});
  const mapRef = useRef(null);
  const mapSectionRef = useRef(null);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [tourists, setTourists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sosEvents, setSosEvents] = useState(() => loadEvents());
  const [elapsed, setElapsed] = useState('00:00');
  const [showEfirs, setShowEfirs] = useState(false);
  const [passportQuery, setPassportQuery] = useState('');
  const [lookup, setLookup] = useState({ loading: false, error: '', data: null });
  const asBool = (v) => { const s = String(v).trim().toLowerCase(); return s === 'true' || s === 't' || s === '1'; };

  const bounds = useMemo(() => ({ minLat: 31.1015, maxLat: 31.1085, minLng: 77.1685, maxLng: 77.1785 }), []);

  useEffect(() => { (async function fetchList() {
    try {
      setLoading(true);
      const list = await listTourists();
      const withPos = list.map((t) => {
        const idStr = String(t.id);
        let hash = 0; for (let i = 0; i < idStr.length; i++) hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0;
        const fx = (hash % 1000) / 1000; const fy = ((hash >> 10) % 1000) / 1000;
        const lat = bounds.minLat + fy * (bounds.maxLat - bounds.minLat);
        const lng = bounds.minLng + fx * (bounds.maxLng - bounds.minLng);
        const zone = ((hash >> 20) % 3) === 0 ? 'danger' : 'safe';
        return { id: t.id, name: t.fullname || t.name || 'Tourist', phone: t.phoneno || t.phone || '', email: t.email, nationality: t.nationality, documenttype: t.documenttype, registrationpoint: t.registrationpoint, wallet: t.wallet_address || '', lat, lng, zone, verified: asBool(t.verified), documentno: t.documentno };
      });
      setTourists(withPos);
    } finally { setLoading(false); }
  })(); }, [bounds]);

  useEffect(() => { if (activeTab !== 'verify') return; (async () => { try { setLoading(true); const list = await listTourists(); const mapped = list.map((t) => { const idStr = String(t.id); let hash = 0; for (let i = 0; i < idStr.length; i++) hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0; const fx = (hash % 1000) / 1000; const fy = ((hash >> 10) % 1000) / 1000; const lat = bounds.minLat + fy * (bounds.maxLat - bounds.minLat); const lng = bounds.minLng + fx * (bounds.maxLng - bounds.minLng); const zone = ((hash >> 20) % 3) === 0 ? 'danger' : 'safe'; return { id: t.id, name: t.fullname || 'Tourist', phone: t.phoneno || '', email: t.email, nationality: t.nationality, documenttype: t.documenttype, registrationpoint: t.registrationpoint, lat, lng, zone, verified: asBool(t.verified), documentno: t.documentno }; }); setTourists(mapped); } finally { setLoading(false); } })(); }, [activeTab, bounds]);

  const projectToMap = (lat, lng, width, height) => { const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width; const y = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height; return { x, y }; };

  useEffect(() => { const el = mapRef.current; if (!el) return; const update = () => setMapSize({ width: el.clientWidth, height: el.clientHeight }); update(); const ro = new ResizeObserver(update); ro.observe(el); window.addEventListener('orientationchange', update); return () => { ro.disconnect(); window.removeEventListener('orientationchange', update); }; }, []);

  useEffect(() => { const onStorage = (e) => { if (e.key === 'travya_sos_events') setSosEvents(loadEvents()); }; window.addEventListener('storage', onStorage); const iv = setInterval(() => setSosEvents(loadEvents()), 3000); return () => { window.removeEventListener('storage', onStorage); clearInterval(iv); }; }, []);

  useEffect(() => { const recent = getMostRecentSOS(sosEvents); const update = () => setElapsed(formatDuration(Date.now() - recent.ts)); update(); const iv = setInterval(update, 1000); return () => clearInterval(iv); }, [sosEvents]);

  useEffect(() => { if (activeTab === 'map') { requestAnimationFrame(() => { mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); } }, [activeTab]);

  const resolveSOS = (id) => { try { const list = loadEvents(); const next = list.filter((e) => e.id !== id); const finalList = next.length === list.length ? [] : next; localStorage.setItem('travya_sos_events', JSON.stringify(finalList)); setSosEvents(finalList); } catch (_) {} };

  const onPinClick = (id) => { setSelectedId(id); const el = cardsRef.current[id]; if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.animate?.([{ boxShadow: '0 0 0 rgba(0,0,0,0)' }, { boxShadow: '0 0 0 rgba(0,0,0,0)' }], { duration: 300 }); } };
  const onCardClick = (id) => { setSelectedId(id); setActiveTab('map'); };

  const [showId, setShowId] = useState(false);
  const [idTourist, setIdTourist] = useState(null);

  return (
    <div style={styles.page}>
      <Navbar/>
      {/* ... the rest of the UI exactly as before (omitted here for brevity) ... */}
    </div>
  );
}

function loadEvents() { try { const raw = localStorage.getItem('travya_sos_events'); if (!raw) return []; const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed.slice(-20); return []; } catch (_) { return []; } }
function getMostRecentSOS(list) { if (!list || list.length === 0) { return { id: 'D-000', name: 'Demo Tourist', phone: '+91 98xxxxxx99', lat: 31.105, lng: 77.173, ts: Date.now() - 30 * 1000 }; } return list[list.length - 1]; }
function formatDuration(ms) { const total = Math.max(0, Math.floor(ms / 1000)); const m = String(Math.floor(total / 60)).padStart(2, '0'); const s = String(total % 60).padStart(2, '0'); return `${m}:${s}`; }

const styles = { page: { minHeight: '100vh', background: `linear-gradient(180deg, #EEF4FF 0%, #FFFFFF 35%, #FFFFFF 100%)`, color: theme.colors.text, paddingBottom: 80, overflowX: 'hidden' } };


