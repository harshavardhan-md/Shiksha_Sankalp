import { useState } from 'react';
import { generateTranscriptAnalysis } from '../services/reportAnalysis';
import { generatePDF } from '../services/pdfGenerator';
import { extractMetricsFromAnalysis } from '../utils/metricsExtractor';

export const useReportGeneration = (transcript) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const analyzeTranscript = async () => {
    try {
      setLoading(true);
      
      const analysis = await generateTranscriptAnalysis(transcript);
      const extractedMetrics = extractMetricsFromAnalysis(analysis);
      
      setMetrics(extractedMetrics);
      setReport(analysis);
      
      await generatePDF(analysis, extractedMetrics);
      
    } catch (error) {
      console.error('Error analyzing transcript:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    report,
    metrics,
    analyzeTranscript
  };
};