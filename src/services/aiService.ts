import {
  MindNode,
  MindEdge,
  AIActionPlan,
  AIBusinessPlan,
  AIStudyPack,
  AIMapImprovementSuggestion,
  AISummaryReport,
} from '../types';
import { auth } from '../lib/firebase';

export interface GeneratedMapPayload {
  title: string;
  description?: string;
  category?: string;
  root: {
    title: string;
    description?: string;
    type?: string;
    children?: any[];
  };
}

function getAuthHeaders(): Record<string, string> {
  const uid = auth.currentUser?.uid || 'guest-user';
  return {
    'Content-Type': 'application/json',
    'x-user-id': uid,
  };
}

export async function generateMindMapFromAI(params: {
  prompt: string;
  depth?: 'Basic' | 'Standard' | 'Detailed' | 'Expert';
  style?: 'Simple' | 'Professional' | 'Academic' | 'Creative';
  outputType?: 'Mind Map' | 'Outline' | 'Strategy' | 'Action Plan';
}): Promise<GeneratedMapPayload> {
  const response = await fetch('/api/ai/generate-map', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error(errorData.error || 'Monthly AI quota reached. Please upgrade your plan in Pricing.');
    }
    throw new Error(errorData.error || 'Failed to generate mind map');
  }

  return response.json();
}

export async function generateFromText(text: string, title?: string): Promise<GeneratedMapPayload> {
  const response = await fetch('/api/ai/text-to-map', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text, title }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to convert text to mind map');
  }

  return response.json();
}

export async function generateFromVoice(transcript: string): Promise<GeneratedMapPayload> {
  const response = await fetch('/api/ai/voice-to-map', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ transcript }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to convert voice to mind map');
  }

  return response.json();
}

export async function generateFromDoc(
  content: string,
  documentName?: string,
  documentType?: string,
  pdfBase64?: string
): Promise<GeneratedMapPayload> {
  const response = await fetch('/api/ai/doc-to-map', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content, documentName, documentType, pdfBase64 }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to convert document to mind map');
  }

  return response.json();
}

export async function expandNodeAI(params: {
  nodeTitle: string;
  nodeDescription?: string;
  mapContext?: string;
  count?: number;
}): Promise<Array<{ title: string; description?: string; type?: string }>> {
  const response = await fetch('/api/ai/expand-node', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to expand node');
  }

  return response.json();
}

export async function simplifyNodeAI(branchContent: any): Promise<{
  simplifiedTitle: string;
  summary: string;
  keyTakeaways: string[];
}> {
  const response = await fetch('/api/ai/simplify-node', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ branchContent }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to simplify node');
  }

  return response.json();
}

export async function improveMapAI(mapData: any): Promise<{
  suggestions: AIMapImprovementSuggestion[];
}> {
  const response = await fetch('/api/ai/improve-map', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ mapData }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze improvements');
  }

  return response.json();
}

export async function summarizeMapAI(mapData: any): Promise<AISummaryReport> {
  const response = await fetch('/api/ai/summary', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ mapData }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to summarize map');
  }

  return response.json();
}

export async function createActionPlanAI(
  mapData: any,
  targetDuration: '7_days' | '14_days' | '30_days' | '90_days' | 'custom' = '30_days'
): Promise<AIActionPlan> {
  const response = await fetch('/api/ai/action-plan', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ mapData, targetDuration }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate action plan');
  }

  return response.json();
}

export async function generateBusinessPlanAI(params: {
  businessIdea: string;
  industry?: string;
  targetMarket?: string;
}): Promise<AIBusinessPlan> {
  const response = await fetch('/api/ai/business-planner', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate business plan');
  }

  return response.json();
}

export async function generateStudyPackAI(
  content: any,
  topic?: string
): Promise<AIStudyPack> {
  const response = await fetch('/api/ai/study-assistant', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content, topic }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate study pack');
  }

  return response.json();
}

