import { useEffect, useState } from 'react'

const STEPS = [
  'Scoring viability…',
  'Mapping competitors…',
  'Building personas…',
  'Analysing market…',
  'Finalising report…',
]

export default function LoadingScreen({ status }) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-[#e8e8e8]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#c8f135] animate-spin" />
        <div className="absolute inset-3 rounded-full bg-[#f7fee7] flex items-center justify-center">
          <svg className="w-6 h-6 text-[#c8f135]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <h2 className="font-bold text-2xl text-[#1a1a1a] mb-2">Analysing your idea</h2>
        <p className="text-[#888888] text-sm h-6 transition-all duration-300">{STEPS[stepIndex]}</p>
      </div>

      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === stepIndex ? 'bg-[#c8f135] scale-125' : 'bg-[#e8e8e8]'
            }`}
          />
        ))}
      </div>

      <p className="text-[#aaaaaa] text-xs">This usually takes 15–30 seconds</p>
    </div>
  )
}
