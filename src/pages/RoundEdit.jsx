import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { geocode } from '../lib/geocode'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function RoundEdit() {
  const { id } = useParams()
  const [round, setRound] = useState(null)
  const [jobs, setJobs] = useState([])
  const [templates, setTemplates] = useState([])

  useEffect(() => {
    supabase.from('rounds').select('*').eq('id', id).single().then(({ data }) => setRound(data))
    supabase.from('jobs').select('*, scope_templates(name)').eq('round_id', id).order('sort_order').then(({ data }) => setJobs(data || []))
    supabase.from('scope_templates').select('id,name').order('sort_order').then(({ data }) => setTemplates(data || []))
  }, [id])

  async function addJob() {
    const addr = prompt('Address (e.g. "15 St Mary\'s Rd, Bristol")?')
    if (!addr) return
    const tmplId = templates[0]?.id || null
    const { data } = await supabase.from('jobs').insert({
      round_id: id, address_line1: addr,
      scope_template_id: tmplId,
      sort_order: jobs.length
    }).select().single()
    if (data) setJobs([...jobs, data])
  }

  async function updateField(jobId, field, value) {
    await supabase.from('jobs').update({ [field]: value }).eq('id', jobId)
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, [field]: value } : j))
  }

  async function updateRound(field, value) {
    await supabase.from('rounds').update({ [field]: value }).eq('id', id)
    setRound(r => ({ ...r, [field]: value }))
  }

  async function moveJob(jobId, dir) {
    const idx = jobs.findIndex(j => j.id === jobId)
    if (idx === -1) return
    const next = [...jobs]
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= jobs.length) return
    const origSort = next[idx].sort_order
    next[idx].sort_order = next[swapIdx].sort_order
    next[swapIdx].sort_order = origSort;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
    setJobs(next)
    for (const j of next) {
      await supabase.from('jobs').update({ sort_order: j.sort_order }).eq('id', j.id)
    }
  }

  async function removeJob(jobId) {
    await supabase.from('jobs').delete().eq('id', jobId)
    setJobs(jobs.filter(j => j.id !== jobId))
  }

  async function geocodeJob(jobId) {
    const job = jobs.find(j => j.id === jobId)
    if (!job?.address_line1) return
    const result = await geocode(job.address_line1)
    if (result) {
      updateField(jobId, 'lat', result.lat)
      updateField(jobId, 'lng', result.lng)
    } else {
      alert('Address not found')
    }
  }

  if (!round) return <div className="text-center py-8 text-gray-400">Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Link to="/rounds" className="text-gray-500 text-sm">← Rounds</Link>
        <Link to={`/rounds/${id}/map`} className="text-blue-600 text-sm">🗺 Map</Link>
      </div>

      <input
        className="text-xl font-bold w-full bg-transparent border-b border-gray-200 pb-1 mb-2 outline-none"
        value={round.name}
        onChange={e => updateRound('name', e.target.value)}
      />
      <select
        className="mb-4 text-sm border border-gray-200 rounded px-2 py-1"
        value={round.day_of_week}
        onChange={e => updateRound('day_of_week', Number(e.target.value))}
      >
        {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
      </select>

      <button onClick={addJob} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium mb-3">+ Add Job</button>

      {jobs.map((job, i) => (
        <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-2">
          <div className="flex gap-1 mb-2">
            <button onClick={() => moveJob(job.id, 'up')} disabled={i === 0} className="text-xs px-2 py-0.5 bg-gray-100 rounded disabled:opacity-30">↑</button>
            <button onClick={() => moveJob(job.id, 'down')} disabled={i === jobs.length - 1} className="text-xs px-2 py-0.5 bg-gray-100 rounded disabled:opacity-30">↓</button>
            <span className="text-xs text-gray-400 ml-1 flex-1">{i + 1}</span>
            <button onClick={() => removeJob(job.id)} className="text-xs text-red-500 px-2">✕</button>
          </div>

          <div className="flex gap-1">
            <input
              className="flex-1 text-sm bg-transparent border-b border-gray-100 pb-1 mb-1 outline-none"
              value={job.address_line1 || ''}
              onChange={e => updateField(job.id, 'address_line1', e.target.value)}
              placeholder="Address"
            />
            <button onClick={() => geocodeJob(job.id)} className="text-xs px-2 py-0.5 bg-gray-100 rounded" title="Geocode address">
              {job.lat ? '📍' : '🔍'}
            </button>
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 text-sm bg-transparent border-b border-gray-100 pb-1 outline-none"
              value={job.customer_name || ''}
              onChange={e => updateField(job.id, 'customer_name', e.target.value)}
              placeholder="Customer name"
            />
            <input
              className="flex-1 text-sm bg-transparent border-b border-gray-100 pb-1 outline-none"
              value={job.customer_phone || ''}
              onChange={e => updateField(job.id, 'customer_phone', e.target.value)}
              placeholder="Phone"
            />
          </div>
          <select
            className="mt-2 text-xs border border-gray-200 rounded px-1 py-0.5 w-full"
            value={job.scope_template_id || ''}
            onChange={e => updateField(job.id, 'scope_template_id', e.target.value || null)}
          >
            <option value="">No template</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      ))}
    </div>
  )
}
