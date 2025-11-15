import React, { useState, useEffect } from 'react';
import Icon from './common/Icon';
import AIAssistant from './AIAssistant';
import { checkGeminiStatus } from '../services/geminiService';
import { User } from '../types';

interface AIAssistantWidgetProps {
    currentUser: User;
}

const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({ currentUser }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isApiConfigured, setIsApiConfigured] = useState(false);

    useEffect(() => {
        const verifyApiStatus = async () => {
            try {
                const status = await checkGeminiStatus();
                setIsApiConfigured(status.hasApiKey);
            } catch (error) {
                console.error("Failed to check Gemini API status:", error);
                setIsApiConfigured(false);
            }
        };
        verifyApiStatus();
    }, []);

    if (!isApiConfigured) {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-br from-purple-600 to-blue-500 text-white p-4 rounded-full shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 z-40"
                title="Assistente de IA"
                aria-label="Abrir assistente de IA"
            >
                <Icon name="Sparkles" size={28} />
            </button>
            {isChatOpen && <AIAssistant onClose={() => setIsChatOpen(false)} currentUser={currentUser} />}
        </>
    );
};

export default AIAssistantWidget;
