'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send, Settings } from 'lucide-react';
import { AIService, AICommand } from '@/lib/ai-service';
import { useStore } from '@/lib/store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const { equipment, addEquipment, updateEquipment } = useStore();
  const aiService = React.useRef(new AIService()).current;

  // Load API key on mount
  React.useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    aiService.setApiKey(apiKey);
    setShowSettings(false);
    addMessage('assistant', 'API key saved! You can now use AI commands.');
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    addMessage('user', userMessage);

    setIsLoading(true);
    try {
      let command: AICommand;

      // Check if API key is configured
      if (!localStorage.getItem('openrouter_api_key')) {
        // Use local processing
        command = aiService.processCommandLocally(userMessage, equipment);
      } else {
        // Use AI API
        try {
          command = await aiService.processCommand(userMessage, equipment);
        } catch (error) {
          // Fallback to local if API fails
          console.error('API failed, using local processing:', error);
          command = aiService.processCommandLocally(userMessage, equipment);
        }
      }

      // Process the command
      if (command.type === 'add' && command.equipmentType) {
        const newEquipment = {
          id: `${command.equipmentType}-${Date.now()}`,
          type: command.equipmentType,
          position: command.position || { x: 200, y: 200 },
          properties: command.properties || {
            name: `${command.equipmentType}-${Date.now().toString().slice(-3)}`,
            status: 'offline' as const,
          },
        };
        addEquipment(newEquipment);
      }

      if (command.type === 'list') {
        const list = equipment.map(eq => `• ${eq.properties.name} (${eq.type})`).join('\n');
        addMessage('assistant', list || 'No equipment found.');
        setIsLoading(false);
        return;
      }

      if (command.message) {
        addMessage('assistant', command.message);
      }
    } catch (error) {
      addMessage('assistant', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
        <h3 className="font-semibold">AI Assistant</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="hover:bg-blue-600 p-1 rounded"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-blue-600 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 p-4 border-b">
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">OpenRouter API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <button
            onClick={handleSaveApiKey}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
          >
            Save Key
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Get your key at{' '}
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              openrouter.ai
            </a>
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="mb-2">Try these commands:</p>
            <p className="text-sm">• "Add a pump"</p>
            <p className="text-sm">• "Create a new valve"</p>
            <p className="text-sm">• "List all equipment"</p>
          </div>
        )}
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <p className="text-gray-500">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}