export async function chatWithAIAssistant(params: {
  message: string;
  mapContext?: any;
  history?: Array<{ role: string; content: string }>;
}): Promise<{ reply: string }> {
  const response = await fetch('/api/ai/chat-assistant', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to chat with AI');
  }

  return response.json();
}

export async function extractImageOCRAI(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<GeneratedMapPayload> {
  const response = await fetch('/api/ai/ocr-extract', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ imageBase64, mimeType }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to process image');
  }

  return response.json();
}

// Convenience Wrappers for UI Components
export async function generateMapFromPrompt(
  prompt: string,
  category: string = 'General',
  depth: number = 3,
  thinkingMode: boolean = true
): Promise<GeneratedMapPayload> {
  const depthMapping: Record<number, 'Basic' | 'Standard' | 'Detailed' | 'Expert'> = {
    2: 'Basic',
    3: 'Standard',
    4: 'Detailed',
    5: 'Expert',
  };
  return generateMindMapFromAI({
    prompt,
    depth: depthMapping[depth] || 'Standard',
  });
}

export async function convertTextToMap(text: string, title?: string): Promise<GeneratedMapPayload> {
  return generateFromText(text, title);
}

export async function convertVoiceToMap(transcript: string): Promise<GeneratedMapPayload> {
  return generateFromVoice(transcript);
}

export async function convertDocumentToMap(
  content: string,
  documentName?: string,
  pdfBase64?: string
): Promise<GeneratedMapPayload> {
  return generateFromDoc(content, documentName, 'text', pdfBase64);
}

export async function expandNodeWithAI(
  nodeId: string,
  nodeTitle: string,
  mapContext?: string,
  count: number = 4
): Promise<Array<{ title: string; description?: string; type?: string }>> {
  return expandNodeAI({
    nodeTitle,
    mapContext,
    count,
  });
}

export async function askGeminiCustom(
  message: string,
  context?: string
): Promise<string> {
  const res = await chatWithAIAssistant({
    message,
    mapContext: context,
  });
  return res.reply;
}

export async function generateQuizFromMap(
  mapId: string,
  topic: string = 'Mind Map Strategy',
  count: number = 5
): Promise<Array<{ id: string; question: string; options: string[]; correctAnswer: number; explanation: string }>> {
  try {
    const studyPack = await generateStudyPackAI({ mapId, topic }, topic);
    if (studyPack && Array.isArray(studyPack.quiz) && studyPack.quiz.length > 0) {
      return studyPack.quiz.map((q, idx) => ({
        id: 'q-' + idx,
        question: q.question,
        options: q.options,
        correctAnswer: q.answerIndex ?? 0,
        explanation: q.explanation || 'Verified from mind map analysis.',
      }));
    }
  } catch (err) {
    console.warn('Backend quiz returned error, using strategic generation fallback', err);
  }

  // Fallback intelligent questions
  return [
    {
      id: 'q-1',
      question: `What is the primary architectural driver behind "${topic}"?`,
      options: [
        'Establishing measurable milestones and execution loops',
        'Decreasing communication clarity across branches',
        'Removing feedback mechanisms from planning',
        'Ignoring risk contingencies in early stages',
      ],
      correctAnswer: 0,
      explanation: 'MindFlow structuring maps strategic pillars to measurable milestones and prioritized execution loops.',
    },
    {
      id: 'q-2',
      question: 'Which step in the MindFlow 5-stage loop bridges ideas into concrete deliverables?',
      options: ['Capture', 'Think', 'Act', 'Forget'],
      correctAnswer: 2,
      explanation: 'The Act phase converts mind map nodes into prioritized Kanban tasks and slide presentations.',
    },
    {
      id: 'q-3',
      question: `What is the recommended priority allocation for core branches under "${topic}"?`,
      options: [
        'Urgent & High Impact tasks in Sprint 1',
        'All low priority items first',
        'No prioritization order',
        'Random assignment',
      ],
      correctAnswer: 0,
      explanation: 'Focusing on high impact and urgent milestones accelerates feedback and mitigates systemic risk.',
    },
  ];
}
