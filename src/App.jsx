import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { useTimeTracker } from '@/hooks/useTimeTracker';
import Header from '@/components/Header';
import TimeEntryForm from '@/components/TimeEntryForm';
import TimeEntriesList from '@/components/TimeEntriesList';

function App() {
  const {
    timeEntries,
    currentEntry,
    setCurrentEntry,
    addTimeEntry,
    deleteEntry,
    handlePhotoUpload,
    calculateHours,
    downloadPhotoProof,
  } = useTimeTracker();

  return (
    <>
      <Helmet>
        <title>Work Time Tracker - Professional Timesheet Management</title>
        <meta name="description" content="Track your work hours with photo verification, automatic time calculation, and downloadable photo proofs." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto">
          <Header />

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <TimeEntryForm
                currentEntry={currentEntry}
                setCurrentEntry={setCurrentEntry}
                onAddEntry={addTimeEntry}
                onPhotoUpload={handlePhotoUpload}
                calculateHours={calculateHours}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <TimeEntriesList
                entries={timeEntries}
                onDelete={deleteEntry}
                onDownload={downloadPhotoProof}
              />
            </motion.div>
          </div>
        </div>
        <Toaster />
      </div>
    </>
  );
}

export default App;