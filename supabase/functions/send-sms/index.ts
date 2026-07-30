// Supabase Edge Function: send-sms
// Requires TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN env vars
// Twilio phone number in TWILIO_PHONE_NUMBER

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { to, name, items, count, total } = await req.json()
  if (!to) return new Response('missing "to"', { status: 400 })

  const checklist = (items || []).map(i => `✓ ${i}`).join('\n')
  const body = `Hi ${name || ''}, your windows are done ✅\n${count}/${total} items completed:\n${checklist}`

  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const from = Deno.env.get('TWILIO_PHONE_NUMBER')

  if (!accountSid || !authToken || !from) {
    return new Response('SMS not configured', { status: 500 })
  }

  const resp = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    }
  )

  const data = await resp.json()
  return new Response(JSON.stringify(data), { status: resp.status })
})
