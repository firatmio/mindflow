import { useState, useEffect } from "react"

const phases = [
  { label: "Nefes al...", duration: 4000 },
  { label: "Tut...", duration: 7000 },
  { label: "Nefes ver...", duration: 8000 },
]

export default function BreathingCircle() {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const phase = phases[phaseIndex]

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhaseIndex((p) => (p + 1) % phases.length)
    }, phase.duration)
    return () => clearTimeout(timer)
  }, [phaseIndex, phase.duration])

  const scale = phaseIndex === 0 ? "scale-[1.8]" : phaseIndex === 1 ? "scale-[1.8]" : "scale-100"

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        <div
          className={`w-32 h-32 rounded-full bg-gradient-to-br from-calm-400/40 to-accent/40 transition-transform ${scale}`}
          style={{ transitionDuration: `${phase.duration}ms`, transitionTimingFunction: "ease-in-out" }}
        />
        <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-calm-300/20 to-accent/20 animate-pulse" />
      </div>
      <p className="text-white/80 text-xl font-light tracking-wide">
        {phase.label}
      </p>
    </div>
  )
}
