export type ToolId = 'vision' | 'lexicon' | 'chronos' | 'svg-preview' | 'png-to-svg' | 'csv-gen' | null;

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
