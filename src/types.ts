export type ToolId = 'vision' | 'lexicon' | 'chronos' | 'forge' | 'svg-preview' | 'png-to-svg' | null;

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high';
}

export interface Event {
  id: string;
  title: string;
  date: string; // ISO format
  type: 'meeting' | 'design' | 'personal';
}
