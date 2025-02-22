import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/pages/ui/card';

const ReportPreview = ({ report }) => {
  return (
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
  );
};

export default ReportPreview;