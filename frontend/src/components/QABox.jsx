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
    <div className="bg-bg-card border border-border-subtle rounded-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle">
        <h3 className="text-text-primary font-medium">Ask about this analysis</h3>
        <p className="text-text-muted text-sm">Ask any question about this startup idea or the analysis results.</p>
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-text-muted text-sm py-8">
            No messages yet. Ask a question to get started.
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-card px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-border-subtle text-text-body'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-border-subtle rounded-card px-4 py-3 text-sm text-text-muted">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-danger/10 border-t border-danger/30 text-danger text-sm">
          {error}
        </div>
      )}

      <div className="p-4 border-t border-border-subtle flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask a question about this idea..."
          rows={2}
          className="flex-1 bg-bg-primary border border-border-input rounded-chip px-3 py-2 text-sm text-text-primary placeholder-text-hint resize-none focus:outline-none focus:border-accent transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="px-4 py-2 bg-accent text-white rounded-chip text-sm font-medium disabled:opacity-40 hover:bg-accent/90 transition-colors self-end"
        >
          Send
        </button>
      </div>
    </div>
  )
}
