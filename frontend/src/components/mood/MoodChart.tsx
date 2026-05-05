import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { LocalJournal } from "../../types"

export default function MoodChart({ journals }: { journals: LocalJournal[] }) {
  const data = [...journals]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-14)
    .map((j) => ({
      date: new Date(j.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      energy: j.energy ?? 0,
      stress: j.stress ?? 0,
    }))

  if (data.length === 0) {
    return (
      <div className="text-center text-xs text-warm-300 py-6">
        Henüz yeterli veri yok
      </div>
    )
  }

  return (
    <div className="h-36">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fca5a5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fca5a5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#d4c5b3" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#d4c5b3" />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e8dfd4" }}
          />
          <Area type="monotone" dataKey="energy" name="Enerji" stroke="#4ade80" fill="url(#energyGrad)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="stress" name="Stres" stroke="#fca5a5" fill="url(#stressGrad)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
