import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createIdea } from '../api/ideas'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'

const SECTORS = [
  'Technology', 'Healthcare', 'Education', 'Finance',
  'Retail', 'Sustainability', 'Food & Drink', 'Legal',
  'Real Estate', 'Creative', 'Other',
]

const BUSINESS_MODELS = [
  { value: 'subscription', label: 'Subscription', desc: 'Recurring monthly or annual fee' },
  { value: 'marketplace', label: 'Marketplace', desc: 'Commission on transactions' },
  { value: 'one-time', label: 'One-time', desc: 'Single purchase' },
  { value: 'freemium', label: 'Freemium', desc: 'Free tier with paid upgrades' },
]

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer select-none">
      <span className="text-sm text-[#444444]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-[#c8f135]' : 'bg-[#e8e8e8]'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  )
}

export default function SubmitPage() {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [pitch, setPitch] = useState('')
  const [sector, setSector] = useState('')
  const [model, setModel] = useState('')
  const [localComp, setLocalComp] = useState(false)
  const [globalComp, setGlobalComp] = useState(true)
  const [pdfExport, setPdfExport] = useState(false)
  const [deckExport, setDeckExport] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await createIdea({
        title,
        pitch_text: pitch,
        sector,
        business_model: model,
        include_local_competitors: localComp,
        include_global_competitors: globalComp,
        generate_pitch_deck: deckExport,
        export_pdf: pdfExport,
      })
      navigate(`/analysis/${res.data.analysis_id}`)
    } catch (err) {
      const e = err.response?.data
      const status = err.response?.status
      if (e?.error === 'upgrade_required') {
        setError('This feature requires a Pro plan. Please upgrade.')
      } else if (typeof e === 'string' && e.includes('<html')) {
        setError(`Server error (${status}). Check the Django console for the traceback.`)
      } else {
        setError(e?.error || e?.detail || e?.message || err.message || 'Failed to submit. Please try again.')
      }
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = ['Describe', 'Context', 'Analyse']

  return (
    <div className="flex min-h-screen bg-[#f5f5f0]">
      <Sidebar />
      <main className="flex-1 p-8 max-w-2xl">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {stepLabels.map((label, i) => {
            const num = i + 1
            const active = num === step
            const done = num < step
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  done ? 'bg-[#c8f135] text-[#111111]'
                  : active ? 'bg-[#111111] text-white'
                  : 'bg-white border border-[#e8e8e8] text-[#aaaaaa]'
                }`}>
                  {done ? '✓' : num}
                </div>
                <span className={`text-sm font-medium ${active ? 'text-[#1a1a1a]' : 'text-[#aaaaaa]'}`}>{label}</span>
                {i < stepLabels.length - 1 && <div className="w-8 h-px bg-[#e8e8e8] mx-1" />}
              </div>
            )
          })}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-bold text-3xl text-[#1a1a1a] mb-1">Describe your idea</h1>
              <p className="text-[#888888] text-sm italic">Be specific — what problem does it solve and for whom?</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#444444] mb-1.5">Idea title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI-powered legal contract reviewer for SMEs"
                className="w-full bg-white border border-[#e8e8e8] rounded-[8px] px-4 py-2.5 text-[#1a1a1a] placeholder-[#aaaaaa] text-sm focus:outline-none focus:border-[#c8f135] transition-colors"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#444444]">Pitch description</label>
                <span className={`text-xs ${pitch.length > 580 ? 'text-amber-600' : 'text-[#aaaaaa]'}`}>
                  {pitch.length}/600
                </span>
              </div>
              <textarea
                value={pitch}
                onChange={(e) => setPitch(e.target.value.slice(0, 600))}
                rows={7}
                placeholder="Describe your startup idea in detail. Include the problem, your solution, target customers, and what makes it unique."
                className="w-full bg-white border border-[#e8e8e8] rounded-[8px] px-4 py-3 text-[#1a1a1a] placeholder-[#aaaaaa] text-sm focus:outline-none focus:border-[#c8f135] transition-colors resize-none"
              />
            </div>
            <button
              disabled={!title.trim() || pitch.trim().length < 20}
              onClick={() => setStep(2)}
              className="bg-[#c8f135] text-[#111111] px-6 py-2.5 rounded-[10px] text-sm font-bold hover:bg-[#b8e020] transition-colors disabled:opacity-40"
            >
              Next: Add context →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-bold text-3xl text-[#1a1a1a] mb-1">Add context</h1>
              <p className="text-[#888888] text-sm italic">Help the AI produce a more accurate analysis.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#444444] mb-3">Sector</label>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSector(s)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all font-medium ${
                      sector === s
                        ? 'bg-[#c8f135] border-[#c8f135] text-[#111111]'
                        : 'bg-white border-[#e8e8e8] text-[#666666] hover:border-[#c8f135]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#444444] mb-3">Business model</label>
              <div className="grid grid-cols-2 gap-3">
                {BUSINESS_MODELS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setModel(m.value)}
                    className={`text-left p-4 rounded-[12px] border-2 transition-all ${
                      model === m.value
                        ? 'bg-white border-[#c8f135]'
                        : 'bg-white border-[#e8e8e8] hover:border-[#c8f135]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {model === m.value && (
                        <span className="w-2 h-2 rounded-full bg-[#c8f135] flex-shrink-0" />
                      )}
                      <div className={`font-semibold text-sm ${model === m.value ? 'text-[#1a1a1a]' : 'text-[#444444]'}`}>
                        {m.label}
                      </div>
                    </div>
                    <div className="text-[#888888] text-xs">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#e8e8e8] rounded-[16px] p-5 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <Toggle label="Include local competitors (UK-based)" checked={localComp} onChange={setLocalComp} />
              <Toggle label="Include global competitors" checked={globalComp} onChange={setGlobalComp} />
              <Toggle label="Export as PDF report" checked={pdfExport} onChange={setPdfExport} />
              <Toggle label="Generate pitch deck" checked={deckExport} onChange={setDeckExport} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-[10px] text-sm font-medium text-[#888888] bg-white border border-[#e8e8e8] hover:text-[#444444] transition-colors"
              >
                ← Back
              </button>
              <button
                disabled={!sector || !model}
                onClick={() => setStep(3)}
                className="bg-[#c8f135] text-[#111111] px-6 py-2.5 rounded-[10px] text-sm font-bold hover:bg-[#b8e020] transition-colors disabled:opacity-40"
              >
                Review & submit →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-bold text-3xl text-[#1a1a1a] mb-1">Ready to analyse</h1>
              <p className="text-[#888888] text-sm italic">Review your submission before running the analysis.</p>
            </div>

            <div className="bg-white border border-[#e8e8e8] rounded-[16px] p-5 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <Row label="Title" value={title} />
              <Row label="Sector" value={sector} />
              <Row label="Business model" value={model} />
              <Row label="Local competitors" value={localComp ? 'Yes' : 'No'} />
              <Row label="Global competitors" value={globalComp ? 'Yes' : 'No'} />
              <Row label="PDF export" value={pdfExport ? 'Yes' : 'No'} />
              <Row label="Pitch deck" value={deckExport ? 'Yes' : 'No'} />
              <div className="pt-2 border-t border-[#e8e8e8]">
                <div className="text-xs text-[#888888] mb-1.5">Pitch description</div>
                <p className="text-sm text-[#444444] leading-relaxed">{pitch}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-[10px] text-sm font-medium text-[#888888] bg-white border border-[#e8e8e8] hover:text-[#444444] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#c8f135] text-[#111111] px-8 py-2.5 rounded-[10px] text-sm font-bold hover:bg-[#b8e020] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#111111]/30 border-t-[#111111] rounded-full animate-spin" />
                    Starting analysis…
                  </>
                ) : (
                  'Run analysis →'
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#888888]">{label}</span>
      <span className="text-[#1a1a1a] font-medium">{value}</span>
    </div>
  )
}
