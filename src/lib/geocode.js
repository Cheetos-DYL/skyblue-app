// # ponytail: OSM Nominatim, rate limit 1 req/s, upgrade to paid geocoder if >100 addresses/day
export async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
  const resp = await fetch(url)
  const data = await resp.json()
  if (data[0]) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  }
  return null
}
