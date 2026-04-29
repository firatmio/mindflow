const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

type EmotionResult = {
	label?: string
	score?: number
	energy?: number
	stress?: number
	breakdown?: Record<string, number>
}

type AffirmationResponse = {
	affirmation: string
	suggestions: string[]
	quote: { original: string; translated?: string; author?: string }
}

type JournalEntry = {
	text: string
	label?: string | null
	score?: number | null
	energy?: number | null
	stress?: number | null
	breakdown?: Record<string, number> | null
}

function buildAuthHeader(token?: string) {
	const headers: Record<string, string> = { "Content-Type": "application/json" }
	const t = token ?? localStorage.getItem("firebaseToken")
	if (t) headers["Authorization"] = `Bearer ${t}`
	return headers
}

async function handleResponse(res: Response) {
	if (!res.ok) {
		const text = await res.text().catch(() => "")
		throw new Error(`API error ${res.status}: ${text || res.statusText}`)
	}
	return res.json()
}

export async function health() {
	const res = await fetch(`${API_BASE}/api/health`)
	return handleResponse(res)
}

export async function analyzeEmotion(text: string) {
	const res = await fetch(`${API_BASE}/api/emotion/analyze`, {
		method: "POST",
		headers: buildAuthHeader(),
		body: JSON.stringify({ text }),
	})
	return handleResponse(res) as Promise<{ text: string } & EmotionResult>
}

export async function getAffirmation(recentLabels: string[] = []) {
	const qs = recentLabels.length ? `?recent_labels=${encodeURIComponent(recentLabels.join(","))}` : ""
	const res = await fetch(`${API_BASE}/api/affirmation/today${qs}`)
	return handleResponse(res) as Promise<AffirmationResponse>
}

export async function createJournal(entry: JournalEntry, token?: string) {
	const res = await fetch(`${API_BASE}/api/journal`, {
		method: "POST",
		headers: buildAuthHeader(token),
		body: JSON.stringify(entry),
	})
	return handleResponse(res)
}

export async function listJournals(token?: string) {
	const res = await fetch(`${API_BASE}/api/journal`, {
		method: "GET",
		headers: buildAuthHeader(token),
	})
	return handleResponse(res)
}

export default {
	health,
	analyzeEmotion,
	getAffirmation,
	createJournal,
	listJournals,
}

