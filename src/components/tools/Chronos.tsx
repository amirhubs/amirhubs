import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users,
  Plus
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval 
} from 'date-fns';
import { cn } from '../../lib/utils';

export default function Chronos() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const onDateClick = (day: Date) => setSelectedDate(day);
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-[#60a5fa] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CalendarIcon size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-medium tracking-tight text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
            <p className="text-[10px] text-[#a1a1a1] font-mono uppercase tracking-[0.2em]">Chronos System</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.01]">
        {days.map((day, i) => (
          <div key={i} className="py-3 text-center text-[9px] uppercase tracking-[0.3em] font-bold text-white/20">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        days.push(
          <div
            key={day.toString()}
            className={cn(
              "h-24 p-3 border-r border-b border-white/[0.03] transition-all cursor-pointer relative group",
              !isSameMonth(day, monthStart) ? "text-white/5" : "text-white/60 hover:bg-white/[0.02]",
              isSameDay(day, selectedDate) ? "bg-white/[0.03]" : ""
            )}
            onClick={() => onDateClick(cloneDay)}
          >
            <span className={cn(
              "text-[10px] font-mono mb-1 inline-block w-6 h-6 leading-6 text-center rounded-full transition-colors",
              isSameDay(day, new Date()) ? "bg-white text-black font-bold" : ""
            )}>
              {formattedDate}
            </span>
            
            {/* Sample Event */}
            {isSameDay(day, addDays(new Date(), 2)) && (
               <div className="mt-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-medium text-emerald-400 truncate">
                 Design Architecture
               </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">{rows}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden text-[#ededed]">
      <div className="flex flex-col h-full bg-[#0a0a0a]">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
      
      {/* Detail Panel */}
      <div className="w-80 border-l border-white/5 bg-white/[0.01] flex flex-col">
        <div className="p-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-8 flex items-center gap-2">
            <Clock size={12} /> Schedule
          </h3>
          
          <div className="space-y-8">
            <div className="relative pl-6 border-l border-white/10 group">
              <div className="absolute top-0 -left-[2px] w-1 h-3 rounded-full bg-emerald-500 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">10:00 — 11:30</p>
              <h4 className="text-sm font-medium mt-1 text-white/90">OmniHub Evolution</h4>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-white/30 italic">
                <Users size={12} />
                <span>Architecture Team</span>
              </div>
            </div>

            <div className="relative pl-6 border-l border-white/10 group opacity-50 hover:opacity-100 transition-opacity">
              <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">14:00 — 15:00</p>
              <h4 className="text-sm font-medium mt-1 text-white/90">Visual Identity Refresh</h4>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-white/30 italic">
                <MapPin size={12} />
                <span>Virtual Command</span>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-12 py-3 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5">
            <Plus size={14} /> New Event
          </button>
        </div>
      </div>
    </div>
  );
}
