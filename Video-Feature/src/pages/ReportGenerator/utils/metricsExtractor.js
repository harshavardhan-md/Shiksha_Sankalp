export const extractMetricsFromAnalysis = (content) => {
    // For demo purposes, returning sample metrics
    // In a real implementation, this would analyze the content and extract actual metrics
    return {
      sentimentScores: [
        { month: 'Jan', score: 0.8 },
        { month: 'Feb', score: 0.85 },
        { month: 'Mar', score: 0.75 },
        { month: 'Apr', score: 0.9 },
        { month: 'May', score: 0.43 },
        { month: 'Jun', score: 0.18 },
        { month: 'Jul', score: 0.74 },
        { month: 'Aug', score: 0.63 }
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