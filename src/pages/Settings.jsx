import { useState } from 'react'

export default function Settings() {
  const [smsEnabled, setSmsEnabled] = useState(true)
  const [gbpEnabled, setGbpEnabled] = useState(false)
  const [phone, setPhone] = useState('')

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
        <h3 className="font-semibold mb-3">Notifications</h3>
        <label className="flex justify-between items-center py-2">
          <span className="text-sm">Auto SMS on job complete</span>
          <input type="checkbox" checked={smsEnabled} onChange={e => setSmsEnabled(e.target.checked)} className="w-5 h-5" />
        </label>
        <div className="mt-2">
          <label className="text-xs text-gray-500 block mb-1">Sender phone (Twilio)</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44..." />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
        <h3 className="font-semibold mb-3">Google Business Profile</h3>
        <label className="flex justify-between items-center py-2">
          <span className="text-sm">Prompt to share after job</span>
          <input type="checkbox" checked={gbpEnabled} onChange={e => setGbpEnabled(e.target.checked)} className="w-5 h-5" />
        </label>
        <p className="text-xs text-gray-400 mt-1">When enabled, app prepares a post with photos after each job completion for you to share to GBP.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
        <h3 className="font-semibold mb-3">Account</h3>
        <button className="text-red-500 text-sm">Sign out</button>
      </div>
    </div>
  )
}
