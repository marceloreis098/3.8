import React, { useState, useRef, useEffect } from 'react';
import Icon from './common/Icon';
import { generateAiReport } from '../services/geminiService';
import { User } from '../types';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

interface AIAssistantProps {
    onClose: () => void;
    currentUser: User;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, currentUser }) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: 'Olá! Como posso ajudar com o inventário hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const response = await generateAiReport(currentInput, currentUser);
            const aiMessage: Message = { sender: 'ai', text: response.report };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            const errorMessage: Message = { sender: 'ai', text: `Desculpe, ocorreu um erro: ${error.message}` };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickPrompts = [
        "Quantos notebooks estão em uso?",
        "Liste todos os equipamentos em estoque.",
        "Quais licenças expiram nos próximos 30 dias?",
        "Qual equipamento está com o usuário 'Marcelo Reis'?",
    ];

    const handleQuickPrompt = (prompt: string) => {
        setInput(prompt);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end sm:items-center z-50">
            <div className="bg-white dark:bg-dark-card rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col animate-fade-in-up">
                <header className="p-4 border-b dark:border-dark-border flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Icon name="Sparkles" className="text-brand-primary" size={24} />
                        <h3 className="text-lg font-bold text-brand-dark dark:text-dark-text-primary">Assistente de IA</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                        <Icon name="X" size={24} />
                    </button>
                </header>

                <main className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                                    <Icon name="Sparkles" size={18} />
                                </div>
                            )}
                            <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-dark-text-primary'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                                <Icon name="Sparkles" size={18} />
                            </div>
                            <div className="max-w-md p-3 rounded-lg bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-dark-text-primary">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </main>

                 <footer className="p-4 border-t dark:border-dark-border bg-white dark:bg-dark-card flex-shrink-0">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {quickPrompts.map(prompt => (
                             <button 
                                key={prompt}
                                onClick={() => handleQuickPrompt(prompt)}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-dark-text-secondary px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSend} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Pergunte algo sobre o inventário..."
                            className="flex-grow p-2 border dark:border-dark-border rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-brand-primary text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            aria-label="Enviar"
                        >
                            <Icon name="Send" size={20} />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default AIAssistant;
