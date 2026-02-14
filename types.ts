
export type City = 'Paris' | 'Milan' | 'London' | 'LA' | 'Aspen';

export interface FashionItem {
  name: string;
  category: string;
  brandHint?: string;
  suggestedAcquisition: string;
}

export interface AnalysisResult {
  identifiedItems: FashionItem[];
  regionalTrends: Record<string, string>;
  agentVerdict: string;
}

export interface PaparazziShot {
  id: string;
  url: string;
  city: City;
  timestamp: number;
  prompt: string;
  analysis?: AnalysisResult;
}

export interface AppState {
  isKeySelected: boolean;
  activeCity: City;
  isGenerating: boolean;
  isAnalyzing: boolean;
  shots: PaparazziShot[];
  selectedShotId: string | null;
  agentName: string;
}
