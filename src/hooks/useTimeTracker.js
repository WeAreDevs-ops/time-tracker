import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { generateTimeProofImage } from '@/lib/imageGenerator';

export function useTimeTracker() {
  const [timeEntries, setTimeEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    employeeName: '',
    timeIn: '',
    timeOut: '',
    timeInPhoto: null,
    timeOutPhoto: null,
    manualOvertime: 0,
  });

  const handlePhotoUpload = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const currentTime = new Date().toLocaleTimeString('en-US', {
          hour12: false, // Keep 24-hour format for internal storage and calculation
          hour: '2-digit',
          minute: '2-digit',
        });

        setCurrentEntry(prev => {
          const timeField = type === 'in' ? 'timeIn' : 'timeOut';
          return {
            ...prev,
            [type === 'in' ? 'timeInPhoto' : 'timeOutPhoto']: e.target.result,
            // Only set time automatically if no time was previously entered
            [timeField]: prev[timeField] || currentTime,
          };
        });

        toast({
          title: "📸 Photo uploaded!",
          description: `Time ${type} automatically set to ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateHours = (timeIn, timeOut, manualOvertime = 0) => {
    if (!timeIn || !timeOut) return { regular: 0, overtime: manualOvertime, total: manualOvertime };
    
    const [inHour, inMin] = timeIn.split(':').map(Number);
    const [outHour, outMin] = timeOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMin;
    let outMinutes = outHour * 60 + outMin;
    
    if (outMinutes < inMinutes) {
      outMinutes += 24 * 60;
    }
    
    const totalMinutes = outMinutes - inMinutes;
    const totalHours = totalMinutes / 60;
    
    return {
      regular: totalHours,
      overtime: manualOvertime,
      total: totalHours + manualOvertime,
    };
  };

  const addTimeEntry = () => {
    if (!currentEntry.timeIn || !currentEntry.timeOut) {
      toast({
        title: "⚠️ Missing information",
        description: "Please add both time in and time out",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentEntry.timeInPhoto || !currentEntry.timeOutPhoto) {
      toast({
        title: "📸 Missing Photos",
        description: "Please upload photos for both Time In and Time Out.",
        variant: "destructive",
      });
      return;
    }

    if (!currentEntry.employeeName) {
      toast({
        title: "👤 Missing Name",
        description: "Please enter the employee's name.",
        variant: "destructive",
      });
      return;
    }

    const hours = calculateHours(currentEntry.timeIn, currentEntry.timeOut, currentEntry.manualOvertime);
    const newEntry = {
      ...currentEntry,
      id: Date.now(),
      hours,
    };

    setTimeEntries(prev => [newEntry, ...prev]);
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      employeeName: '',
      timeIn: '',
      timeOut: '',
      timeInPhoto: null,
      timeOutPhoto: null,
      manualOvertime: 0,
    });

    toast({
      title: "✅ Time entry added!",
      description: `Total hours for ${newEntry.employeeName}: ${hours.total.toFixed(2)}`,
    });
  };

  const deleteEntry = (id) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
    toast({
      title: "🗑️ Entry deleted",
      description: "Time entry has been removed",
    });
  };

  const downloadPhotoProof = async (entry) => {
    try {
      await generateTimeProofImage(entry);
      toast({
        title: '📥 Download Started!',
        description: 'Your time-stamped photo proof is being generated.',
      });
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast({
        title: '❌ Download Failed',
        description: 'There was an error generating your photo proof.',
        variant: 'destructive',
      });
    }
  };

  return {
    timeEntries,
    currentEntry,
    setCurrentEntry,
    handlePhotoUpload,
    calculateHours,
    addTimeEntry,
    deleteEntry,
    downloadPhotoProof,
  };
}