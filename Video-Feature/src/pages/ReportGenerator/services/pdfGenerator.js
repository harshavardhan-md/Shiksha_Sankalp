import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const COLORS = {
  primary: rgb(0.2, 0.3, 0.8),    // Deep blue
  secondary: rgb(0.3, 0.8, 0.6),  // Teal
  accent: rgb(0.9, 0.4, 0.3),     // Coral
  text: rgb(0.2, 0.2, 0.2),       // Dark gray
  lightBg: rgb(0.97, 0.97, 0.98), // Light gray
  white: rgb(1, 1, 1)
};

const FONTS = {
  title: StandardFonts.HelveticaBold,
  heading: StandardFonts.HelveticaBold,
  body: StandardFonts.Helvetica,
  mono: StandardFonts.Courier
};



const parseFormattedText = (text) => {
  const segments = [];
  let currentText = '';
  let isBold = false;
  let isItalic = false;
  let i = 0;

  while (i < text.length) {
    if (text[i] === '*') {
      // Check for bold (double asterisk)
      if (text[i + 1] === '*') {
        if (currentText) {
          segments.push({ text: currentText, bold: isBold, italic: isItalic });
          currentText = '';
        }
        isBold = !isBold;
        i += 2;
        continue;
      }
      // Single asterisk for italic
      if (currentText) {
        segments.push({ text: currentText, bold: isBold, italic: isItalic });
        currentText = '';
      }
      isItalic = !isItalic;
      i++;
      continue;
    }
    currentText += text[i];
    i++;
  }

  if (currentText) {
    segments.push({ text: currentText, bold: isBold, italic: isItalic });
  }

  return segments;
};

const drawHeader = (page, sectionTitle, config) => {
  const { pageWidth, margin, fonts, colors } = config;
  
  // Draw header bar
  page.drawRectangle({
    x: 0,
    y: page.getHeight() - 40,
    width: pageWidth,
    height: 40,
    color: colors.lightBg
  });

  // Draw section title
  page.drawText(sectionTitle, {
    x: margin,
    y: page.getHeight() - 25,
    size: 14,
    font: fonts.heading,
    color: colors.primary
  });
};

const drawProgressBar = (page, x, y, width, height, value, colors) => {
  // Background bar
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: colors.lightBg
  });

  // Progress bar
  page.drawRectangle({
    x,
    y,
    width: (width * Math.min(Math.max(value, 0), 100)) / 100,
    height,
    color: colors.secondary
  });
};

const drawMetricsDashboard = async (page, metrics, config) => {
  const { pageWidth, pageHeight, margin, fonts, colors } = config;
  const dashboardY = pageHeight - 400;
  const boxWidth = (pageWidth - (margin * 3)) / 2;
  const boxHeight = 150;

  // Draw progress metrics boxes
  metrics.progressMetrics.forEach((metric, index) => {
    const isLeftBox = index % 2 === 0;
    const boxX = isLeftBox ? margin : margin * 2 + boxWidth;
    const boxY = dashboardY - (Math.floor(index / 2) * (boxHeight + 20));

    // Draw box background
    page.drawRectangle({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      color: colors.lightBg
    });

    // Add metric title
    page.drawText(metric.category, {
      x: boxX + 20,
      y: boxY + boxHeight - 30,
      size: 16,
      font: fonts.heading,
      color: colors.primary
    });

    // Add metric value
    const valueText = `${metric.value}%`;
    const valueSize = 36;
    const valueWidth = fonts.title.widthOfTextAtSize(valueText, valueSize);
    page.drawText(valueText, {
      x: boxX + (boxWidth - valueWidth) / 2,
      y: boxY + boxHeight / 2,
      size: valueSize,
      font: fonts.title,
      color: colors.secondary
    });

    // Draw progress bar
    drawProgressBar(page, boxX + 20, boxY + 20, boxWidth - 40, 4, metric.value, colors);
  });

  // Draw key stats
  drawKeyStats(page, metrics.keyStats, boxHeight + margin, config);
};

const drawKeyStats = (page, keyStats, y, config) => {
  const { pageWidth, margin, fonts, colors } = config;
  const statWidth = (pageWidth - (margin * 3)) / 2;

  Object.entries(keyStats).forEach(([key, value], index) => {
    const isLeftStat = index % 2 === 0;
    const x = isLeftStat ? margin : margin * 2 + statWidth;
    const yPos = y - (Math.floor(index / 2) * 50);

    // Format the key for display
    const displayKey = key
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Draw stat
    page.drawText(displayKey, {
      x,
      y: yPos,
      size: 12,
      font: fonts.body,
      color: colors.text
    });

    page.drawText(`${value}${typeof value === 'number' ? '%' : ''}`, {
      x: x + statWidth - 50,
      y: yPos,
      size: 14,
      font: fonts.heading,
      color: colors.primary
    });
  });
};

