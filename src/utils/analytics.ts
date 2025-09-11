// Simple analytics utility for MVP tracking
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private readonly maxEvents = 100; // Keep last 100 events in memory

  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.pathname : '',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      },
      timestamp: new Date().toISOString(),
    };

    // Store in memory
    this.events.push(analyticsEvent);
    if (this.events.length > this.maxEvents) {
      this.events.shift(); // Remove oldest event
    }

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('analytics_events') || '[]';
        const storedEvents = JSON.parse(stored);
        storedEvents.push(analyticsEvent);
        
        // Keep only last 50 events in localStorage
        const recentEvents = storedEvents.slice(-50);
        localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
      } catch (error) {
        console.warn('Failed to store analytics event:', error);
      }
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', event, properties);
    }
  }

  // Track page views
  trackPageView(page: string) {
    this.track('page_view', { page });
  }

  // Track user actions
  trackAction(action: string, details?: Record<string, any>) {
    this.track('user_action', { action, ...details });
  }

  // Track essay analysis
  trackAnalysis(wordCount: number, analysisTime: number) {
    this.track('essay_analysis', { 
      wordCount, 
      analysisTime,
      isSuccess: true 
    });
  }

  // Track errors
  trackError(error: string, context?: Record<string, any>) {
    this.track('error', { error, ...context });
  }

  // Get analytics summary for admin
  getAnalyticsSummary() {
    const events = this.events;
    const pageViews = events.filter(e => e.event === 'page_view').length;
    const analyses = events.filter(e => e.event === 'essay_analysis').length;
    const errors = events.filter(e => e.event === 'error').length;
    
    return {
      totalEvents: events.length,
      pageViews,
      analyses,
      errors,
      recentEvents: events.slice(-10),
    };
  }

  // Export data for analysis
  exportData() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('analytics_events') || '[]';
        const data = JSON.parse(stored);
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to export analytics:', error);
      }
    }
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Auto-track page views in client-side navigation
if (typeof window !== 'undefined') {
  // Track initial page load
  analytics.trackPageView(window.location.pathname);

  // Track navigation changes (for SPA routing)
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    analytics.trackPageView(window.location.pathname);
  };
}

export default analytics;