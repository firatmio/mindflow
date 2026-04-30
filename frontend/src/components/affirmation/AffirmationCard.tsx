import type { AffirmationResponse } from "../../types"
import { Sparkles } from "lucide-react"

export default function AffirmationCard({ data }: { data: AffirmationResponse | null }) {
  if (!data) return null

  return (
    <div className="bg-gradient-to-br from-calm-50 to-accent-light rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-calm-600 text-xs font-medium">
        <Sparkles className="w-3.5 h-3.5" />
        Günün Olumlaması
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">
        {data.affirmation}
      </p>

      {data.suggestions.length > 0 && (
        <ul className="space-y-1">
          {data.suggestions.map((s, i) => (
            <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
              <span className="text-calm-400 mt-0.5">•</span>
              {s}
            </li>
          ))}
        </ul>
      )}

      {data.quote && (
        <div className="border-t border-calm-200/50 pt-2 mt-2">
          <p className="text-xs italic text-gray-400">
            "{data.quote.translated || data.quote.original}"
          </p>
          {data.quote.author && (
            <p className="text-[10px] text-gray-400 mt-0.5">— {data.quote.author}</p>
          )}
        </div>
      )}
    </div>
  )
}
