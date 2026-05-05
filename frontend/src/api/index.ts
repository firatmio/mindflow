import type { ChatResponse } from "../types"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`API error ${res.status}: ${text || res.statusText}`)
  }
  return res.json()
}

export async function sendChat(text: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
  return handleResponse(res)
}

export async function health() {
  const res = await fetch(`${API_BASE}/api/health`)
  return handleResponse(res)
}
