import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { createChatSession, sendMessageToGemini } from '../services/gemini';
import { Message, ChatState } from '../types';

const ArchitecturalAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '안녕하세요. SEOP 건축의 AI 어시스턴트입니다. 무엇을 도와드릴까요?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [chatState, setChatState] = useState<ChatState>(ChatState.IDLE);

  // Ref to hold the chat session so it persists across renders but isn't part of state
  const chatSessionRef = useRef(createChatSession());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || chatState === ChatState.LOADING) return;

    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatState(ChatState.LOADING);

    try {
      const responseText = await sendMessageToGemini(chatSessionRef.current, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      setChatState(ChatState.IDLE);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the architectural database right now." }]);
      setChatState(ChatState.ERROR);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-50 p-4 bg-black text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group ${isOpen ? 'hidden' : 'flex'} items-center justify-center overflow-hidden`}
      >
        <MessageCircle size={24} strokeWidth={1.5} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-medium">
          Ask SEOP Architecture
        </span>
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[90vw] md:w-[400px] h-[500px] bg-white shadow-2xl z-50 flex flex-col border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
            <div>
              <h3 className="font-semibold text-sm">SEOP Assistant</h3>
              <p className="text-xs text-gray-500">Powered by Gemini 2.0</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-gray-200 p-1 rounded">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 text-sm ${msg.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatState === ChatState.LOADING && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 size={14} className="animate-spin" />
                  Analyzing project data...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 flex gap-2 bg-white">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about materials, concept..."
              className="flex-1 text-sm outline-none border-b border-gray-200 focus:border-black py-2 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={chatState === ChatState.LOADING}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Send size={18} className={chatState === ChatState.LOADING ? 'text-gray-300' : 'text-black'} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ArchitecturalAssistant;