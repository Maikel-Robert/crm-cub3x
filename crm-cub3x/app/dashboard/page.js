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

function formatDate(ds) {
  if (!ds) return ''
  const [y, m, d] = ds.split('-')
  return `${d}/${m}/${y}`
}

export default function DashboardPage() {
  const [columns, setColumns] = useState([])
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: cols }, { data: pros }] = await Promise.all([
        supabase.from('columns').select('*').order('position'),
        supabase.from('prospects').select('*').order('created_at', { ascending: false })
      ])
      setColumns(cols || [])
      setProspects(pros || [])
      setLoading(false)
    }
    load()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  const byColumn = columns.map(c => ({
    ...c,
    count: prospects.filter(p => p.column_id === c.id).length
  }))

  const byNiche = NICHES.map(n => ({
    ...n,
    count: prospects.filter(p => p.niche === n.value).length
  })).filter(n => n.count > 0).sort((a, b) => b.count - a.count)

  const followups = prospects
    .filter(p => p.followup_date && p.followup_date >= today && p.followup_date <= nextWeek)
    .sort((a, b) => a.followup_date.localeCompare(b.followup_date))

  const overdue = prospects
    .filter(p => p.followup_date && p.followup_date < today)
    .sort((a, b) => a.followup_date.localeCompare(b.followup_date))

  const withDetails = prospects.filter(p => p.details && p.details.trim())
  const withPhone = prospects.filter(p => p.phone && !p.phone.toLowerCase().includes('verificar'))

  const maxNiche = byNiche[0]?.count || 1
  const maxCol = Math.max(...byColumn.map(c => c.count), 1)

  if (loading) return (
    <>
      <Nav />
      <div className="loading">⏳ Carregando...</div>
    </>
  )

  return (
    <>
      <Nav />
      <div className="dash">
        <div>
          <div className="dash-title">Dashboard</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            Visão geral da sua prospecção — cub3x
          </div>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total de Prospects</div>
            <div className="stat-value" style={{ color: '#C8F55A' }}>{prospects.length}</div>
            <div className="stat-sub">em {columns.length} colunas</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Com WhatsApp</div>
            <div className="stat-value" style={{ color: '#40C870' }}>{withPhone.length}</div>
            <div className="stat-sub">prontos para contato</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Follow-ups (7 dias)</div>
            <div className="stat-value" style={{ color: '#F0A830' }}>{followups.length}</div>
            <div className="stat-sub">agendados esta semana</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Atrasados</div>
            <div className="stat-value" style={{ color: overdue.length > 0 ? '#E85050' : '#40C870' }}>{overdue.length}</div>
            <div className="stat-sub">follow-ups vencidos</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Com detalhes</div>
            <div className="stat-value" style={{ color: '#5AB8E8' }}>{withDetails.length}</div>
            <div className="stat-sub">já foram contatados</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Nichos ativos</div>
            <div className="stat-value" style={{ color: '#A070E8' }}>{byNiche.length}</div>
            <div className="stat-sub">segmentos diferentes</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* BY COLUMN */}
          <div className="section-box">
            <div className="section-title">Por fase do pipeline</div>
            {byColumn.length === 0 && <div className="empty-msg">Nenhuma coluna criada ainda.</div>}
            {byColumn.map(c => (
              <div className="bar-row" key={c.id}>
                <div className="bar-label">
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c.color, marginRight: 6 }} />
                  {c.name}
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(c.count / maxCol) * 100}%`, background: c.color }} />
                </div>
                <div className="bar-count">{c.count}</div>
              </div>
            ))}
          </div>

          {/* BY NICHE */}
          <div className="section-box">
            <div className="section-title">Por nicho</div>
            {byNiche.length === 0 && <div className="empty-msg">Nenhum prospect ainda.</div>}
            {byNiche.map(n => (
              <div className="bar-row" key={n.value}>
                <div className="bar-label">{n.label}</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(n.count / maxNiche) * 100}%`, background: n.color }} />
                </div>
                <div className="bar-count">{n.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FOLLOW-UPS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="section-box">
            <div className="section-title">🔔 Follow-ups desta semana ({followups.length})</div>
            {followups.length === 0
              ? <div className="empty-msg">Nenhum follow-up agendado para os próximos 7 dias.</div>
              : (
                <div className="followup-list">
                  {followups.map(p => (
                    <div className="followup-item" key={p.id}>
                      <div>
                        <div className="followup-name">{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                          {columns.find(c => c.id === p.column_id)?.name || 'Sem coluna'}
                        </div>
                      </div>
                      <div className="followup-date">📅 {formatDate(p.followup_date)}</div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          <div className="section-box">
            <div className="section-title">⚠️ Follow-ups atrasados ({overdue.length})</div>
            {overdue.length === 0
              ? <div className="empty-msg" style={{ color: '#40C870' }}>✓ Tudo em dia!</div>
              : (
                <div className="followup-list">
                  {overdue.map(p => (
                    <div className="followup-item" key={p.id} style={{ borderColor: '#3A1A1A' }}>
                      <div>
                        <div className="followup-name">{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                          {p.phone && <span>📞 {p.phone}</span>}
                        </div>
                      </div>
                      <div className="followup-date" style={{ color: '#E85050' }}>
                        {formatDate(p.followup_date)}
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>

        {/* RECENTLY CONTACTED */}
        <div className="section-box">
          <div className="section-title">📝 Prospects com anotações de contato ({withDetails.length})</div>
          {withDetails.length === 0
            ? <div className="empty-msg">Nenhum prospect com detalhes preenchidos ainda.</div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {withDetails.slice(0, 8).map(p => (
                  <div className="followup-item" key={p.id}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="followup-name">{p.name}</div>
                      <div style={{ fontSize: 11, color: '#5AB8E8', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.details}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                      {columns.find(c => c.id === p.column_id)?.name || '—'}
                    </div>
                  </div>
                ))}
                {withDetails.length > 8 && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', paddingTop: 4 }}>
                    + {withDetails.length - 8} outros no Kanban
                  </div>
                )}
              </div>
            )
          }
        </div>

      </div>
    </>
  )
}

function Nav() {
  const path = usePathname()
  return (
    <nav className="nav">
      <div className="nav-brand">
        <span className="nav-logo">c3x</span>
        <span className="nav-title">CRM Prospecção</span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <Link href="/" className={`nav-link${path === '/' ? ' active' : ''}`}>◫ Kanban</Link>
        <Link href="/dashboard" className={`nav-link${path === '/dashboard' ? ' active' : ''}`}>📊 Dashboard</Link>
      </div>
    </nav>
  )
}
