
import EXIF from 'exif-js';

export const extractPhotoTimestamp = (file) => {
  return new Promise((resolve) => {
    EXIF.getData(file, function() {
      const dateTime = EXIF.getTag(this, "DateTime") || 
                      EXIF.getTag(this, "DateTimeOriginal") || 
                      EXIF.getTag(this, "DateTimeDigitized");
      
      if (dateTime) {
        // EXIF DateTime format: "YYYY:MM:DD HH:mm:ss"
        // Convert to Date object
        const [datePart, timePart] = dateTime.split(' ');
        const [year, month, day] = datePart.split(':');
        const [hour, minute, second] = timePart.split(':');
        
        const photoDate = new Date(year, month - 1, day, hour, minute, second);
        
        // Format time as HH:mm for time input
        const timeString = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
        
        resolve({
          success: true,
          timestamp: photoDate,
          timeString: timeString,
          dateString: photoDate.toISOString().split('T')[0]
        });
      } else {
        resolve({
          success: false,
          error: 'No timestamp found in photo metadata'
        });
      }
    });
  });
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
