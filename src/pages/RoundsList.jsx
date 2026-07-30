import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function RoundsList() {
  const [rounds, setRounds] = useState([])

  useEffect(() => {
    supabase.from('rounds').select('*, jobs:jobs(count)').order('day_of_week').then(({ data }) => setRounds(data || []))
  }, [])

  async function addRound() {
    const name = prompt('Round name?')
    if (!name) return
    const { data } = await supabase.from('rounds').insert({ name, day_of_week: 1, sort_order: 0 }).select().single()
    if (data) setRounds([...rounds, { ...data, jobs: [{ count: 0 }] }])
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Rounds</h1>
        <button onClick={addRound} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ New</button>
      </div>
      {rounds.map(r => (
        <Link key={r.id} to={`/rounds/${r.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-2">
          <div className="flex justify-between">
            <span className="font-semibold">{r.name}</span>
            <span className="text-sm text-gray-500">{DAYS[r.day_of_week]} · {r.jobs?.[0]?.count || 0} jobs</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
