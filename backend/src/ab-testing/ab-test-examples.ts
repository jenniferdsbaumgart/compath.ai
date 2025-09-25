import { ABTestType, ABTestGoal, VariantType } from './ab-test.schema';

/**
 * Examples of A/B tests that can be created for Compath.ai
 * This file demonstrates various test types and configurations
 */

export const AB_TEST_EXAMPLES = {
  // UI/UX Tests
  dashboard_layout: {
    name: 'Dashboard Layout Optimization',
    description: 'Test different dashboard layouts to improve user engagement',
    type: ABTestType.UI_VARIANT,
    goal: ABTestGoal.USER_ENGAGEMENT,
    variants: {
      [VariantType.CONTROL]: {
        name: 'Current Layout',
        description: 'Standard dashboard layout',
        weight: 50,
        config: {
          layout: 'standard',
          showExtraMetrics: false,
          compactLayout: false,
        },
      },
      variant_a: {
        name: 'Enhanced Metrics',
        description: 'Show additional performance metrics',
        weight: 25,
        config: {
          layout: 'standard',
          showExtraMetrics: true,
          compactLayout: false,
        },
      },
      variant_b: {
        name: 'Compact Layout',
        description: 'More compact layout with better space utilization',
        weight: 25,
        config: {
          layout: 'compact',
          showExtraMetrics: false,
          compactLayout: true,
        },
      },
    },
    targetAudience: {
      userSegments: ['active_users', 'premium_users'],
      userTypes: ['entrepreneur', 'business_owner'],
    },
    schedule: {
      startDate: new Date(),
      minSampleSize: 1000,
      statisticalSignificance: 0.95,
    },
    metadata: {
      tags: ['ui', 'dashboard', 'engagement'],
      priority: 'high',
      businessValue: 5000,
      estimatedImpact: '5-15% increase in user engagement',
    },
  },

  report_generation_flow: {
    name: 'Report Generation User Flow',
    description: 'Test different approaches to report generation onboarding',
    type: ABTestType.UI_VARIANT,
    goal: ABTestGoal.REPORT_GENERATION,
    variants: {
      [VariantType.CONTROL]: {
        name: 'Standard Flow',
        description: 'Current report generation process',
        weight: 50,
        config: {
          showTutorial: false,
          autoSave: false,
          previewEnabled: false,
        },
      },
      variant_a: {
        name: 'Guided Tutorial',
        description: 'Add interactive tutorial for first-time users',
        weight: 25,
        config: {
          showTutorial: true,
          autoSave: true,
          previewEnabled: true,
        },
      },
      variant_b: {
        name: 'Simplified Flow',
        description: 'Streamline the report generation with fewer steps',
        weight: 25,
        config: {
          showTutorial: false,
          autoSave: true,
          previewEnabled: false,
          simplifiedSteps: true,
        },
      },
    },
    targetAudience: {
      userSegments: ['new_users', 'trial_users'],
      excludeUserIds: [], // Exclude power users who already know the flow
    },
    schedule: {
      startDate: new Date(),
      minSampleSize: 500,
      statisticalSignificance: 0.90,
    },
    metadata: {
      tags: ['onboarding', 'conversion', 'reports'],
      priority: 'high',
      businessValue: 8000,
      estimatedImpact: '10-25% increase in report generation',
    },
  },

  // Feature Tests
  ai_recommendations: {
    name: 'AI-Powered Niche Recommendations',
    description: 'Test different AI recommendation algorithms',
    type: ABTestType.ALGORITHM,
    goal: ABTestGoal.CONVERSION_RATE,
    variants: {
      [VariantType.CONTROL]: {
        name: 'Basic KNN',
        description: 'Current KNN algorithm implementation',
        weight: 50,
        config: {
          algorithm: 'knn_basic',
          confidenceThreshold: 0.5,
          maxRecommendations: 5,
        },
      },
      variant_a: {
        name: 'Enhanced KNN',
        description: 'Improved KNN with hyperparameter tuning',
        weight: 25,
        config: {
          algorithm: 'knn_enhanced',
          confidenceThreshold: 0.7,
          maxRecommendations: 5,
          useEnsemble: true,
        },
      },
      variant_b: {
        name: 'Hybrid Approach',
        description: 'Combine KNN with content-based filtering',
        weight: 25,
        config: {
          algorithm: 'hybrid',
          confidenceThreshold: 0.6,
          maxRecommendations: 7,
          useContentFeatures: true,
        },
      },
    },
    targetAudience: {
      userSegments: ['active_users'],
      userTypes: ['entrepreneur', 'startup_founder'],
    },
    schedule: {
      startDate: new Date(),
      minSampleSize: 2000,
      statisticalSignificance: 0.95,
    },
    metadata: {
      tags: ['ai', 'recommendations', 'algorithm'],
      priority: 'critical',
      businessValue: 15000,
      estimatedImpact: '15-30% improvement in recommendation accuracy',
    },
  },

  // Pricing Tests
  coin_system_pricing: {
    name: 'Coin System Pricing Optimization',
    description: 'Test different coin pricing strategies',
    type: ABTestType.PRICING,
    goal: ABTestGoal.REVENUE,
    variants: {
      [VariantType.CONTROL]: {
        name: 'Current Pricing',
        description: '10 coins per report, 50 bonus coins for signup',
        weight: 50,
        config: {
          coinsPerReport: 10,
          signupBonus: 50,
          referralBonus: 25,
        },
      },
      variant_a: {
        name: 'Tiered Pricing',
        description: 'Dynamic pricing based on report complexity',
        weight: 25,
        config: {
          coinsPerReport: { simple: 8, standard: 12, detailed: 15 },
          signupBonus: 75,
          referralBonus: 30,
        },
      },
      variant_b: {
        name: 'Subscription Model',
        description: 'Unlimited reports for premium subscribers',
        weight: 25,
        config: {
          subscriptionEnabled: true,
          monthlyPrice: 9.99,
          unlimitedReports: true,
          coinsPerReport: 0, // Free for subscribers
        },
      },
    },
    targetAudience: {
      userSegments: ['paying_users', 'high_usage_users'],
    },
    schedule: {
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Start in 1 week
      minSampleSize: 1000,
      statisticalSignificance: 0.95,
    },
    metadata: {
      tags: ['pricing', 'monetization', 'revenue'],
      priority: 'critical',
      businessValue: 25000,
      estimatedImpact: '20-40% increase in revenue',
    },
  },

  // Content Tests
  niche_suggestions_content: {
    name: 'Niche Suggestion Content Optimization',
    description: 'Test different content styles for niche suggestions',
    type: ABTestType.CONTENT,
    goal: ABTestGoal.USER_ENGAGEMENT,
    variants: {
      [VariantType.CONTROL]: {
        name: 'Factual Approach',
        description: 'Present data-driven niche suggestions',
        weight: 50,
        config: {
          style: 'factual',
          includeMarketData: true,
          includeCompetitorAnalysis: false,
          tone: 'professional',
        },
      },
      variant_a: {
        name: 'Storytelling Approach',
        description: 'Use narrative style with success stories',
        weight: 25,
        config: {
          style: 'storytelling',
          includeMarketData: true,
          includeCompetitorAnalysis: true,
          includeSuccessStories: true,
          tone: 'inspirational',
        },
      },
      variant_b: {
        name: 'Action-Oriented',
        description: 'Focus on actionable next steps',
        weight: 25,
        config: {
          style: 'action_oriented',
          includeMarketData: false,
          includeCompetitorAnalysis: true,
          includeActionItems: true,
          tone: 'motivational',
        },
      },
    },
    targetAudience: {
      userSegments: ['engaged_users'],
      userTypes: ['entrepreneur', 'side_hustler'],
    },
    schedule: {
      startDate: new Date(),
      minSampleSize: 1500,
      statisticalSignificance: 0.90,
    },
    metadata: {
      tags: ['content', 'engagement', 'copywriting'],
      priority: 'medium',
      businessValue: 3000,
      estimatedImpact: '8-20% increase in user engagement',
    },
  },

  // Feature Flag Tests
  notifications_system: {
    name: 'Real-time Notifications System',
    description: 'Test impact of real-time notifications on user engagement',
    type: ABTestType.FEATURE_FLAG,
    goal: ABTestGoal.USER_ENGAGEMENT,
    variants: {
      [VariantType.CONTROL]: {
        name: 'No Real-time Notifications',
        description: 'Standard email notifications only',
        weight: 50,
        config: {
          realTimeNotifications: false,
          emailNotifications: true,
          pushNotifications: false,
        },
      },
      variant_a: {
        name: 'Real-time Only',
        description: 'WebSocket real-time notifications',
        weight: 25,
        config: {
          realTimeNotifications: true,
          emailNotifications: false,
          pushNotifications: false,
        },
      },
      variant_b: {
        name: 'Multi-channel',
        description: 'Real-time + email + push notifications',
        weight: 25,
        config: {
          realTimeNotifications: true,
          emailNotifications: true,
          pushNotifications: true,
        },
      },
    },
    targetAudience: {
      userSegments: ['active_users', 'premium_users'],
    },
    schedule: {
      startDate: new Date(),
      minSampleSize: 800,
      statisticalSignificance: 0.95,
    },
    metadata: {
      tags: ['notifications', 'engagement', 'retention'],
      priority: 'high',
      businessValue: 6000,
      estimatedImpact: '12-25% increase in user engagement',
    },
  },
};

