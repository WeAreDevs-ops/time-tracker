import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Clock, Plus, Calendar, Timer, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractPhotoTimestamp } from '../lib/exifUtils';

const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hour, minute] = time24.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const TimeEntryForm = ({ currentEntry, setCurrentEntry, onAddEntry, onPhotoUpload, calculateHours }) => {
  const hours = calculateHours(currentEntry.timeIn, currentEntry.timeOut, currentEntry.manualOvertime);

  const handlePhotoUpload = async (type, event) => {
    const file = event.target.files[0];
    if (file) {
      // Show loading state
      setCurrentEntry(prev => ({
        ...prev,
        [`${type}Processing`]: true
      }));

      // Extract timestamp from photo using OCR
      try {
        const timestampData = await extractPhotoTimestamp(file);

        if (timestampData.success) {
          console.log(`📸 Timestamp detected: ${timestampData.detectedTime}`);
          console.log(`Extracted text: ${timestampData.extractedText}`);

          // Auto-set the time based on detected timestamp in photo
          setCurrentEntry(prev => ({
            ...prev,
            [`time${type === 'in' ? 'In' : 'Out'}`]: timestampData.timeString,
            date: timestampData.dateString,
            [`${type}Processing`]: false
          }));
        } else {
          console.log('⚠️ No timestamp found in photo text');
          console.log(`Extracted text: ${timestampData.extractedText}`);
          setCurrentEntry(prev => ({
            ...prev,
            [`${type}Processing`]: false
          }));
        }
      } catch (error) {
        console.error('Error extracting timestamp:', error);
        setCurrentEntry(prev => ({
          ...prev,
          [`${type}Processing`]: false
        }));
      }

      // Read and display the photo
      const reader = new FileReader();
      reader.onload = (e) => {
        setCurrentEntry(prev => ({
          ...prev,
          [`time${type === 'in' ? 'In' : 'Out'}Photo`]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Clock className="text-cyan-400" size={24} />
        <span className="text-xl font-semibold text-white">New Time Entry</span>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="inline mr-2" size={16} />
              Date
            </label>
            <input
              type="date"
              value={currentEntry.date}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="inline mr-2" size={16} />
              Employee Name
            </label>
            <input
              type="text"
              placeholder="Enter name"
              value={currentEntry.employeeName}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, employeeName: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Time In</label>
            <input
              type="time"
              value={currentEntry.timeIn}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, timeIn: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload('in', e)}
              className="hidden"
              id="timeInPhoto"
            />
            <label
              htmlFor="timeInPhoto"
              className={`flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${currentEntry.inProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {currentEntry.inProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  <span className="text-white font-medium">Processing...</span>
                </>
              ) : (
                <>
                  <Camera className="mr-2" size={16} />
                  <span className="text-white font-medium">Time In Photo</span>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Time Out</label>
            <input
              type="time"
              value={currentEntry.timeOut}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, timeOut: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload('out', e)}
              className="hidden"
              id="timeOutPhoto"
            />
            <label
              htmlFor="timeOutPhoto"
              className={`flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${currentEntry.outProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {currentEntry.outProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  <span className="text-white font-medium">Processing...</span>
                </>
              ) : (
                <>
                  <Camera className="mr-2" size={16} />
                  <span className="text-white font-medium">Time Out Photo</span>
                </>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Timer className="inline mr-2" size={16} />
            Manual Overtime (hours)
          </label>
          <input
            type="number"
            value={currentEntry.manualOvertime}
            onChange={(e) => setCurrentEntry(prev => ({ ...prev, manualOvertime: parseFloat(e.target.value) || 0 }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            min="0"
            step="0.5"
          />
        </div>

        {(currentEntry.timeInPhoto || currentEntry.timeOutPhoto) && (
          <div className="grid md:grid-cols-2 gap-4">
            {currentEntry.timeInPhoto && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Time In Photo</label>
                <img
                  src={currentEntry.timeInPhoto}
                  alt="Time In"
                  className="w-full h-32 object-cover rounded-lg border border-white/20"
                />
              </div>
            )}
            {currentEntry.timeOutPhoto && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Time Out Photo</label>
                <img
                  src={currentEntry.timeOutPhoto}
                  alt="Time Out"
                  className="w-full h-32 object-cover rounded-lg border border-white/20"
                />
              </div>
            )}
          </div>
        )}

        {currentEntry.timeIn && currentEntry.timeOut && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg p-4 border border-cyan-400/30"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {hours.total.toFixed(2)} hours
              </div>
              <div className="text-sm text-gray-300">
                Regular: {hours.regular.toFixed(2)}h | Overtime: {hours.overtime.toFixed(2)}h
              </div>
            </div>
          </motion.div>
        )}

        <Button
          onClick={onAddEntry}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="mr-2" size={16} />
          Add Time Entry
        </Button>
      </div>
    </>
  );
};

export default TimeEntryForm;