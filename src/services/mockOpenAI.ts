import { SearchResponse } from '@/types';

// Mock OpenAI responses for demonstration
const mockResponses: { [key: string]: SearchResponse } = {
  'artificial intelligence job markets': {
    answer: 'Recent AI developments include large language models like GPT-4, computer vision advances, and automation tools. These technologies are creating new job categories in AI engineering and data science while potentially displacing routine tasks in customer service, data entry, and basic analysis roles.',
    sources: ['TechCrunch AI Report 2024', 'MIT Technology Review', 'World Economic Forum'],
    confidence: 0.85
  },
  'renewable energy policies economic': {
    answer: 'Global renewable energy policies are accelerating with the EU\'s Green Deal, US Inflation Reduction Act, and China\'s carbon neutrality goals. Economic implications include $4.5 trillion in clean energy investments by 2030, job creation in green sectors, and potential stranded assets in fossil fuel industries.',
    sources: ['International Energy Agency', 'Bloomberg New Energy Finance', 'UN Climate Report'],
    confidence: 0.92
  },
  'remote work fortune 500': {
    answer: 'Fortune 500 companies are increasingly adopting hybrid work models, with 78% offering flexible arrangements. Companies like Microsoft, Google, and Apple have implemented permanent remote options, while financial firms like JPMorgan are requiring more in-office presence.',
    sources: ['McKinsey Global Institute', 'Harvard Business Review', 'Workplace Analytics'],
    confidence: 0.88
  },
  'blockchain banking integration': {
    answer: 'Traditional banks are integrating blockchain through central bank digital currencies (CBDCs), cross-border payments (JPMorgan\'s JPM Coin), and trade finance. Major implementations include Wells Fargo\'s digital cash and Bank of America\'s blockchain patents.',
    sources: ['Deloitte Banking Report', 'Federal Reserve Papers', 'Accenture Blockchain Study'],
    confidence: 0.79
  }
};

export const mockOpenAISearch = async (query: string): Promise<SearchResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  
  const lowerQuery = query.toLowerCase();
  
  // Find best matching response
  for (const [key, response] of Object.entries(mockResponses)) {
    if (lowerQuery.includes(key.split(' ')[0]) || key.split(' ').some(word => lowerQuery.includes(word))) {
      return response;
    }
  }
  
  // Default response for unmatched queries
  return {
    answer: `Based on current trends and available data, here's what I found about "${query}": This topic involves multiple factors including technological advancement, policy changes, and market dynamics. Current research suggests emerging patterns that require further analysis and monitoring of key indicators.`,
    sources: ['Research Database', 'Industry Reports', 'Academic Studies'],
    confidence: 0.65
  };
};