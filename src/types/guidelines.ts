// Guidelines/SOP Types

import { IUser, ProjectType } from './index';

export interface Guideline {
  _id: string;
  name: string;
  slug: string;
  projectType: ProjectType;
  client?: string;
  content: string;
  summary?: string;
  variables: {
    tools?: string[];
    typicalDuration?: string;
    typicalTasks?: string[];
    defaultAssignments?: { taskType: string; role: string; department?: string }[];
    checklistTemplates?: { taskType: string; items: string[] }[];
  };
  version: number;
  isActive: boolean;
  isDefault: boolean;
  createdBy: IUser | string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupedGuidelines {
  [projectType: string]: Guideline[];
}

export interface CreateGuidelineDto {
  name: string;
  projectType: ProjectType;
  content: string;
  client?: string;
  summary?: string;
  variables?: Guideline['variables'];
  isDefault?: boolean;
}

export interface UpdateGuidelineDto extends Partial<CreateGuidelineDto> {
  isActive?: boolean;
}

// SOP Agent Types

export type SOPAgentPhase = 
  | 'greeting' 
  | 'gathering' 
  | 'clarifying' 
  | 'generating' 
  | 'reviewing' 
  | 'completed'
  | 'cancelled';

export interface SOPDraft {
  name?: string;
  projectType?: ProjectType;
  summary?: string;
  typicalTasks: string[];
  tools: string[];
  typicalDuration?: string;
  defaultAssignments?: { taskType: string; role: string; department?: string }[];
  checklistTemplates?: { taskType: string; items: string[] }[];
  notes?: string[];
}

export interface SOPAgentStartResponse {
  sessionId: string;
  response: string;
  phase: SOPAgentPhase;
  conversationId?: string;
}

export interface SOPAgentMessageResponse {
  response: string;
  phase: SOPAgentPhase;
  showConfirmation: boolean;
  draft: SOPDraft;
  generatedContent?: string;
  createdGuideline?: {
    id: string;
    name: string;
    slug: string;
  };
  conversationId?: string;
}

export interface SOPAgentSessionState {
  sessionId: string;
  phase: SOPAgentPhase;
  draft: SOPDraft;
  generatedContent?: string;
}

export interface SOPAgentConfirmResponse {
  guideline: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface SOPConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}


