import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { supabase } from '../lib/supabase'
import '../lib/leafletSetup'
import 'leaflet/dist/leaflet.css'

export default function RouteMap() {
  const { id } = useParams()
  const [jobs, setJobs] = useState([])
  const [roundName, setRoundName] = useState('')

  useEffect(() => {
    supabase.from('rounds').select('name').eq('id', id).single().then(({ data }) => {
      if (data) setRoundName(data.name)
    })
    supabase.from('jobs').select('*').eq('round_id', id).order('sort_order').then(({ data }) => {
      setJobs(data || [])
    })
  }, [id])

  // Calculate routes using nearest-neighbor TSP heuristic
  const [routes, setRoutes] = useState([])
  useEffect(() => {
    if (jobs.length < 2) return
    const coords = jobs
      .filter(j => j.lat && j.lng)
      .map(j => [j.lat, j.lng])
    if (coords.length < 2) return

    // # ponytail: O(n²) nearest-neighbor, upgrade to ant-colony if >50 jobs
    const remaining = [...coords]
    const ordered = [remaining.shift()]
    while (remaining.length) {
      const last = ordered[ordered.length - 1]
      let bestIdx = 0, bestDist = Infinity
      for (let i = 0; i < remaining.length; i++) {
        const d = dist(last, remaining[i])
        if (d < bestDist) { bestDist = d; bestIdx = i }
      }
      ordered.push(remaining.splice(bestIdx, 1)[0])
    }
    setRoutes(ordered)
  }, [jobs])

  const center = jobs.find(j => j.lat) ? [jobs.find(j => j.lat).lat, jobs.find(j => j.lat).lng] : [51.5, -0.1]

  return (
    <div>
      <Link to={`/rounds/${id}`} className="text-gray-500 text-sm block mb-2">← Back</Link>
      <h1 className="text-lg font-bold mb-2">Route Map — {roundName}</h1>
      <div className="h-[60vh] rounded-xl overflow-hidden border border-gray-200">
        <MapContainer center={center} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {jobs.filter(j => j.lat).map((j, i) => (
            <Marker key={j.id} position={[j.lat, j.lng]}>
              <Popup>{i+1}. {j.address_line1}<br/>{j.customer_name}</Popup>
            </Marker>
          ))}
          {routes.length > 1 && <Polyline positions={routes} color="#2563eb" weight={3} />}
        </MapContainer>
      </div>
      <div className="mt-3 space-y-1">
        {jobs.map((j, i) => (
          <div key={j.id} className="text-sm flex gap-2 items-center">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">{i+1}</span>
            <span>{j.address_line1}</span>
            {j.lat && <span className="text-xs text-gray-400">📍</span>}
            {!j.lat && <span className="text-xs text-orange-500">needs geocoding</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function dist(a, b) {
  const dx = a[0] - b[0], dy = a[1] - b[1]
  return dx * dx + dy * dy
}
