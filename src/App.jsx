import { HashRouter, Routes, Route } from 'react-router-dom'
import TodayView from './pages/TodayView'
import RoundsList from './pages/RoundsList'
import RoundEdit from './pages/RoundEdit'
import RouteMap from './pages/RouteMap'
import ScopeTemplates from './pages/ScopeTemplates'
import Settings from './pages/Settings'
import Nav from './components/Nav'
import { supabase } from './lib/supabase'

export default function App() {
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Skyblue</h1>
          <p className="text-gray-500 mb-4">Supabase not configured yet.</p>
          <ol className="text-sm text-left text-gray-600 space-y-1 max-w-sm mx-auto">
            <li>1. Create a project at <a href="https://supabase.com" className="text-blue-600">supabase.com</a></li>
            <li>2. Run <code className="bg-gray-100 px-1">supabase/migrations/001_schema.sql</code> in SQL Editor</li>
            <li>3. Copy <code className="bg-gray-100 px-1">.env.example</code> to <code className="bg-gray-100 px-1">.env</code></li>
            <li>4. Fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY</li>
            <li>5. <code className="bg-gray-100 px-1">npm run build && npm run deploy</code></li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <HashRouter>
      <div className="min-h-screen pb-16">
        <Nav />
        <main className="max-w-lg mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<TodayView />} />
            <Route path="/rounds" element={<RoundsList />} />
            <Route path="/rounds/:id" element={<RoundEdit />} />
            <Route path="/rounds/:id/map" element={<RouteMap />} />
            <Route path="/templates" element={<ScopeTemplates />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
