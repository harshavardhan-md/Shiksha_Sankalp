import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/pages/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { HfInference } from "@huggingface/inference";

// Initialize Gemma AI (keeping your existing setup)
const hf = new HfInference("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");
const MODEL_ID = "google/gemma-2-27b-it";

const ReportGenerator = ({ transcript }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const extractMetrics = (content) => {
    // This function would analyze the AI response and extract/generate metrics
    // For demo purposes, we'll create sample metrics
    return {
      sentimentScores: [
        { month: 'Jan', score: 0.8 },
        { month: 'Feb', score: 0.85 },
        { month: 'Mar', score: 0.75 },
        { month: 'Apr', score: 0.9 },
        { month: 'May', score: 0.43 },
        { month: 'Jun', score: 0.18},
        { month: 'Jul', score: 0.74 },
        { month: 'Aug', score: 0.63}

      ],
      progressMetrics: [
        { category: 'Goals Met', value: 85 },
        { category: 'Challenges Resolved', value: 70 },
        { category: 'Action Items Completed', value: 60 },
        { category: 'Follow-ups Done', value: 75 }
      ],
      keyStats: {
        totalActions: 12,
        completedActions: 8,
        pendingItems: 4,
        successRate: 75
      }
    };
  };

  const analyzeTranscript = async () => {
    try {
      setLoading(true);
      
      // Format the transcript
      let formattedTranscript = transcript;
      
      const prompt = `
        Analyze this educational discussion transcript and create a detailed report with the following sections:
        1. Executive Summary (2-3 paragraphs)
        2. Key Discussion Points (bullet points)
        3. Main Challenges Identified
        4. Proposed Solutions
        5. Action Items
        6. Recommendations for Follow-up
        7. Progress Metrics
        8. Future Development Roadmap
  
        Transcript:
        ${formattedTranscript}
  
        Format the response in markdown with clear sections and bullet points where appropriate.
      `;
      
      // Call Hugging Face Inference API with Gemma model
      const response = await hf.textGeneration({
        model: MODEL_ID,
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          top_p: 0.95,
        }
      });
      
      // Extract the generated text
      const analysis = response.generated_text;
      
      // Extract metrics from the analysis
      const extractedMetrics = extractMetrics(analysis);
      setMetrics(extractedMetrics);
      setReport(analysis);
      
      await generateEnhancedPDF(analysis, extractedMetrics);
      setLoading(false);
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      setLoading(false);
    }
  };

  // Helper function to wrap text
  const wrapText = (text, width, font, fontSize, page) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = font.widthOfTextAtSize(currentLine + ' ' + word, fontSize);
      
      if (width < page.getWidth() - 100) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };


  const generateEnhancedPDF = async (content, metrics) => {
    try {
      setLoading(true);
      
      const pdfDoc = await PDFDocument.create();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // PDF settings
      const margin = 50;
      const pageWidth = 595.276;
      const pageHeight = 841.890;
      const contentWidth = pageWidth - (margin * 2);
      
      // Add cover page
      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let yPosition = pageHeight - margin;
      // Draw background color
      currentPage.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        color: rgb(0.95, 0.95, 0.95)
      });
      
      // Add title
      currentPage.drawText('Shiksha Sankalp', {
        x: margin,
        y: pageHeight - 150,
        size: 36,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.8)
      });
      
      currentPage.drawText('Meeting Analysis Report', {
        x: margin,
        y: pageHeight - 200,
        size: 24,
        font: helveticaBold,
        color: rgb(0.3, 0.3, 0.3)
      });
      
      // Add date
      const date = new Date().toLocaleDateString();
      currentPage.drawText(`Generated: ${date}`, {
        x: margin,
        y: pageHeight - 250,
        size: 14,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4)
      });
      
      // Add metrics summary box
      const boxWidth = 400;
      const boxHeight = 150;
      const boxX = margin;
      const boxY = pageHeight - 450;
      
      currentPage.drawRectangle({
        x: boxX,
        y: boxY,
        width: boxWidth,
        height: boxHeight,
        color: rgb(1, 1, 1),
        opacity: 0.05
      });
      
      // Add key metrics
      currentPage.drawText('Key Metrics', {
        x: boxX + 20,
        y: boxY + boxHeight - 30,
        size: 16,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.8)
      });
      
      // Add metric values
      const { keyStats } = metrics;
      const metricItems = [
        `Total Actions: ${keyStats.totalActions}`,
        `Completed: ${keyStats.completedActions}`,
        `Success Rate: ${keyStats.successRate}%`
      ];
      
      metricItems.forEach((item, index) => {
        currentPage.drawText(item, {
          x: boxX + 20,
          y: boxY + boxHeight - 60 - (index * 25),
          size: 12,
          font: helveticaFont,
          color: rgb(0.3, 0.3, 0.3)
        });
      });
      
      // Add content pages
      // ... Your existing content rendering code ...
      // Process content
      const lines = content.split('\n');
      
      for (const line of lines) {
        // Check if we need a new page
        if (yPosition < margin + 50) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }

        if (line.trim() === '') {
          yPosition -= 15;
          continue;
        }

        // Handle different line types
        if (line.startsWith('# ')) {
          // Main headers
          yPosition -= 20;
          const text = line.replace('# ', '').trim();
          currentPage.drawText(text, {
            x: margin,
            y: yPosition,
            size: 18,
            font: helveticaBold,
            color: rgb(0, 0, 0),
          });
          yPosition -= 25;
        } else if (line.startsWith('## ')) {
          // Subheaders
          yPosition -= 15;
          const text = line.replace('## ', '').trim();
          currentPage.drawText(text, {
            x: margin,
            y: yPosition,
            size: 16,
            font: helveticaBold,
            color: rgb(0, 0, 0),
          });
          yPosition -= 20;
        } else if (line.startsWith('- ')) {
          // Bullet points
          const bulletText = line.replace('- ', '').trim();
          const wrappedLines = wrapText(bulletText, contentWidth - 20, helveticaFont, 11, currentPage);
          
          wrappedLines.forEach((wrappedLine, index) => {
            if (yPosition < margin + 50) {
              currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
              yPosition = pageHeight - margin;
            }
            
            if (index === 0) {
              currentPage.drawText('•', {
                x: margin,
                y: yPosition,
                size: 11,
                font: helveticaFont,
                color: rgb(0, 0, 0),
              });
            }
            
            currentPage.drawText(wrappedLine, {
              x: margin + 15,
              y: yPosition,
              size: 11,
              font: helveticaFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= 20;
          });
        } else {
          // Regular text
          const wrappedLines = wrapText(line, contentWidth, helveticaFont, 11, currentPage);
          
          wrappedLines.forEach(wrappedLine => {
            if (yPosition < margin + 50) {
              currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
              yPosition = pageHeight - margin;
            }
            
            currentPage.drawText(wrappedLine, {
              x: margin,
              y: yPosition,
              size: 11,
              font: helveticaFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= 20;
          });
        }
      }
      
      
      // Save and download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `enhanced-report-${date}.pdf`;
      link.click();
      
      setLoading(false);
    } catch (error) {
      console.error('Error generating enhanced PDF:', error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enhanced Meeting Report Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <button 
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={analyzeTranscript}
            disabled={loading}
          >
            {loading ? 'Generating Enhanced Report...' : 'Generate Report'}
          </button>
        </CardContent>
      </Card>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.progressMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sentiment Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.sentimentScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#4F46E5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.keyStats.completedActions}</p>
                    <p className="text-sm text-gray-600">Completed Actions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.keyStats.pendingItems}</p>
                    <p className="text-sm text-gray-600">Pending Items</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.keyStats.totalActions}</p>
                    <p className="text-sm text-gray-600">Total Actions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.keyStats.successRate}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {report.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportGenerator;