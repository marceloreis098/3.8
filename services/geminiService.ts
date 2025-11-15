import { Equipment, License, User } from '../types';
// FIX: Changed import from checkApiStatus to checkGeminiStatus to resolve the type mismatch.
// The checkGeminiStatus function from apiService returns the expected { hasApiKey: boolean } object.
import { getEquipment, getLicenses, checkGeminiStatus as checkStatus, generateAiReport as generateReport } from './apiService';


// This service acts as a facade for AI-related API calls.
export const checkGeminiStatus = (): Promise<{ hasApiKey: boolean }> => {
    return checkStatus();
};

export const generateAiReport = async (prompt: string, currentUser: User): Promise<{ report: string }> => {
    // Fetch latest data to provide context to the AI
    const [equipmentData, licensesData] = await Promise.all([
        getEquipment(currentUser),
        getLicenses(currentUser)
    ]);
    
    return generateReport(prompt, equipmentData, licensesData);
};