import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, Copy, Check } from 'lucide-react';
import type { Message, AgentConfig } from './types';

export default function App() {
  const [config, setConfig] = useState<AgentConfig>(() => {
    const savedConfig = localStorage.getItem('agent_config');
    return savedConfig ? JSON.parse(savedConfig) : {
      name: 'The Architect',
      systemInstruction: 'You are a highly intellectual and philosophical AI assistant, specializing in agentic architecture. Answer thoughtfully, adopting an editorial and authoritative tone.',
    };
  });
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('agent_messages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  useEffect(() => {
    localStorage.setItem('agent_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('agent_messages', JSON.stringify(messages));
  }, [messages]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          systemInstruction: config.systemInstruction,
          history: messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.text,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F9F8F6] text-[#1A1A1A] font-sans overflow-hidden border-[12px] border-white select-none shadow-inner">
      
      {/* Sidebar - Configuration */}
      <div className="w-80 border-r border-[#1A1A1A] flex flex-col bg-[#F9F8F6] z-10">
        <div className="p-8 border-b border-[#1A1A1A] flex flex-col gap-2">
          <div className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase flex justify-between items-center">
            <span>Volume 01</span>
            {messages.length > 0 && (
              <button 
                onClick={() => setMessages([])} 
                className="text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors underline underline-offset-2"
                title="Clear Chat History"
              >
                Clear History
              </button>
            )}
          </div>
          <h1 className="font-serif italic text-3xl">Agent Builder</h1>
          <div className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#1A1A1A]/60">Configuration</div>
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-12">
          <div className="space-y-4">
            <label className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase flex items-center gap-3">
              <span className="w-6 h-[1px] bg-[#1A1A1A]"></span>
              Agent Name
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="w-full bg-transparent border-b border-[#1A1A1A] pb-2 text-xl font-serif focus:outline-none transition-colors rounded-none placeholder:text-[#1A1A1A]/30"
              placeholder="e.g. The Architect"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase flex items-center gap-3">
              <span className="w-6 h-[1px] bg-[#1A1A1A]"></span>
              Persona Directives
            </label>
            <textarea
              value={config.systemInstruction}
              onChange={(e) => setConfig({ ...config, systemInstruction: e.target.value })}
              rows={10}
              className="w-full bg-white border border-[#1A1A1A] p-5 text-sm font-sans focus:outline-none transition-colors resize-none leading-relaxed placeholder:text-[#1A1A1A]/30 shadow-sm"
              placeholder="Describe the agent's behavior..."
            />
            <p className="text-[10px] font-sans uppercase tracking-[0.1em] text-[#1A1A1A]/60 mt-4 leading-relaxed font-bold">
              Define the identity. Generalists are mediocre. Specialists are indispensable.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F9F8F6] relative">
        
        {/* Chat Header */}
        <header className="h-24 border-b border-[#1A1A1A] flex items-center justify-between px-10 bg-[#F9F8F6] shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-[#1A1A1A] flex items-center justify-center text-[#F9F8F6]">
              <Bot size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-serif italic text-3xl text-[#1A1A1A]">{config.name}</h2>
              <p className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase mt-1">System Status: Optimal</p>
            </div>
          </div>
          <div className="hidden md:flex gap-8 text-[9px] font-sans uppercase tracking-widest text-[#1A1A1A]/60">
            <span>Copyright 2026</span>
            <span>AI Intelligence Systems</span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center max-w-2xl mx-auto">
              <div className="text-[80px] md:text-[100px] leading-[0.85] font-serif font-black tracking-tighter mb-10 text-[#1A1A1A]">
                WHERE <br/> TO BEGIN.
              </div>
              <p className="text-xl md:text-2xl font-serif italic leading-relaxed text-[#1A1A1A]/80 max-w-lg border-l-4 border-[#1A1A1A] pl-8">
                "The transition from static code to agentic reasoning begins with a single defined objective."
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-10">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-8 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-12 h-12 flex items-center justify-center shrink-0 border-2 border-[#1A1A1A] ${
                      msg.role === 'user'
                        ? 'bg-white text-[#1A1A1A]'
                        : 'bg-[#1A1A1A] text-[#F9F8F6]'
                    }`}
                  >
                    {msg.role === 'user' ? <User size={20} strokeWidth={1.5} /> : <Bot size={20} strokeWidth={1.5} />}
                  </div>
                  <div
                    className={`max-w-[80%] relative ${
                      msg.role === 'user'
                        ? 'bg-white border-2 border-[#1A1A1A] px-6 py-5 text-[15px] font-sans text-[#1A1A1A] leading-relaxed shadow-[4px_4px_0px_rgba(26,26,26,1)]'
                        : 'bg-[#1A1A1A] text-[#F9F8F6] p-8 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] group/message'
                    }`}
                  >
                    {msg.role === 'model' && (
                      <div className="uppercase text-[10px] tracking-[0.4em] font-sans font-bold mb-6 opacity-70 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-[1px] bg-[#F9F8F6]/50"></span>
                          {config.name} // Response
                        </div>
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="opacity-0 group-hover/message:opacity-100 transition-opacity hover:text-white flex items-center gap-2 px-2 py-1 border border-transparent hover:border-[#F9F8F6]/30"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check size={14} />
                              <span className="tracking-[0.2em]">COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span className="tracking-[0.2em]">COPY</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    <div className={`whitespace-pre-wrap ${msg.role === 'model' ? 'text-lg font-serif leading-relaxed' : ''}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-8">
                  <div className="w-12 h-12 bg-[#1A1A1A] text-[#F9F8F6] flex items-center justify-center shrink-0">
                    <Loader2 size={20} className="animate-spin" strokeWidth={1.5} />
                  </div>
                  <div className="bg-[#1A1A1A] border border-[#1A1A1A] px-8 py-6 flex items-center shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                    <span className="text-[10px] font-sans uppercase tracking-[0.4em] text-[#F9F8F6] animate-pulse font-bold">
                      Synthesizing...
                    </span>
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-[4px_4px_0px_rgba(26,26,26,1)]">
                  <div className="uppercase text-[10px] tracking-[0.4em] font-sans mb-3 text-[#1A1A1A] font-bold flex items-center gap-3">
                    <span className="w-4 h-[1px] bg-[#1A1A1A]"></span>
                    System Error
                  </div>
                  <div className="text-sm font-sans text-[#1A1A1A] font-medium">
                    {error}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 bg-[#F9F8F6] border-t border-[#1A1A1A] shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto relative flex items-center group"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="ENTER YOUR DIRECTIVE..."
              className="w-full bg-white border-2 border-[#1A1A1A] pl-6 pr-16 py-5 font-sans text-sm focus:outline-none focus:shadow-[4px_4px_0px_rgba(26,26,26,1)] transition-all text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 placeholder:tracking-[0.2em] rounded-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 p-3 bg-[#1A1A1A] text-[#F9F8F6] hover:bg-black disabled:opacity-50 transition-colors"
            >
              <Send size={18} strokeWidth={1.5} />
            </button>
          </form>
          <div className="flex justify-between items-center max-w-4xl mx-auto mt-6">
            <div className="text-[9px] font-sans uppercase tracking-[0.4em] text-[#1A1A1A]/60 font-bold">
              Ref. No. AGENT-9942-B
            </div>
            <div className="text-[9px] font-sans uppercase tracking-[0.4em] text-[#1A1A1A]/60 font-bold">
              Powered by Google Gemini
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
