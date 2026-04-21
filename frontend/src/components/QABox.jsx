import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../api/analysis'

export default function QABox({ analysisId, messages, onNewMessages }) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setError(null)
    setInput('')
    try {
      const res = await sendChatMessage(analysisId, text)
      onNewMessages(res.data.user_message, res.data.assistant_message)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to send message.'
      setError(msg)
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-[16px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="px-5 py-4 border-b border-[#e8e8e8]">
        <h3 className="text-[#1a1a1a] font-semibold">Ask about this analysis</h3>
        <p className="text-[#888888] text-sm">Ask any question about this startup idea or the analysis results.</p>
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-4 bg-[#f8f8f8]">
        {messages.length === 0 && (
          <div className="text-center text-[#aaaaaa] text-sm py-8">
            No messages yet. Ask a question to get started.
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-[12px] px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#111111] text-white'
                  : 'bg-white text-[#444444] border border-[#e8e8e8]'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#e8e8e8] rounded-[12px] px-4 py-3 text-sm text-[#888888]">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="p-4 border-t border-[#e8e8e8] flex gap-3 bg-white">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask a question about this idea..."
          rows={2}
          className="flex-1 bg-[#f8f8f8] border border-[#e8e8e8] rounded-[8px] px-3 py-2 text-sm text-[#1a1a1a] placeholder-[#aaaaaa] resize-none focus:outline-none focus:border-[#c8f135] transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="px-4 py-2 bg-[#c8f135] text-[#111111] rounded-[8px] text-sm font-bold disabled:opacity-40 hover:bg-[#b8e020] transition-colors self-end"
        >
          Send
        </button>
      </div>
    </div>
  )
}
