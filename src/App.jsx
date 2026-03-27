import { useState, useEffect } from 'react'
import './App.css'

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_AMENITIES = [
  { key: 'parking',       label: 'Parking' },
  { key: 'inUnitLaundry', label: 'In-Unit Laundry' },
  { key: 'wdHookup',      label: 'W/D Hookup' },
  { key: 'petFriendly',   label: 'Pet-Friendly' },
  { key: 'gym',           label: 'Gym' },
  { key: 'dishwasher',    label: 'Dishwasher' },
]

const DEFAULT_SETTINGS = {
  budgetMin: 1100,
  budgetMax: 1300,
  amenities: DEFAULT_AMENITIES,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function genId() {
  return crypto.randomUUID?.() ?? (Math.random().toString(36).slice(2) + Date.now().toString(36))
}

function labelToKey(label) {
  return label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

function blankAmenities(amenities) {
  return amenities.reduce((acc, a) => ({ ...acc, [a.key]: false }), {})
}

function parsePastedText(amenities) {
  return function(text) {
    const base = { name: '', neighborhood: '', rent: '', notes: '', gutFeeling: 5, amenities: blankAmenities(amenities) }
    const lower = text.toLowerCase()

    for (const pat of [
      /\$([\d,]+)\s*\/\s*mo(?:nth)?/i,
      /\$([\d,]+)\s*per\s*month/i,
      /rent[:\s]+\$?([\d,]+)/i,
      /\$([\d,]+)\s+(?:a|per)\s+month/i,
      /\$([\d,]+)/i,
    ]) {
      const m = text.match(pat)
      if (m) { base.rent = m[1].replace(/,/g, ''); break }
    }

    const addr = text.match(
      /\d+\s+[A-Za-z][A-Za-z\s]+(?:St(?:reet)?|Ave(?:nue)?|Blvd|Boulevard|Dr(?:ive)?|Rd|Road|Ln|Lane|Way|Ct|Court|Pl(?:ace)?|Pkwy|Parkway)\b[.,]?(?:\s*(?:Apt|Unit|#)\s*[\w\d]+)?/i
    )
    if (addr) base.name = addr[0].trim().replace(/\s+/g, ' ')

    // Built-in keyword detection for common amenities
    if (/\bparking\b|garage|carport/.test(lower))                                                              base.amenities.parking = true
    if (/in[- ]unit\s+(?:washer|laundry|w\/d)|washer\s*[/&]\s*dryer\s+in\s+unit/.test(lower))                base.amenities.inUnitLaundry = true
    if (/w\/d\s+hookup|washer.*dryer.*hookup|w\/d\s+hookups?/.test(lower) && !base.amenities.inUnitLaundry)   base.amenities.wdHookup = true
    if (/pet[- ]friendly|pets\s+(?:ok|allowed|welcome)|cats?\s+ok|dogs?\s+ok/.test(lower))                    base.amenities.petFriendly = true
    if (/\bgym\b|fitness\s+(?:center|room)|workout\s+room/.test(lower))                                       base.amenities.gym = true
    if (/dishwasher/.test(lower))                                                                              base.amenities.dishwasher = true

    // Generic keyword match for any custom amenities
    for (const a of amenities) {
      if (base.amenities[a.key] === false) {
        const keyword = a.label.toLowerCase()
        if (lower.includes(keyword)) base.amenities[a.key] = true
      }
    }

    return base
  }
}

function scoreListings(listings, settings) {
  const { budgetMin, budgetMax, amenities } = settings
  return listings.map(l => {
    const rent         = parseFloat(l.rent) || 0
    const rentScore    = rent <= budgetMin ? 10 : rent >= budgetMax ? 0 : 10 * (budgetMax - rent) / (budgetMax - budgetMin)
    const listed       = l.amenities ?? {}
    const amenityScore = amenities.length > 0
      ? (amenities.filter(a => listed[a.key]).length / amenities.length) * 10
      : 0
    const gutScore     = l.gutFeeling != null ? Number(l.gutFeeling) : 5
    const total        = rentScore * 0.4 + amenityScore * 0.3 + gutScore * 0.3
    return { ...l, rentScore, amenityScore, gutScore, total }
  }).sort((a, b) => b.total - a.total)
}

// ── ListingCard ───────────────────────────────────────────────────────────────

function ListingCard({ listing, amenities, onEdit, onDelete, selected, onToggleSelect }) {
  return (
    <div className={`card${selected ? ' card--selected' : ''}`}>
      <label className="card-compare">
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(listing.id)} />
        {selected ? 'Selected for compare' : 'Compare'}
      </label>

      <div className="card-top">
        <div className="card-info">
          <h3 className="card-name">{listing.name || 'Unnamed Listing'}</h3>
          {listing.neighborhood && <span className="neighborhood-tag">{listing.neighborhood}</span>}
        </div>
        <div className="card-rent">
          ${Number(listing.rent).toLocaleString()}<span className="card-rent-mo">/mo</span>
        </div>
      </div>

      <div className="card-amenities">
        {amenities.map(a => (
          <span key={a.key} className={`pill ${listing.amenities?.[a.key] ? 'pill--on' : 'pill--off'}`}>
            {a.label}
          </span>
        ))}
      </div>

      {listing.notes && <p className="card-notes">{listing.notes}</p>}

      <div className="card-gut">
        <span className="gut-label">Gut feeling</span>
        <div className="gut-track">
          <div className="gut-fill" style={{ width: `${listing.gutFeeling * 10}%` }} />
        </div>
        <span className="gut-num">{listing.gutFeeling}/10</span>
      </div>

      <div className="card-footer">
        <div className="card-actions">
          <button className="btn btn-outline btn-sm" onClick={() => onEdit(listing)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(listing.id)}>Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── AddView ───────────────────────────────────────────────────────────────────

function AddView({ initial, amenities, onSave, onCancel, title }) {
  const initAmenities = { ...blankAmenities(amenities), ...(initial.amenities ?? {}) }
  const [tab, setTab]               = useState('manual')
  const [form, setForm]             = useState({ ...initial, amenities: initAmenities })
  const [pasteText, setPasteText]   = useState('')
  const [parsedBanner, setParsedBanner] = useState(null)

  const parse = parsePastedText(amenities)

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function toggleAmenity(key) {
    setForm(f => ({ ...f, amenities: { ...f.amenities, [key]: !f.amenities[key] } }))
  }

  function handleParse() {
    const parsed = parse(pasteText)
    const parts = []
    if (parsed.name) parts.push(`address: "${parsed.name}"`)
    if (parsed.rent) parts.push(`rent: $${Number(parsed.rent).toLocaleString()}`)
    const ons = amenities.filter(a => parsed.amenities[a.key]).map(a => a.label)
    if (ons.length) parts.push(`amenities: ${ons.join(', ')}`)

    setForm(f => ({ ...parsed, name: parsed.name || f.name, neighborhood: f.neighborhood, notes: f.notes, gutFeeling: f.gutFeeling }))
    setParsedBanner(parts.length ? `Extracted ${parts.join(' · ')}` : 'No structured data found — fill in manually.')
    setTab('manual')
    setPasteText('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { alert('Please enter a name or address.'); return }
    if (!form.rent)        { alert('Please enter the monthly rent.'); return }
    onSave(form)
  }

  return (
    <div className="add-view">
      <h2 style={{ marginBottom: 20 }}>{title}</h2>

      <div className="tabs">
        <button className={`tab${tab === 'manual' ? ' tab--active' : ''}`} onClick={() => setTab('manual')}>
          Manual entry
        </button>
        <button className={`tab${tab === 'paste' ? ' tab--active' : ''}`} onClick={() => setTab('paste')}>
          Paste listing text
        </button>
      </div>

      {tab === 'paste' && (
        <div className="paste-section">
          <div className="field">
            <span>Paste raw Zillow or Apartments.com listing text</span>
            <textarea
              className="paste-area"
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="Paste the full listing description here — rent, address, and amenities will be auto-extracted…"
              rows={9}
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleParse} disabled={!pasteText.trim()}>
              Parse &amp; Pre-fill
            </button>
            <button className="btn btn-outline" onClick={() => { setPasteText(''); setTab('manual') }}>Cancel</button>
          </div>
        </div>
      )}

      {tab === 'manual' && (
        <>
          {parsedBanner && (
            <div className="parse-banner">
              ✓ <em>{parsedBanner}</em> — review and adjust below before saving.
            </div>
          )}

          <form className="listing-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="field">
                <span>Name / Address *</span>
                <input
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="e.g. 123 Oak St Apt 4 or The Waverly"
                />
              </div>
              <div className="field">
                <span>Neighborhood</span>
                <input
                  value={form.neighborhood}
                  onChange={e => setField('neighborhood', e.target.value)}
                  placeholder="e.g. Capitol Hill, Midtown"
                />
              </div>
            </div>

            <div className="form-row form-row--narrow">
              <div className="field">
                <span>Monthly Rent ($) *</span>
                <input
                  type="number"
                  value={form.rent}
                  onChange={e => setField('rent', e.target.value)}
                  placeholder="1200"
                  min="0"
                  step="1"
                />
              </div>
            </div>

            {amenities.length > 0 && (
              <fieldset className="amenities-field">
                <legend>Amenities</legend>
                <div className="amenity-grid">
                  {amenities.map(a => (
                    <label key={a.key} className="check-label">
                      <input type="checkbox" checked={!!form.amenities[a.key]} onChange={() => toggleAmenity(a.key)} />
                      {a.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="field">
              <span>Notes</span>
              <textarea
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                placeholder="First impressions, dealbreakers, things to follow up on…"
                rows={3}
              />
            </div>

            <div className="gut-field">
              <span>Gut Feeling: <strong>{form.gutFeeling} / 10</strong></span>
              <input
                type="range"
                min="1"
                max="10"
                value={form.gutFeeling}
                onChange={e => setField('gutFeeling', Number(e.target.value))}
              />
              <div className="range-ends"><span>1 — Meh</span><span>10 — Love it!</span></div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Save Listing</button>
              {onCancel && <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>}
            </div>
          </form>
        </>
      )}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard({ listings, amenities, onEdit, onDelete, compareIds, onToggleCompare, onGoCompare }) {
  return (
    <div>
      <div className="view-header">
        <h2>All Listings <span className="muted">({listings.length})</span></h2>
        <div className="view-actions">
          {compareIds.length === 1 && <span className="hint">Select one more listing to enable compare</span>}
          {compareIds.length >= 2 && (
            <button className="btn btn-accent" onClick={onGoCompare}>
              Compare {compareIds.length} selected →
            </button>
          )}
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏠</div>
          <p>No listings yet. Add your first one to get started.</p>
        </div>
      ) : (
        <div className="card-grid">
          {listings.map(l => (
            <ListingCard
              key={l.id}
              listing={l}
              amenities={amenities}
              onEdit={onEdit}
              onDelete={onDelete}
              selected={compareIds.includes(l.id)}
              onToggleSelect={onToggleCompare}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── CompareView ───────────────────────────────────────────────────────────────

function CompareView({ listings, amenities, compareIds, onGoSelect }) {
  const sel = listings.filter(l => compareIds.includes(l.id))

  if (sel.length < 2) {
    return (
      <div className="compare-view">
        <div className="view-header"><h2>Compare</h2></div>
        <div className="empty-state">
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚖️</div>
          <p>Go to Dashboard and check 2–3 listings to compare side by side.</p>
          <button className="btn btn-accent" style={{ marginTop: 16 }} onClick={onGoSelect}>
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const minRent = Math.min(...sel.map(l => parseFloat(l.rent) || Infinity))
  const maxGut  = Math.max(...sel.map(l => l.gutFeeling))

  const rows = [
    {
      label: 'Monthly Rent',
      render: l => {
        const v = parseFloat(l.rent) || 0
        return <span className={v === minRent ? 'cell-best' : ''}>${Number(l.rent).toLocaleString()}/mo</span>
      },
    },
    ...amenities.map(a => ({
      label: a.label,
      render: l => <span className={l.amenities?.[a.key] ? 'cell-yes' : 'cell-no'}>{l.amenities?.[a.key] ? '✓' : '✗'}</span>,
    })),
    {
      label: 'Gut Feeling',
      render: l => <span className={l.gutFeeling === maxGut ? 'cell-best' : ''}>{l.gutFeeling}/10</span>,
    },
    {
      label: 'Notes',
      render: l => (
        <span style={{ fontStyle: l.notes ? 'normal' : 'italic', opacity: l.notes ? 1 : 0.45 }}>
          {l.notes || 'None'}
        </span>
      ),
    },
  ]

  return (
    <div className="compare-view">
      <div className="view-header">
        <h2>Comparing {sel.length} Listings</h2>
        <span className="hint">
          <span className="cell-best" style={{ padding: '1px 7px', borderRadius: 4, fontWeight: 500 }}>Green</span>
          {' = best value in category'}
        </span>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th />
              {sel.map(l => (
                <th key={l.id}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-h)' }}>{l.name}</div>
                  {l.neighborhood && (
                    <div style={{ fontWeight: 400, fontSize: 12, color: 'var(--text)', marginTop: 2 }}>
                      {l.neighborhood}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>{row.label}</td>
                {sel.map(l => <td key={l.id}>{row.render(l)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── RankedView ────────────────────────────────────────────────────────────────

const RANK_CLASSES = ['rank--gold', 'rank--silver', 'rank--bronze']

function Sbar({ label, score, color }) {
  return (
    <div className="sbar">
      <span className="sbar-label">{label}</span>
      <div className="sbar-track">
        <div className="sbar-fill" style={{ width: `${score * 10}%`, background: color }} />
      </div>
      <span className="sbar-val">{score.toFixed(1)}</span>
    </div>
  )
}

function RankedView({ listings, settings }) {
  const scored = scoreListings(listings, settings)
  const { budgetMin, budgetMax } = settings

  if (listings.length === 0) {
    return (
      <div>
        <div className="view-header"><h2>Rankings</h2></div>
        <div className="empty-state">
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
          <p>Add listings to see them ranked here.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="view-header">
        <h2>Rankings</h2>
        <span className="hint">
          Rent 40% · Amenities 30% · Gut feeling 30% · Budget ${budgetMin.toLocaleString()}–${budgetMax.toLocaleString()}/mo
        </span>
      </div>
      <ol className="ranked-list">
        {scored.map((l, i) => (
          <li key={l.id} className="ranked-item">
            <div className={`rank ${RANK_CLASSES[i] ?? 'rank--rest'}`}>#{i + 1}</div>
            <div className="ranked-body">
              <div className="ranked-title">
                <strong>{l.name}</strong>
                {l.neighborhood && <span className="neighborhood-tag">{l.neighborhood}</span>}
                <span className="ranked-rent">${Number(l.rent).toLocaleString()}/mo</span>
              </div>
              <div className="ranked-bars">
                <Sbar label="Rent"      score={l.rentScore}    color="var(--score-rent)" />
                <Sbar label="Amenities" score={l.amenityScore} color="var(--score-amen)" />
                <Sbar label="Gut"       score={l.gutScore}     color="var(--score-gut)"  />
              </div>
            </div>
            <div className="ranked-score">
              <div className="big-score">{l.total.toFixed(1)}</div>
              <div className="score-denom">/ 10</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ── SettingsView ──────────────────────────────────────────────────────────────

function SettingsView({ settings, onSave }) {
  const [budgetMin, setBudgetMin] = useState(settings.budgetMin)
  const [budgetMax, setBudgetMax] = useState(settings.budgetMax)
  const [amenities, setAmenities] = useState(settings.amenities)
  const [newLabel, setNewLabel]   = useState('')
  const [saved, setSaved]         = useState(false)

  function handleAddAmenity() {
    const label = newLabel.trim()
    if (!label) return
    const key = labelToKey(label)
    if (amenities.find(a => a.key === key)) { alert('An amenity with that name already exists.'); return }
    setAmenities(prev => [...prev, { key, label }])
    setNewLabel('')
  }

  function handleRemoveAmenity(key) {
    if (!confirm('Remove this amenity? Existing listings will keep their saved value but it won\'t appear in new forms or scoring.')) return
    setAmenities(prev => prev.filter(a => a.key !== key))
  }

  function handleSave() {
    const min = Number(budgetMin)
    const max = Number(budgetMax)
    if (!min || !max || min >= max) { alert('Budget min must be a number less than max.'); return }
    if (amenities.length === 0) { alert('Add at least one amenity.'); return }
    onSave({ budgetMin: min, budgetMax: max, amenities })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="add-view">
      <h2 style={{ marginBottom: 24 }}>Settings</h2>

      <div className="listing-form">
        {/* Budget */}
        <div className="settings-section">
          <div className="settings-section-title">Budget Range</div>
          <p className="hint" style={{ marginBottom: 12 }}>
            Used for rent scoring: at or below min = 10/10, at or above max = 0/10.
          </p>
          <div className="form-row">
            <div className="field">
              <span>Min ($/mo)</span>
              <input
                type="number"
                value={budgetMin}
                onChange={e => setBudgetMin(e.target.value)}
                min="0"
                step="50"
              />
            </div>
            <div className="field">
              <span>Max ($/mo)</span>
              <input
                type="number"
                value={budgetMax}
                onChange={e => setBudgetMax(e.target.value)}
                min="0"
                step="50"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="settings-section">
          <div className="settings-section-title">Amenities</div>
          <p className="hint" style={{ marginBottom: 12 }}>
            These appear as checkboxes on listing forms, badges on cards, and factor into scoring.
          </p>

          <div className="amenity-manager">
            {amenities.map(a => (
              <div key={a.key} className="amenity-row">
                <span className="amenity-row-label">{a.label}</span>
                <button className="btn btn-danger btn-sm" onClick={() => handleRemoveAmenity(a.key)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="amenity-add-row">
            <div className="field" style={{ flex: 1 }}>
              <input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmenity() } }}
                placeholder="New amenity name, e.g. Rooftop Deck"
              />
            </div>
            <button className="btn btn-accent" onClick={handleAddAmenity} disabled={!newLabel.trim()}>
              Add
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [listings, setListings] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('apt-listings') || '[]')
      return raw.map(l => ({
        neighborhood: '', notes: '', gutFeeling: 5,
        ...l,
        amenities: { ...blankAmenities(DEFAULT_AMENITIES), ...(l.amenities ?? {}) },
      }))
    }
    catch { return [] }
  })

  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('apt-settings') || '{}')
      return {
        budgetMin: saved.budgetMin ?? DEFAULT_SETTINGS.budgetMin,
        budgetMax: saved.budgetMax ?? DEFAULT_SETTINGS.budgetMax,
        amenities: Array.isArray(saved.amenities) && saved.amenities.length > 0
          ? saved.amenities
          : DEFAULT_SETTINGS.amenities,
      }
    }
    catch { return { ...DEFAULT_SETTINGS } }
  })

  const [view, setView]                     = useState('dashboard')
  const [editingListing, setEditingListing] = useState(null)
  const [compareIds, setCompareIds]         = useState([])

  useEffect(() => {
    localStorage.setItem('apt-listings', JSON.stringify(listings))
  }, [listings])

  useEffect(() => {
    localStorage.setItem('apt-settings', JSON.stringify(settings))
  }, [settings])

  function handleSave(form) {
    if (editingListing) {
      setListings(ls => ls.map(l => l.id === editingListing.id ? { ...form, id: l.id } : l))
    } else {
      setListings(ls => [...ls, { ...form, id: genId() }])
    }
    setEditingListing(null)
    setView('dashboard')
  }

  function handleEdit(listing) {
    setEditingListing(listing)
    setView('add')
  }

  function handleDelete(id) {
    if (!confirm('Delete this listing?')) return
    setListings(ls => ls.filter(l => l.id !== id))
    setCompareIds(ids => ids.filter(i => i !== id))
  }

  function handleToggleCompare(id) {
    setCompareIds(ids => {
      if (ids.includes(id)) return ids.filter(i => i !== id)
      if (ids.length >= 3) { alert('Max 3 listings for comparison. Deselect one first.'); return ids }
      return [...ids, id]
    })
  }

  function navTo(key) {
    if (key !== 'add') setEditingListing(null)
    setView(key)
  }

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', badge: listings.length || null },
    { key: 'add',       label: editingListing ? 'Edit' : 'Add Listing' },
    { key: 'compare',   label: 'Compare',   badge: compareIds.length >= 2 ? compareIds.length : null },
    { key: 'rankings',  label: 'Rankings' },
    { key: 'settings',  label: 'Settings' },
  ]

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">🏠 Apartment Tracker</div>
        <nav className="app-nav">
          {navItems.map(n => (
            <button
              key={n.key}
              className={`nav-btn${view === n.key ? ' nav-btn--active' : ''}`}
              onClick={() => navTo(n.key)}
            >
              {n.label}
              {n.badge != null && <span className="nav-badge">{n.badge}</span>}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {view === 'dashboard' && (
          <Dashboard
            listings={listings}
            amenities={settings.amenities}
            onEdit={handleEdit}
            onDelete={handleDelete}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
            onGoCompare={() => setView('compare')}
          />
        )}
        {view === 'add' && (
          <AddView
            key={editingListing?.id ?? 'new'}
            initial={editingListing ?? { name: '', neighborhood: '', rent: '', notes: '', gutFeeling: 5, amenities: blankAmenities(settings.amenities) }}
            amenities={settings.amenities}
            onSave={handleSave}
            onCancel={() => { setEditingListing(null); setView('dashboard') }}
            title={editingListing ? 'Edit Listing' : 'Add New Listing'}
          />
        )}
        {view === 'compare' && (
          <CompareView
            listings={listings}
            amenities={settings.amenities}
            compareIds={compareIds}
            onGoSelect={() => setView('dashboard')}
          />
        )}
        {view === 'rankings' && (
          <RankedView listings={listings} settings={settings} />
        )}
        {view === 'settings' && (
          <SettingsView settings={settings} onSave={setSettings} />
        )}
      </main>
    </div>
  )
}
