import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Plus, Trash2, Save, Search, Hash } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Note } from '../../types';
import { cn } from '../../lib/utils';

export default function Lexicon() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('omnihub_notes');
    return saved ? JSON.parse(saved) : [{ id: '1', title: 'Getting Started', content: '# Welcome to Lexicon\n\nStart writing your thoughts here. It supports **Markdown**!', updatedAt: Date.now() }];
  });
  
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id || null);
  const activeNote = notes.find(n => n.id === activeId);

  useEffect(() => {
    localStorage.setItem('omnihub_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'New Note',
      content: '',
      updatedAt: Date.now()
    };
    setNotes([newNote, ...notes]);
    setActiveId(newNote.id);
  };

  const updateNote = (content: string) => {
    setNotes(notes.map(n => n.id === activeId ? { ...n, content, updatedAt: Date.now(), title: content.split('\n')[0].replace('# ', '').slice(0, 30) || 'Untitled Note' } : n));
  };

  const deleteNote = (id: string) => {
    const nextNotes = notes.filter(n => n.id !== id);
    setNotes(nextNotes);
    if (activeId === id) setActiveId(nextNotes[0]?.id || null);
  };

  return (
    <div className="flex h-full bg-[#0a0a0a] overflow-hidden text-[#ededed]">
      {/* Sidebar */}
      <div className="w-72 border-r border-white/5 bg-white/[0.02] flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Lexicon</h2>
          <button onClick={addNote} className="p-1.5 bg-white text-black rounded-lg hover:bg-white/80 transition-colors">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notes.map(note => (
            <button
              key={note.id}
              onClick={() => setActiveId(note.id)}
              className={cn(
                "w-full p-6 text-left border-b border-white/[0.03] transition-colors hover:bg-white/[0.01]",
                activeId === note.id ? "bg-white/[0.04]" : ""
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText size={14} className={cn("text-white/20", activeId === note.id && "text-white")} />
                <span className={cn("text-sm font-medium truncate", activeId === note.id ? "text-white" : "text-white/40")}>
                  {note.title}
                </span>
              </div>
              <p className="text-[10px] text-white/10 font-mono">
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a]">
        {activeNote ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-white/5">
               <div className="flex items-center gap-2 text-white/20 text-[10px] font-mono">
                 <Hash size={12} />
                 <span>UUID: {activeNote.id.slice(0, 8)}</span>
               </div>
               <button 
                onClick={() => deleteNote(activeNote.id)}
                className="p-2 text-white/10 hover:text-rose-500 transition-colors"
               >
                 <Trash2 size={16} />
               </button>
            </div>
            <div className="flex-1 flex flex-col md:flex-row divide-x divide-white/5">
              <textarea
                value={activeNote.content}
                onChange={(e) => updateNote(e.target.value)}
                placeholder="Start writing..."
                className="flex-1 p-8 focus:outline-none text-sm leading-relaxed resize-none font-sans bg-transparent text-white/90 placeholder:text-white/10"
              />
              <div className="flex-1 p-8 bg-black/20 overflow-y-auto prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{activeNote.content}</ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-white/5">
            <FileText size={64} strokeWidth={1} />
            <p className="mt-4 text-xs uppercase tracking-widest font-bold">Select or create archive</p>
          </div>
        )}
      </div>
    </div>
  );
}
