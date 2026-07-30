import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function TodayView() {
  const [round, setRound] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadToday()
  }, [])

  async function loadToday() {
    const day = new Date().getDay() // 0=Sun..6=Sat
    const { data: r } = await supabase
      .from('rounds')
      .select('*')
      .eq('day_of_week', day)
      .order('sort_order')
      .limit(1)
      .single()

    if (!r) { setLoading(false); return }

    setRound(r)
    const { data: j } = await supabase
      .from('jobs')
      .select('*')
      .eq('round_id', r.id)
      .order('sort_order')

    setJobs(j || [])
    setLoading(false)
  }

  async function toggleChecklist(jobId, item) {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j
      const done = j.scope_done || []
      const next = done.includes(item)
        ? done.filter(i => i !== item)
        : [...done, item]
      return { ...j, scope_done: next }
    }))
  }

  async function markDone(jobId) {
    // Save scope_done to DB + update status + send SMS
    const job = jobs.find(j => j.id === jobId)
    if (!job || !job.scope_template_id) return

    // Fetch template to build SMS message
    const { data: tmpl } = await supabase
      .from('scope_templates')
      .select('items')
      .eq('id', job.scope_template_id)
      .single()

    const done = job.scope_done || []
    const items = tmpl?.items || []

    await supabase
      .from('jobs')
      .update({ status: 'done', scope_done: done, done_at: new Date().toISOString() })
      .eq('id', jobId)

    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'done', scope_done: done } : j))

    // SMS via Edge Function (fire-and-forget)
    if (job.customer_phone) {
      supabase.functions.invoke('send-sms', {
        body: {
          to: job.customer_phone,
          name: job.customer_name,
          items: items.filter(i => done.includes(i)),
          count: done.length,
          total: items.length,
        }
      }).catch(() => {})
    }
  }

  async function uploadPhoto(jobId, type) {
    const fileEl = document.getElementById(`photo-${jobId}-${type}`)
    if (!fileEl?.files?.[0]) return
    const file = fileEl.files[0]
    const path = `${jobId}/${type}.jpg`
    await supabase.storage.from('job-photos').upload(path, file, { upsert: true })
    const url = supabase.storage.from('job-photos').getPublicUrl(path).data.publicUrl
    const field = type === 'before' ? 'photo_before' : 'photo_after'
    await supabase.from('jobs').update({ [field]: url }).eq('id', jobId)
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, [field]: url } : j))
  }

  if (loading) return <div className="text-center py-8 text-gray-400">Loading...</div>
  if (!round) return <div className="text-center py-8 text-gray-400">No round planned for today</div>

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Today</h1>
      <p className="text-sm text-gray-500 mb-4">{round.name}</p>

      {jobs.map(job => (
        <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold">{job.address_line1}</h3>
              {job.customer_name && <p className="text-sm text-gray-500">{job.customer_name}</p>}
            </div>
            {job.status === 'done' && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Done</span>
            )}
          </div>

          {/* Photo row */}
          <div className="flex gap-2 mb-2">
            <label className="flex-1 cursor-pointer">
              <input
                id={`photo-${job.id}-before`}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={() => uploadPhoto(job.id, 'before')}
              />
              <span className={`block text-center text-xs py-1.5 rounded ${job.photo_before ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {job.photo_before ? '✓ Before' : '📸 Before'}
              </span>
            </label>
            <label className="flex-1 cursor-pointer">
              <input
                id={`photo-${job.id}-after`}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={() => uploadPhoto(job.id, 'after')}
              />
              <span className={`block text-center text-xs py-1.5 rounded ${job.photo_after ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {job.photo_after ? '✓ After' : '📸 After'}
              </span>
            </label>
          </div>

          {/* Checklist */}
          {job.scope_template_id && (
            <JobChecklist
              job={job}
              onToggle={(item) => toggleChecklist(job.id, item)}
            />
          )}

          {/* Done button */}
          {job.status !== 'done' && (
            <button
              onClick={() => markDone(job.id)}
              className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold active:bg-green-700"
            >
              ✅ Done
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function JobChecklist({ job, onToggle }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!job.scope_template_id) return
    supabase.from('scope_templates')
      .select('items')
      .eq('id', job.scope_template_id)
      .single()
      .then(({ data }) => { if (data) setItems(data.items || []) })
  }, [job.scope_template_id])

  const done = job.scope_done || []

  return (
    <div className="space-y-0.5">
      {items.map((item, i) => (
        <label key={i} className="flex items-center gap-2 text-sm py-1 px-1 rounded active:bg-gray-50">
          <input
            type="checkbox"
            checked={done.includes(item)}
            onChange={() => onToggle(item)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600"
          />
          <span className={done.includes(item) ? 'line-through text-gray-400' : 'text-gray-700'}>
            {item}
          </span>
        </label>
      ))}
    </div>
  )
}
