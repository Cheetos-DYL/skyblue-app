import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ScopeTemplates() {
  const [templates, setTemplates] = useState([])
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    supabase.from('scope_templates').select('*').order('sort_order').then(({ data }) => setTemplates(data || []))
  }, [])

  async function add() {
    const name = prompt('Template name?')
    if (!name) return
    const { data } = await supabase.from('scope_templates').insert({
      name, items: [], sort_order: templates.length
    }).select().single()
    if (data) setTemplates([...templates, data])
  }

  async function remove(id) {
    await supabase.from('scope_templates').delete().eq('id', id)
    setTemplates(templates.filter(t => t.id !== id))
  }

  async function saveItems(id, text) {
    const items = text.split('\n').map(s => s.trim()).filter(Boolean)
    await supabase.from('scope_templates').update({ items }).eq('id', id)
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, items } : t))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Scope Templates</h1>
        <button onClick={add} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ New</button>
      </div>

      {templates.map(t => (
        <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-2">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">{t.name}</h3>
            <button onClick={() => remove(t.id)} className="text-red-400 text-xs">Delete</button>
          </div>

          {editing === t.id ? (
            <div>
              <textarea
                className="w-full border border-gray-200 rounded-lg p-2 text-sm mb-2"
                rows={8}
                defaultValue={(t.items || []).join('\n')}
                placeholder="One item per line, e.g.:&#10;Front windows - upstairs&#10;Back windows"
              />
              <div className="flex gap-2">
                <button onClick={() => {
                  const ta = document.querySelector(`[data-template-id="${t.id}"]`)
                  if (ta) saveItems(t.id, ta.value)
                }} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Save</button>
                <button onClick={() => setEditing(null)} className="text-gray-500 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <ul className="text-sm text-gray-600 space-y-0.5 mb-2">
                {(t.items || []).length === 0 && <li className="text-gray-400 italic">No items yet</li>}
                {(t.items || []).map((item, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="text-gray-300">☐</span> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => setEditing(t.id)} className="text-blue-600 text-xs">Edit items</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
