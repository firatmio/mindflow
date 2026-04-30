import { useState, useRef } from "react"
import { Volume2, VolumeX } from "lucide-react"

const AMBIENT_URL = "https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3"

export default function AmbientSound() {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function toggle() {
    if (!audioRef.current) {
      audioRef.current = new Audio(AMBIENT_URL)
      audioRef.current.loop = true
      audioRef.current.volume = 0.4
    }
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors text-sm cursor-pointer"
    >
      {playing ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      {playing ? "Ses Açık" : "Ses Kapalı"}
    </button>
  )
}
