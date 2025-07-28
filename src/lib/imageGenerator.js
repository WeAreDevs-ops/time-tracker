const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const drawTextWithBackground = (ctx, text, x, y, font, textColor, bgColor) => {
  ctx.font = font;
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
  
  ctx.fillStyle = bgColor;
  ctx.fillRect(x - 10, y - textHeight - 5, textWidth + 20, textHeight + 10);
  
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y - textHeight);
};

const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hour, minute] = time24.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const generateTimeProofImage = async (entry) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const [timeInImg, timeOutImg] = await Promise.all([
    loadImage(entry.timeInPhoto),
    loadImage(entry.timeOutPhoto)
  ]);
  
  const imgWidth = 500;
  const imgHeight = Math.round(imgWidth / (timeInImg.width / timeInImg.height));
  
  canvas.width = imgWidth * 2 + 20; 
  canvas.height = imgHeight + 120;

  ctx.fillStyle = '#1a202c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(timeInImg, 10, 100, imgWidth, imgHeight);
  ctx.drawImage(timeOutImg, imgWidth + 10, 100, imgWidth, imgHeight);

  drawTextWithBackground(ctx, `TIME IN: ${formatTime12Hour(entry.timeIn)}`, 15, 95, 'bold 24px Arial', '#ffffff', 'rgba(0, 200, 83, 0.8)');
  drawTextWithBackground(ctx, `TIME OUT: ${formatTime12Hour(entry.timeOut)}`, imgWidth + 15, 95, 'bold 24px Arial', '#ffffff', 'rgba(216, 27, 96, 0.8)');
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Employee: ${entry.employeeName} | Date: ${entry.date}`, canvas.width / 2, 40);

  const overtimeText = `Overtime: ${entry.hours.overtime.toFixed(2)} hours`;
  if (entry.hours.overtime > 0) {
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#ffeb3b';
    const textMetrics = ctx.measureText(overtimeText);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(
      (canvas.width / 2) - (textMetrics.width / 2) - 15,
      canvas.height - 65,
      textMetrics.width + 30,
      50
    );

    ctx.fillStyle = '#ffeb3b';
    ctx.fillText(overtimeText, canvas.width / 2, canvas.height - 30);
  }
  
  const link = document.createElement('a');
  link.download = `time-proof-${entry.employeeName.replace(/\s/g, '_')}-${entry.date}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};