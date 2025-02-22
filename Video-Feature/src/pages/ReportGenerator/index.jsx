import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/pages/ui/card';
import MetricsDisplay from './MetricsDisplay';
import ReportPreview from './ReportPreview';
import { useReportGeneration } from './hooks/useReportGeneration';

const ReportGenerator = ({ transcript }) => {
  const { loading, report, metrics, analyzeTranscript } = useReportGeneration(transcript);

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

      {metrics && <MetricsDisplay metrics={metrics} />}
      {report && <ReportPreview report={report} />}
    </div>
  );
};

export default ReportGenerator;