const generateCoverPage = async (pdfDoc, metrics, config) => {
  const { pageWidth, pageHeight, margin, fonts, colors } = config;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  
  // Add title
  const titleSize = 48;
  const titleText = 'Shiksha Sankalp';
  const titleWidth = fonts.title.widthOfTextAtSize(titleText, titleSize);
  page.drawText(titleText, {
    x: (pageWidth - titleWidth) / 2,
    y: pageHeight - 120,
    size: titleSize,
    font: fonts.title,
    color: colors.primary
  });

  // Add subtitle
  const subtitleSize = 24;
  const subtitleText = 'Meeting Analysis Report';
  const subtitleWidth = fonts.heading.widthOfTextAtSize(subtitleText, subtitleSize);
  page.drawText(subtitleText, {
    x: (pageWidth - subtitleWidth) / 2,
    y: pageHeight - 180,
    size: subtitleSize,
    font: fonts.heading,
    color: colors.text
  });

  // Add metrics dashboard
  await drawMetricsDashboard(page, metrics, config);

  return page;
};

const generateContentPages = async (pdfDoc, content, metrics, config) => {
  const { pageWidth, pageHeight, margin, fonts, colors } = config;
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;

  // Add page header
  drawHeader(currentPage, 'Content', config);

  // Split content into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim());

  for (const paragraph of paragraphs) {
    // Check if we need a new page
    if (yPosition < margin + 50) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
      drawHeader(currentPage, 'Content', config);
    }

    

    const fontSize = 12;
    const lineHeight = fontSize * 1.5;
    const maxWidth = config.contentWidth;
    let xPosition = margin;

    // Parse formatted segments
    const segments = parseFormattedText(paragraph);
    
    for (const segment of segments) {
      const font = segment.bold ? fonts.heading : 
                  segment.italic ? fonts.body : 
                  fonts.body;
      
                  const words = segment.text.split(' ');
                  let line = '';
      
                  for (const word of words) {
                    const testLine = line ? `${line} ${word}` : word;
                    const textWidth = font.widthOfTextAtSize(testLine, fontSize);
                  
                    if (textWidth > maxWidth && line) {
                      // Draw current line
                      currentPage.drawText(line, {
                        x: margin,
                        y: yPosition,
                        size: fontSize,
                        font,
                        color: colors.text
                      });
                      line = word; // Start new line with current word
                      yPosition -= lineHeight;
                    } else {
                      line = testLine;
                    }
                  }

      // Draw remaining text for this segment
      // Draw last line
if (line) {
  currentPage.drawText(line, {
    x: margin,
    y: yPosition,
    size: fontSize,
    font,
    color: colors.text
  });
  yPosition -= lineHeight;
}
    }
    
    yPosition -= lineHeight * 1.5; // Add extra space after paragraph
    xPosition = margin; // Reset x position for next paragraph
  }

  // Add sentiment analysis section
  if (metrics.sentimentScores && metrics.sentimentScores.length > 0) {
    if (yPosition < margin + 200) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
      drawHeader(currentPage, 'Sentiment Analysis', config);
    }

    // Add sentiment section header
    currentPage.drawText('', {
      x: margin,
      y: yPosition,
      size: 16,
      font: fonts.heading,
      color: colors.primary
    });
    yPosition -= 30;

    // Draw sentiment scores
    metrics.sentimentScores.forEach((score, index) => {
      if (yPosition < margin + 50) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
        drawHeader(currentPage, '', config);
      }

      const scoreText = `${score.month}: ${(score.score * 100).toFixed(1)}%`;
      currentPage.drawText(scoreText, {
        x: margin,
        y: yPosition,
        size: 12,
        font: fonts.body,
        color: colors.text
      });
      yPosition -= 20;
    });
  }
};

const downloadPDF = (pdfBytes) => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `meeting-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
  link.click();
  
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

export const generatePDF = async (content, metrics) => {
  try {
    // Validate metrics structure
    if (!metrics || !metrics.progressMetrics || !metrics.sentimentScores || !metrics.keyStats) {
      throw new Error('Invalid metrics data structure');
    }

    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const fonts = {
      title: await pdfDoc.embedFont(FONTS.title),
      heading: await pdfDoc.embedFont(FONTS.heading),
      body: await pdfDoc.embedFont(FONTS.body),
      mono: await pdfDoc.embedFont(FONTS.mono)
    };

    // PDF configuration
    const config = {
      margin: 50,
      pageWidth: 595.276,
      pageHeight: 841.890,
      contentWidth: 495.276,
      fonts,
      colors: COLORS
    };

    // Generate cover page
    await generateCoverPage(pdfDoc, metrics, config);
    
    // Generate content pages
    await generateContentPages(pdfDoc, content, metrics, config);

    const pdfBytes = await pdfDoc.save();
    downloadPDF(pdfBytes);
    
    return pdfBytes;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report: ' + error.message);
  }
};