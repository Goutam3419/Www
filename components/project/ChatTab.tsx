'use client';

import React, { useState } from 'react';
import { Project, ProjectChatMessage } from '@/packages/types/src';
import { Button } from '@/components/ui/Button';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatTabProps {
  project: Project;
  messages: ProjectChatMessage[];
  onSendMessage: (content: string) => Promise<void>;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  project,
  messages,
  onSendMessage
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const msg = input.trim();
    setInput('');
    setLoading(true);
    await onSendMessage(msg);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-3.5 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              AI CEO Chat — <span className="text-indigo-400">{project.name}</span>
            </h3>
            <p className="text-[11px] text-zinc-400">Isolated project workspace session context</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Model: Gemini 3.6 Flash (Server-Side)</span>
        </div>
      </div>

      {/* Quick Prompt Bar */}
      <div className="px-6 py-2 bg-zinc-950/80 border-b border-zinc-800/40 flex items-center space-x-2 overflow-x-auto scrollbar-none text-[11px]">
        <span className="text-zinc-500 font-medium">Quick Tasks:</span>
        {[
          'Generate System Architecture',
          'Create Next.js API Proxy',
          'Audit Database Security',
          'Draft Project Milestone Plan'
        ].map(promptText => (
          <button
            key={promptText}
            onClick={() => {
              setInput(promptText);
            }}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-md border border-zinc-800 transition-colors whitespace-nowrap"
          >
            + {promptText}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500 space-y-3">
            <Bot className="w-10 h-10 text-indigo-500/40 stroke-1" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-300">Start Project Discussion</p>
              <p className="text-xs text-zinc-500 max-w-sm">
                Describe your requirements or design questions for &quot;{project.name}&quot;.
              </p>
            </div>
          </div>
        ) : (
          messages.map(msg => {
            const isUser = msg.sender === 'USER' || msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border ${
                    isUser
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                      : 'bg-indigo-950 border-indigo-700/60 text-indigo-300'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed border space-y-1.5 ${
                    isUser
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-zinc-900/90 text-zinc-200 border-zinc-800 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-70 border-b border-white/10 pb-1">
                    <span className="font-semibold">{msg.senderName || msg.name || (isUser ? 'User' : 'Assistant')}</span>
                    <span>{new Date(msg.createdAt || msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content || msg.text || ''}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-4 bg-zinc-900/80 border-t border-zinc-800/80 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Instruct AI CEO for "${project.name}"...`}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <Button type="submit" disabled={loading || !input.trim()} size="md">
          <Send className="w-4 h-4 mr-1.5" />
          <span>Send</span>
        </Button>
      </form>
    </div>
  );
};
