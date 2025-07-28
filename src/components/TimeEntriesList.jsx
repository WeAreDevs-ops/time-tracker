import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Download, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hour, minute] = time24.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const TimeEntriesList = ({ entries, onDelete, onDownload }) => {
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours.total, 0);
  const totalOvertime = entries.reduce((sum, entry) => sum + entry.hours.overtime, 0);
  const totalRegular = totalHours - totalOvertime;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="text-purple-400" size={24} />
          <span className="text-xl font-semibold text-white">Time Entries</span>
        </div>
      </div>
      <div className="space-y-4 max-h-[26rem] overflow-y-auto pr-2">
        <AnimatePresence>
          {entries.length > 0 ? (
            entries.map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <User size={16} className="text-cyan-400" />
                      {entry.employeeName || 'No Name'}
                    </div>
                    <div className="text-gray-300 text-sm ml-6">{entry.date}</div>
                    <div className="text-gray-300 text-sm ml-6">{formatTime12Hour(entry.timeIn)} - {formatTime12Hour(entry.timeOut)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => onDownload(entry)} variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20">
                      <Download size={16} />
                    </Button>
                    <Button onClick={() => onDelete(entry.id)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/20">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center"><div className="text-gray-400">Regular</div><div className="text-white font-semibold">{entry.hours.regular.toFixed(2)}h</div></div>
                  <div className="text-center"><div className="text-gray-400">Overtime</div><div className="text-yellow-400 font-semibold">{entry.hours.overtime.toFixed(2)}h</div></div>
                  <div className="text-center"><div className="text-gray-400">Total</div><div className="text-cyan-400 font-semibold">{entry.hours.total.toFixed(2)}h</div></div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <img src={entry.timeInPhoto} alt="Time In" className="w-full h-16 object-cover rounded border border-white/20" />
                  <img src={entry.timeOutPhoto} alt="Time Out" className="w-full h-16 object-cover rounded border border-white/20" />
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <Clock className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-gray-400">No time entries yet. Add your first entry!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {entries.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 pt-6 border-t border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-gray-400 text-sm">Total Regular</div><div className="text-white font-bold text-lg">{totalRegular.toFixed(2)}h</div></div>
            <div><div className="text-gray-400 text-sm">Total Overtime</div><div className="text-yellow-400 font-bold text-lg">{totalOvertime.toFixed(2)}h</div></div>
            <div><div className="text-gray-400 text-sm">Grand Total</div><div className="text-cyan-400 font-bold text-lg">{totalHours.toFixed(2)}h</div></div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default TimeEntriesList;