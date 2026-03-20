'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const NICHES = [
  { value: 'odonto',  label: '🦷 Odonto',         color: '#60C0FF' },
  { value: 'dedet',   label: '🐜 Dedetização',     color: '#80E840' },
  { value: 'autoele', label: '⚡ Auto Elétrica',    color: '#FFA830' },
  { value: 'som',     label: '🔊 Som Automotivo',   color: '#E060FF' },
  { value: 'armar',   label: '🧵 Armarinhos',       color: '#FF7060' },
  { value: 'clinmed', label: '🩺 Clínica Médica',   color: '#40D8C0' },
  { value: 'jard',    label: '🌿 Jardinagem',       color: '#80E860' },
  { value: 'mec',     label: '🔧 Mecânica',         color: '#FFD040' },
  { value: 'outros',  label: '📋 Outros',           color: '#A0A0B0' },
]

const COLUMN_COLORS = ['#4A4A5A','#5AB8E8','#F0A830','#A070E8','#40C870','#E85050','#C8F55A','#FF7060','#40D8C0']

function getNiche(v) { return NICHES.find(n => n.value === v) || NICHES[NICHES.length - 1] }

function whatsAppLink(phone) {
  if (!phone || phone.toLowerCase().includes('verificar') || phone.toLowerCase().includes('consultar')) return null
  const d = phone.replace(/\D/g, '')
  if (d.length < 8) return null
  return `https://wa.me/${d.startsWith('55') ? d : '55' + d}`
}

function formatDate(ds) {
  if (!ds) return null
  const [y, m, day] = ds.split('-')
  return `${day}/${m}/${y}`
}

const EMPTY_FORM = {
  name: '', niche: 'outros', phone: '', address: '',
  stars: '', reviews: '', pitch: '', details: '', followup_date: '', column_id: ''
}