/**
 * Helper function to create a test from the examples
 */
export function createTestFromExample(exampleKey: keyof typeof AB_TEST_EXAMPLES) {
  return AB_TEST_EXAMPLES[exampleKey];
}

/**
 * Helper function to get test recommendations based on current metrics
 */
export function getRecommendedTests(currentMetrics: {
  userEngagement: number;
  conversionRate: number;
  reportGenerationRate: number;
  revenue: number;
}) {
  const recommendations = [];

  if (currentMetrics.userEngagement < 0.3) {
    recommendations.push({
      test: 'dashboard_layout',
      reason: 'Low user engagement suggests UI/UX improvements needed',
      expectedImpact: 'high',
    });
  }

  if (currentMetrics.conversionRate < 0.05) {
    recommendations.push({
      test: 'report_generation_flow',
      reason: 'Low conversion rate indicates onboarding issues',
      expectedImpact: 'high',
    });
  }

  if (currentMetrics.reportGenerationRate < 0.1) {
    recommendations.push({
      test: 'ai_recommendations',
      reason: 'Low report generation suggests recommendation quality issues',
      expectedImpact: 'critical',
    });
  }

  if (currentMetrics.revenue < 1000) { // Monthly revenue threshold
    recommendations.push({
      test: 'coin_system_pricing',
      reason: 'Low revenue suggests pricing optimization needed',
      expectedImpact: 'critical',
    });
  }

  return recommendations;
}
