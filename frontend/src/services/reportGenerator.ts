import type { ChatSession } from "../types"

const moodLabel: Record<string, string> = {
  mutlu: "Mutlu",
  üzgün: "Üzgün",
  stresli: "Stresli",
  dengeli: "Dengeli",
}

const moodColorHex: Record<string, string> = {
  mutlu: "#16a34a",
  üzgün: "#2563eb",
  stresli: "#ea580c",
  dengeli: "#0d9488",
}

export function generateReport(chats: ChatSession[], userName: string) {
  const emotionMessages = chats.flatMap((chat) =>
    chat.messages
      .filter((m) => m.role === "bot" && m.label)
      .map((m) => ({ ...m, chatTitle: chat.title, chatDate: chat.createdAt })),
  )

  const total = emotionMessages.length
  if (total === 0) return null

  const labelCounts: Record<string, number> = {}
  let totalEnergy = 0
  let totalStress = 0
  let energyCount = 0

  for (const m of emotionMessages) {
    if (m.label) labelCounts[m.label] = (labelCounts[m.label] ?? 0) + 1
    if (m.energy != null) { totalEnergy += m.energy; energyCount++ }
    if (m.stress != null) totalStress += m.stress
  }

  const avgEnergy = energyCount > 0 ? Math.round(totalEnergy / energyCount) : 0
  const avgStress = energyCount > 0 ? Math.round(totalStress / energyCount) : 0
  const dominant = Object.entries(labelCounts).sort((a, b) => b[1] - a[1])[0]

  const now = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const chatRows = chats
    .map((chat) => {
      const botMsgs = chat.messages.filter((m) => m.role === "bot" && m.label)
      if (botMsgs.length === 0) return ""
      const labels = botMsgs.map((m) => m.label).filter(Boolean)
      const most = labels.reduce(
        (acc, l) => {
          if (!l) return acc
          acc[l] = (acc[l] ?? 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )
      const topLabel = Object.entries(most).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ""
      const chatDate = new Date(chat.createdAt).toLocaleDateString("tr-TR")
      const color = moodColorHex[topLabel] ?? "#374151"
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0e8e0;max-width:260px">
            <span style="font-size:13px;color:#374151">${chat.title}</span>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0e8e0;text-align:center">
            <span style="font-size:12px;color:#6b7280">${chatDate}</span>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0e8e0;text-align:center">
            <span style="font-size:12px;font-weight:500;color:${color}">${moodLabel[topLabel] ?? topLabel}</span>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0e8e0;text-align:center">
            <span style="font-size:12px;color:#6b7280">${botMsgs.length}</span>
          </td>
        </tr>`
    })
    .join("")

  const distRows = Object.entries(labelCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => {
      const pct = Math.round((count / total) * 100)
      const color = moodColorHex[label] ?? "#374151"
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f9f7f5">
            <span style="font-size:13px;font-weight:500;color:${color}">${moodLabel[label] ?? label}</span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f9f7f5">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;height:8px;border-radius:4px;background:#f3f4f6;overflow:hidden">
                <div style="width:${pct}%;height:100%;border-radius:4px;background:${color}"></div>
              </div>
              <span style="font-size:12px;color:#6b7280;min-width:32px">%${pct}</span>
            </div>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f9f7f5;text-align:center">
            <span style="font-size:12px;color:#6b7280">${count} mesaj</span>
          </td>
        </tr>`
    })
    .join("")

  const dominantColor = dominant ? (moodColorHex[dominant[0]] ?? "#374151") : "#374151"
  const dominantText = dominant ? moodLabel[dominant[0]] ?? dominant[0] : "—"

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <title>MindFlow — Duygu Analizi Raporu</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0 }
    body { font-family: -apple-system, 'Segoe UI', sans-serif; background: #fff; color: #1f2937; padding: 40px; max-width: 860px; margin: 0 auto }
    @media print { body { padding: 20px } }
    h1 { font-size: 26px; font-weight: 300; color: #111827; letter-spacing: -0.5px }
    h2 { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 14px }
    table { width: 100%; border-collapse: collapse }
    th { text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; padding: 8px 12px; border-bottom: 2px solid #f0e8e0 }
  </style>
</head>
<body>
  <!-- Başlık -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #f0e8e0">
    <div>
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#9ca3af;margin-bottom:8px">MindFlow · Duygu Analizi</div>
      <h1>Psikolojik Durum Raporu</h1>
      <div style="margin-top:6px;font-size:13px;color:#6b7280">${userName} · ${now}</div>
    </div>
    <div style="font-size:36px">🍃</div>
  </div>

  <!-- Özet kartlar -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:32px">
    ${[
      { label: "Toplam Sohbet", value: chats.length, color: "#4b5563" },
      { label: "Analiz Edilen", value: `${total} mesaj`, color: "#4b5563" },
      { label: "Baskın Duygu", value: dominantText, color: dominantColor },
      { label: "Ort. Enerji / Stres", value: `${avgEnergy} / ${avgStress}`, color: "#4b5563" },
    ]
      .map(
        (c) => `
      <div style="border:1px solid #f0e8e0;border-radius:12px;padding:16px">
        <div style="font-size:11px;color:#9ca3af;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.06em">${c.label}</div>
        <div style="font-size:20px;font-weight:600;color:${c.color}">${c.value}</div>
      </div>`,
      )
      .join("")}
  </div>

  <!-- Duygu dağılımı -->
  <div style="margin-bottom:32px">
    <h2>Duygu Dağılımı</h2>
    <div style="border:1px solid #f0e8e0;border-radius:12px;overflow:hidden">
      <table>
        <thead><tr>
          <th>Duygu</th><th>Dağılım</th><th style="text-align:center">Adet</th>
        </tr></thead>
        <tbody>${distRows}</tbody>
      </table>
    </div>
  </div>

  <!-- Sohbet geçmişi -->
  <div style="margin-bottom:32px">
    <h2>Sohbet Özeti</h2>
    <div style="border:1px solid #f0e8e0;border-radius:12px;overflow:hidden">
      <table>
        <thead><tr>
          <th>Başlık</th><th style="text-align:center">Tarih</th><th style="text-align:center">Baskın Duygu</th><th style="text-align:center">Mesaj</th>
        </tr></thead>
        <tbody>${chatRows}</tbody>
      </table>
    </div>
  </div>

  <!-- Dipnot -->
  <div style="border-top:1px solid #f0e8e0;padding-top:16px;font-size:11px;color:#d1d5db;text-align:center">
    Bu rapor MindFlow tarafından otomatik oluşturulmuştur · ${now}
  </div>

  <script>window.onload = () => setTimeout(() => window.print(), 400)</script>
</body>
</html>`

  return html
}
