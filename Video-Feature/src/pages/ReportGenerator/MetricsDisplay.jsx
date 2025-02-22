import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/pages/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpCircle, AlertCircle, CheckCircle } from 'lucide-react';

const MetricsDisplay = ({ metrics }) => {
  return (
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
            <StatisticItem
              icon={<CheckCircle className="text-green-500" />}
              value={metrics.keyStats.completedActions}
              label="Completed Actions"
            />
            <StatisticItem
              icon={<AlertCircle className="text-yellow-500" />}
              value={metrics.keyStats.pendingItems}
              label="Pending Items"
            />
            <StatisticItem
              icon={<ArrowUpCircle className="text-blue-500" />}
              value={metrics.keyStats.totalActions}
              label="Total Actions"
            />
            <StatisticItem
              icon={<ArrowUpCircle className="text-purple-500" />}
              value={`${metrics.keyStats.successRate}%`}
              label="Success Rate"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatisticItem = ({ icon, value, label }) => (
  <div className="flex items-center gap-2">
    {icon}
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  </div>
);

export default MetricsDisplay;