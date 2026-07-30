import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Today' },
  { to: '/rounds', label: 'Rounds' },
  { to: '/templates', label: 'Templates' },
  { to: '/settings', label: 'Settings' },
]

export default function Nav() {
  const { pathname } = useLocation()
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex">
      {links.map(l => (
        <Link
          key={l.to}
          to={l.to}
          className={`flex-1 text-center py-3 text-xs font-medium ${
            pathname === l.to ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
