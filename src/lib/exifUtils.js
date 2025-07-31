
import { createWorker } from 'tesseract.js';

// Cache worker to avoid recreating it multiple times
let ocrWorker = null;

const initializeOCR = async () => {
  if (!ocrWorker) {
    ocrWorker = await createWorker('eng');
    await ocrWorker.setParameters({
      tessedit_char_whitelist: '0123456789:AMP ',
    });
  }
  return ocrWorker;
};

export const extractPhotoTimestamp = async (file) => {
  try {
    const worker = await initializeOCR();
    
    // Convert file to image URL for OCR processing
    const imageUrl = URL.createObjectURL(file);
    
    // Use OCR to extract text from the image
    const { data: { text } } = await worker.recognize(imageUrl);
    
    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);
    
    // Look for time patterns in the extracted text
    const timePatterns = [
      /(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)/i,  // 6:47:27 AM
      /(\d{1,2}):(\d{2})\s*(AM|PM)/i,         // 6:47 AM
      /(\d{1,2}):(\d{2}):(\d{2})/,            // 6:47:27 (24-hour)
      /(\d{1,2}):(\d{2})/                     // 6:47 (24-hour)
    ];
    
    let timeMatch = null;
    let matchedPattern = null;
    
    for (const pattern of timePatterns) {
      timeMatch = text.match(pattern);
      if (timeMatch) {
        matchedPattern = pattern;
        break;
      }
    }
    
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      let minute = parseInt(timeMatch[2]);
      let second = matchedPattern.source.includes('(\\d{2})') && matchedPattern.source.includes(':') ? 
                   parseInt(timeMatch[3]) || 0 : 0;
      let period = timeMatch[4] || timeMatch[3]; // AM/PM might be in different capture groups
      
      // Convert to 24-hour format if needed
      if (period && period.toUpperCase() === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period && period.toUpperCase() === 'AM' && hour === 12) {
        hour = 0;
      }
      
      // Format time as HH:mm for time input
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Use current date since we're only extracting time from the photo
      const currentDate = new Date();
      const photoDateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour, minute, second);
      
      return {
        success: true,
        timestamp: photoDateTime,
        timeString: timeString,
        dateString: currentDate.toISOString().split('T')[0],
        extractedText: text.trim(),
        detectedTime: timeMatch[0]
      };
    } else {
      return {
        success: false,
        error: 'No timestamp found in photo text',
        extractedText: text.trim()
      };
    }
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      success: false,
      error: 'Failed to process image with OCR: ' + error.message
    };
  }
};

export const formatTimestampForDisplay = (timestamp) => {
  if (!timestamp) return null;
  
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString(),
    iso: date.toISOString()
  };
};

// Clean up worker when needed
export const cleanupOCR = async () => {
  if (ocrWorker) {
    await ocrWorker.terminate();
    ocrWorker = null;
  }
};
