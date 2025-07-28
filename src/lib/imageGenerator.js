
export const generateTimeProofImage = async (entry) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size for better quality - increased resolution
  canvas.width = 1800;
  canvas.height = 1200;
  
  // Enhanced gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#1e3a8a');
  gradient.addColorStop(0.3, '#3730a3');
  gradient.addColorStop(0.7, '#581c87');
  gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add subtle pattern overlay
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < canvas.width; i += 40) {
    for (let j = 0; j < canvas.height; j += 40) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(i, j, 1, 1);
    }
  }
  ctx.globalAlpha = 1;

  // Header section with improved styling
  const headerHeight = 120;
  const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, headerHeight);
  headerGradient.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
  headerGradient.addColorStop(1, 'rgba(147, 51, 234, 0.9)');
  ctx.fillStyle = headerGradient;
  ctx.fillRect(0, 0, canvas.width, headerHeight);
  
  // Header border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, headerHeight);

  // Enhanced text styling
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  
  // Employee info with better spacing - larger and easier to read
  ctx.font = 'bold 48px Arial, sans-serif';
  const employeeText = `Employee: ${entry.employeeName}     Date: ${entry.date}`;
  ctx.fillText(employeeText, canvas.width / 2, 75);

  // Photo containers with enhanced design - larger for better quality
  const photoWidth = 675;
  const photoHeight = 600;
  const photoY = 130;
  const leftPhotoX = 100;
  const rightPhotoX = canvas.width - photoWidth - 100;

  // Helper function to draw enhanced photo container
  const drawPhotoContainer = async (x, y, photo, timeLabel, timeValue, bgColor) => {
    return new Promise((resolve) => {
      // Main container with rounded corners effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(x, y, photoWidth, photoHeight);
      
      // Container border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, photoWidth, photoHeight);
      
      // Time label header
      const labelHeight = 90;
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, photoWidth, labelHeight);
      
      // Label border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, photoWidth, labelHeight);
      
      // Time label text with time included
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 33px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${timeLabel} ${timeValue}`, x + photoWidth / 2, y + 57);
      
      // Photo area - now takes up remaining space
      const photoAreaY = y + labelHeight;
      const photoAreaHeight = photoHeight - labelHeight;
      
      if (photo) {
        const img = new Image();
        img.onload = () => {
          // Calculate scaling to fit while maintaining aspect ratio
          const imgAspectRatio = img.width / img.height;
          const containerAspectRatio = photoWidth / photoAreaHeight;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgAspectRatio > containerAspectRatio) {
            // Image is wider than container - fit to width
            drawWidth = photoWidth;
            drawHeight = photoWidth / imgAspectRatio;
            drawX = x;
            drawY = photoAreaY + (photoAreaHeight - drawHeight) / 2;
          } else {
            // Image is taller than container - fit to height
            drawHeight = photoAreaHeight;
            drawWidth = photoAreaHeight * imgAspectRatio;
            drawX = x + (photoWidth - drawWidth) / 2;
            drawY = photoAreaY;
          }
          
          // Use high-quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          
          // Photo border
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
          
          resolve();
        };
        img.onerror = () => {
          // Placeholder for missing photo - fill entire area
          ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
          ctx.fillRect(x, photoAreaY, photoWidth, photoAreaHeight);
          
          ctx.fillStyle = '#666666';
          ctx.font = '18px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('No Photo Available', x + photoWidth / 2, photoAreaY + photoAreaHeight / 2);
          
          resolve();
        };
        img.src = photo;
      } else {
        // Placeholder for missing photo - fill entire area
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.fillRect(x, photoAreaY, photoWidth, photoAreaHeight);
        
        ctx.fillStyle = '#666666';
        ctx.font = '18px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No Photo Available', x + photoWidth / 2, photoAreaY + photoAreaHeight / 2);
        
        resolve();
      }
    });
  };

  // Format times for display
  const formatDisplayTime = (time24) => {
    if (!time24) return 'Not Set';
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Draw photo containers and wait for them to load
  await Promise.all([
    drawPhotoContainer(
      leftPhotoX, 
      photoY, 
      entry.timeInPhoto, 
      'TIME IN', 
      formatDisplayTime(entry.timeIn),
      '#10b981'
    ),
    drawPhotoContainer(
      rightPhotoX, 
      photoY, 
      entry.timeOutPhoto, 
      'TIME OUT', 
      formatDisplayTime(entry.timeOut),
      '#dc2626'
    )
  ]);

  // Simplified summary section - only showing overtime
  const summaryY = photoY + photoHeight + 60;
  const summaryHeight = 120;
  
  // Summary background
  const summaryGradient = ctx.createLinearGradient(0, summaryY, canvas.width, summaryY + summaryHeight);
  summaryGradient.addColorStop(0, 'rgba(30, 41, 59, 0.9)');
  summaryGradient.addColorStop(1, 'rgba(51, 65, 85, 0.9)');
  ctx.fillStyle = summaryGradient;
  ctx.fillRect(50, summaryY, canvas.width - 100, summaryHeight);
  
  // Summary border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, summaryY, canvas.width - 100, summaryHeight);

  // Summary content - only overtime
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.textAlign = 'center';
  
  const summaryTextY = summaryY + 75;
  
  // Calculate hours
  const hours = entry.hours || { regular: 0, overtime: 0, total: 0 };
  
  ctx.fillText(`Overtime: ${hours.overtime.toFixed(2)} hours`, canvas.width / 2, summaryTextY);

  // Footer
  const footerY = canvas.height - 45;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '21px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Official Time Verification Document - Work Time Tracker System', canvas.width / 2, footerY);

  // Convert to blob and download
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `time-verification-${entry.employeeName}-${entry.date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png', 1.0);
};
