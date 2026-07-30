import { HashRouter, Routes, Route } from 'react-router-dom'
import TodayView from './pages/TodayView'
import RoundsList from './pages/RoundsList'
import RoundEdit from './pages/RoundEdit'
import RouteMap from './pages/RouteMap'
import ScopeTemplates from './pages/ScopeTemplates'
import Settings from './pages/Settings'
import Nav from './components/Nav'

export default function App() {
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