export default function KanbanPage() {
  const [columns, setColumns] = useState([])
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showAddCol, setShowAddCol] = useState(false)
  const [newColName, setNewColName] = useState('')
  const [newColColor, setNewColColor] = useState(COLUMN_COLORS[0])

  const [showProspectModal, setShowProspectModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [showPitch, setShowPitch] = useState({})
  const [searchQ, setSearchQ] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: cols, error: e1 }, { data: pros, error: e2 }] = await Promise.all([
      supabase.from('columns').select('*').order('position'),
      supabase.from('prospects').select('*').order('created_at', { ascending: false })
    ])
    if (e1 || e2) { setError('Erro ao carregar dados. Verifique as variáveis de ambiente.'); setLoading(false); return }
    setColumns(cols || [])
    setProspects(pros || [])
    setLoading(false)
  }

  async function addColumn() {
    if (!newColName.trim()) return
    const { data, error } = await supabase
      .from('columns').insert({ name: newColName.trim(), color: newColColor, position: columns.length })
      .select().single()
    if (!error) { setColumns(p => [...p, data]); setNewColName(''); setNewColColor(COLUMN_COLORS[0]); setShowAddCol(false) }
  }

  async function deleteColumn(id) {
    if (!confirm('Deletar coluna? Os prospects dessa coluna ficarão sem coluna.')) return
    await supabase.from('prospects').update({ column_id: null }).eq('column_id', id)
    await supabase.from('columns').delete().eq('id', id)
    setColumns(p => p.filter(c => c.id !== id))
    setProspects(p => p.map(x => x.column_id === id ? { ...x, column_id: null } : x))
  }

  function openAdd(colId) {
    setForm({ ...EMPTY_FORM, column_id: colId || columns[0]?.id || '' })
    setEditingId(null)
    setShowProspectModal(true)
  }

  function openEdit(prospect) {
    setForm({
      name: prospect.name || '',
      niche: prospect.niche || 'outros',
      phone: prospect.phone || '',
      address: prospect.address || '',
      stars: prospect.stars != null ? String(prospect.stars) : '',
      reviews: prospect.reviews != null ? String(prospect.reviews) : '',
      pitch: prospect.pitch || '',
      details: prospect.details || '',
      followup_date: prospect.followup_date || '',
      column_id: prospect.column_id || ''
    })
    setEditingId(prospect.id)
    setShowProspectModal(true)
  }

  async function saveProspect() {
    if (!form.name.trim()) return
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      niche: form.niche,
      phone: form.phone.trim(),
      address: form.address.trim(),
      stars: form.stars !== '' ? parseFloat(form.stars) : null,
      reviews: form.reviews !== '' ? parseInt(form.reviews) : 0,
      pitch: form.pitch.trim(),
      details: form.details.trim(),
      followup_date: form.followup_date || null,
      column_id: form.column_id || null,
      updated_at: new Date().toISOString()
    }
    if (editingId) {
      const { data, error } = await supabase.from('prospects').update(payload).eq('id', editingId).select().single()
      if (!error) setProspects(p => p.map(x => x.id === editingId ? data : x))
    } else {
      const { data, error } = await supabase.from('prospects').insert(payload).select().single()
      if (!error) setProspects(p => [data, ...p])
    }
    setSaving(false)
    setShowProspectModal(false)
  }

  async function moveProspect(pid, colId) {
    await supabase.from('prospects').update({ column_id: colId, updated_at: new Date().toISOString() }).eq('id', pid)
    setProspects(p => p.map(x => x.id === pid ? { ...x, column_id: colId } : x))
  }

  async function deleteProspect(id) {
    if (!confirm('Deletar este prospect?')) return
    await supabase.from('prospects').delete().eq('id', id)
    setProspects(p => p.filter(x => x.id !== id))
  }

  function setF(k, v) { setForm(p => ({ ...p, [k]: v })) }

  const filtered = searchQ
    ? prospects.filter(p => p.name?.toLowerCase().includes(searchQ.toLowerCase()) || p.phone?.includes(searchQ) || p.niche?.includes(searchQ))
    : prospects

  if (loading) return (
    <>
      <Nav />
      <div className="loading">⏳ Carregando dados...</div>
    </>
  )

  if (error) return (
    <>
      <Nav />
      <div className="loading" style={{ flexDirection: 'column', gap: 8, color: '#E85050' }}>
        <span>❌ {error}</span>
        <button className="btn btn-ghost btn-sm" onClick={loadData}>Tentar novamente</button>
      </div>
    </>
  )

  return (
    <>
      <Nav extra={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            className="inp" placeholder="🔍 Buscar prospect..."
            style={{ width: 200, padding: '5px 12px', fontSize: 12 }}
            value={searchQ} onChange={e => setSearchQ(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => openAdd(null)}>+ Prospect</button>
        </div>
      } />

      <div className="board">
        {columns.map(col => {
          const colProspects = filtered.filter(p => p.column_id === col.id)
          return (
            <div className="column" key={col.id}>
              <div className="col-header">
                <div className="col-dot" style={{ background: col.color }} />
                <span className="col-name">{col.name}</span>
                <span className="col-count">{colProspects.length}</span>
                <button className="col-del" title="Deletar coluna" onClick={() => deleteColumn(col.id)}>✕</button>
              </div>
              <div className="col-body">
                {colProspects.map(p => (
                  <ProspectCard
                    key={p.id}
                    prospect={p}
                    columns={columns}
                    showPitch={!!showPitch[p.id]}
                    onTogglePitch={() => setShowPitch(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                    onEdit={() => openEdit(p)}
                    onDelete={() => deleteProspect(p.id)}
                    onMove={colId => moveProspect(p.id, colId)}
                  />
                ))}
                <button className="col-add" onClick={() => openAdd(col.id)}>+ Adicionar prospect</button>
              </div>
            </div>
          )
        })}

        {/* Unassigned prospects */}
        {filtered.filter(p => !p.column_id).length > 0 && (
          <div className="column">
            <div className="col-header">
              <div className="col-dot" style={{ background: '#4A4A5A' }} />
              <span className="col-name">Sem coluna</span>
              <span className="col-count">{filtered.filter(p => !p.column_id).length}</span>
            </div>
            <div className="col-body">
              {filtered.filter(p => !p.column_id).map(p => (
                <ProspectCard
                  key={p.id}
                  prospect={p}
                  columns={columns}
                  showPitch={!!showPitch[p.id]}
                  onTogglePitch={() => setShowPitch(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                  onEdit={() => openEdit(p)}
                  onDelete={() => deleteProspect(p.id)}
                  onMove={colId => moveProspect(p.id, colId)}
                />
              ))}
            </div>
          </div>
        )}

        <button className="add-column-btn" onClick={() => setShowAddCol(true)}>
          <span style={{ fontSize: 18 }}>+</span> Nova Coluna
        </button>
      </div>

      {/* ADD COLUMN MODAL */}
      {showAddCol && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowAddCol(false)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-title">Nova Coluna</div>
            <div className="field">
              <label className="label">Nome da coluna</label>
              <input className="inp" placeholder="Ex: Aguardando Retorno" value={newColName}
                onChange={e => setNewColName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addColumn()} autoFocus />
            </div>
            <div className="field">
              <label className="label">Cor</label>
              <div className="color-options">
                {COLUMN_COLORS.map(c => (
                  <div key={c} className={`color-opt${newColColor === c ? ' selected' : ''}`}
                    style={{ background: c }} onClick={() => setNewColColor(c)} />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAddCol(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={addColumn}>Criar coluna</button>
            </div>
          </div>
        </div>
      )}

      {/* PROSPECT MODAL */}
      {showProspectModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowProspectModal(false)}>
          <div className="modal">
            <div className="modal-title">{editingId ? 'Editar Prospect' : 'Novo Prospect'}</div>

            <div className="field">
              <label className="label">Nome da empresa *</label>
              <input className="inp" placeholder="Nome da empresa" value={form.name} onChange={e => setF('name', e.target.value)} autoFocus />
            </div>

            <div className="form-row">
              <div className="field">
                <label className="label">Nicho</label>
                <select className="inp" value={form.niche} onChange={e => setF('niche', e.target.value)}>
                  {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Coluna (fase)</label>
                <select className="inp" value={form.column_id} onChange={e => setF('column_id', e.target.value)}>
                  <option value="">Sem coluna</option>
                  {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="field">
              <label className="label">Telefone / WhatsApp</label>
              <input className="inp" placeholder="(41) 99999-9999" value={form.phone} onChange={e => setF('phone', e.target.value)} />
            </div>

            <div className="field">
              <label className="label">Endereço</label>
              <input className="inp" placeholder="Rua, número — Bairro" value={form.address} onChange={e => setF('address', e.target.value)} />
            </div>

            <div className="form-row">
              <div className="field">
                <label className="label">Nota (estrelas)</label>
                <input className="inp" type="number" step="0.1" min="0" max="5" placeholder="4.8" value={form.stars} onChange={e => setF('stars', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Nº de avaliações</label>
                <input className="inp" type="number" placeholder="172" value={form.reviews} onChange={e => setF('reviews', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Follow-up</label>
                <input className="inp" type="date" value={form.followup_date} onChange={e => setF('followup_date', e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label className="label">Pitch personalizado</label>
              <textarea className="inp" placeholder="Argumento de venda personalizado para este prospect..." value={form.pitch} onChange={e => setF('pitch', e.target.value)} style={{ minHeight: 90 }} />
            </div>

            <div className="field">
              <label className="label">Detalhes do contato (preencher ao ligar)</label>
              <textarea className="inp" placeholder="O que foi conversado, quem atendeu, próximos passos..." value={form.details} onChange={e => setF('details', e.target.value)} style={{ minHeight: 90, borderColor: '#1A3A4A' }} />
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowProspectModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveProspect} disabled={saving}>
                {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Adicionar prospect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── NAV COMPONENT ───────────────────────────────────────────────────────────
function Nav({ extra }) {
  const path = usePathname()
  return (
    <nav className="nav">
      <div className="nav-brand">
        <span className="nav-logo">c3x</span>
        <span className="nav-title">CRM Prospecção</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/" className={`nav-link${path === '/' ? ' active' : ''}`}>◫ Kanban</Link>
        <Link href="/dashboard" className={`nav-link${path === '/dashboard' ? ' active' : ''}`}>📊 Dashboard</Link>
        {extra}
      </div>
    </nav>
  )
}

// ─── PROSPECT CARD ────────────────────────────────────────────────────────────
function ProspectCard({ prospect: p, columns, showPitch, onTogglePitch, onEdit, onDelete, onMove }) {
  const niche = getNiche(p.niche)
  const wa = whatsAppLink(p.phone)
  const today = new Date().toISOString().split('T')[0]
  const overdue = p.followup_date && p.followup_date < today
  const dueToday = p.followup_date === today

  return (
    <div className="card">
      <div className="card-top">
        <div className="card-name">{p.name}</div>
        <div className="card-meta">
          <span className="niche-tag" style={{ color: niche.color, borderColor: niche.color + '44', background: niche.color + '11' }}>
            {niche.label}
          </span>
          {p.stars && (
            <span className="card-stars">
              <span className="card-star">★</span> {p.stars}
              {p.reviews > 0 && <span style={{ color: 'var(--dim)' }}> ({p.reviews.toLocaleString('pt-BR')})</span>}
            </span>
          )}
        </div>
        {p.address && <div className="card-addr">📍 {p.address}</div>}
        {p.phone && <div className="card-phone">📞 {p.phone}</div>}
        {p.details && (
          <div className="card-details-preview" title={p.details}>📝 {p.details}</div>
        )}
        {p.followup_date && (
          <div className="card-followup" style={{ color: overdue ? '#E85050' : dueToday ? '#C8F55A' : '#F0A830' }}>
            {overdue ? '⚠️' : dueToday ? '🔔' : '📅'} Follow-up: {formatDate(p.followup_date)}
          </div>
        )}
        {p.pitch && (
          <>
            <button
              onClick={onTogglePitch}
              style={{ background: 'none', border: 'none', color: '#F0A830', fontSize: 11, cursor: 'pointer', marginTop: 6, padding: '2px 0', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              💬 {showPitch ? 'Fechar pitch' : 'Ver pitch'} {showPitch ? '▲' : '▼'}
            </button>
            {showPitch && (
              <div style={{ fontSize: 12, color: '#C8A870', fontStyle: 'italic', background: '#1A1500', border: '1px solid #3A2800', borderRadius: 6, padding: '8px 10px', marginTop: 4, lineHeight: 1.65 }}>
                {p.pitch}
              </div>
            )}
          </>
        )}
      </div>

      <div className="card-actions">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-green btn-sm">
            💬 WhatsApp
          </a>
        )}
        <button className="btn btn-ghost btn-sm" onClick={onEdit}>✏️ Editar</button>
        <button className="btn btn-danger btn-sm btn-icon" onClick={onDelete} title="Deletar">🗑</button>
        <select
          className="move-select"
          value={p.column_id || ''}
          onChange={e => onMove(e.target.value || null)}
          title="Mover para coluna"
        >
          <option value="">Sem coluna</option>
          {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
    </div>
  )
}
