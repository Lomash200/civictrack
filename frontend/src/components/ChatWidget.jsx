import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react'
import api from '../api/axios'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your CivicTrack assistant. Ask me how to raise a complaint, track its status, or anything about the portal." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const { data } = await api.post('/ai/chat', { message: text })
      setMessages((m) => [...m, { role: 'assistant', text: data.result }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: "Sorry, I couldn't reach the assistant right now." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 h-96 bg-white rounded-xl2 shadow-card border border-slate-200 flex flex-col overflow-hidden">
          <div className="bg-civic-900 text-white px-4 py-3 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <span className="font-display font-semibold text-sm">AI Assistant</span>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/60 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] text-sm px-3 py-2 rounded-lg ${
                  m.role === 'user'
                    ? 'bg-civic-800 text-white ml-auto rounded-br-sm'
                    : 'bg-civic-100 text-slate-800 rounded-bl-sm'
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="bg-civic-100 text-slate-500 text-sm px-3 py-2 rounded-lg rounded-bl-sm w-fit flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" /> thinking…
              </div>
            )}
          </div>
          <div className="p-2.5 border-t border-slate-200 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask a question…"
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-civic-800"
            />
            <button onClick={send} className="w-9 h-9 shrink-0 rounded-lg bg-civic-800 text-white flex items-center justify-center hover:bg-civic-700">
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-civic-950 shadow-card flex items-center justify-center transition-transform hover:scale-105"
        aria-label="Open AI assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  )
}
