// ============================================
// SOP Types (Knowledge Base documents with category: 'sop')
// ============================================

/**
 * SOP (Standard Operating Procedure) stored as a Knowledge Base document.
 * SOPs are indexed in Google's File Search vector store for semantic search,
 * enabling AI agents to find and use relevant SOPs when creating tickets and projects.
 */
export interface SOP {
  _id: string;
  title: string;
  content: string;
  category: 'sop';
  contentType: 'markdown' | 'text' | 'html';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  isActive: boolean;
  isIndexed: boolean;
  /** Google File Search document ID for vector search */
  googleFileSearchDocId?: string;
}

/**
 * Minimal SOP reference used in agent responses
 */
export interface SOPReference {
  id: string;
  title: string;
}

/**
 * Request body for creating a new SOP
 */
export interface CreateSOPRequest {
  title: string;
  content: string;
  category: 'sop';
  contentType?: 'markdown' | 'text' | 'html';
  tags?: string[];
}

/**
 * Request body for updating an existing SOP
 */
export interface UpdateSOPRequest {
  title?: string;
  content?: string;
  contentType?: 'markdown' | 'text' | 'html';
  tags?: string[];
}

/**
 * Query parameters for listing SOPs
 */
export interface SOPFilters {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
}

/**
 * Paginated response for SOP listing
 */
export interface PaginatedSOPsResponse {
  data: SOP[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
