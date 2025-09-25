import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ABTestDocument = ABTest & Document;

export enum ABTestStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ABTestType {
  FEATURE_FLAG = 'feature_flag',
  UI_VARIANT = 'ui_variant',
  ALGORITHM = 'algorithm',
  PRICING = 'pricing',
  CONTENT = 'content',
}

export enum ABTestGoal {
  CONVERSION_RATE = 'conversion_rate',
  CLICK_THROUGH_RATE = 'click_through_rate',
  TIME_ON_PAGE = 'time_on_page',
  REVENUE = 'revenue',
  USER_ENGAGEMENT = 'user_engagement',
  REPORT_GENERATION = 'report_generation',
}

export enum VariantType {
  CONTROL = 'control',
  VARIANT_A = 'variant_a',
  VARIANT_B = 'variant_b',
  VARIANT_C = 'variant_c',
  VARIANT_D = 'variant_d',
}

@Schema({ timestamps: true, collection: 'ab_tests' })
export class ABTest {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ABTestType })
  type: ABTestType;

  @Prop({ required: true, enum: ABTestGoal })
  goal: ABTestGoal;

  @Prop({ required: true, enum: ABTestStatus, default: ABTestStatus.DRAFT })
  status: ABTestStatus;

  @Prop({ required: true, type: Object })
  variants: {
    [key: string]: {
      name: string;
      description: string;
      weight: number; // Percentage of traffic (0-100)
      config: Record<string, any>;
    };
  };

  @Prop({ required: true })
  targetAudience: {
    userSegments?: string[];
    countries?: string[];
    userTypes?: string[];
    excludeUserIds?: string[];
  };

  @Prop({ required: true })
  schedule: {
    startDate: Date;
    endDate?: Date;
    minSampleSize?: number;
    statisticalSignificance?: number; // 0.05 = 95% confidence
  };

  @Prop({ type: Object })
  results?: {
    startDate: Date;
    endDate?: Date;
    totalParticipants: number;
    variantResults: {
      [variantId: string]: {
        participants: number;
        conversions: number;
        conversionRate: number;
        confidenceInterval: [number, number];
        statisticalSignificance: boolean;
        metrics: {
          [metricName: string]: {
            value: number;
            variance: number;
            sampleSize: number;
          };
        };
      };
    };
    winner?: string;
    confidenceLevel: number;
    effectSize?: number;
    recommendation: string;
  };

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy?: string;

  @Prop({ type: Object })
  metadata?: {
    tags?: string[];
    priority?: 'low' | 'medium' | 'high' | 'critical';
    businessValue?: number;
    estimatedImpact?: string;
  };
}

export const ABTestSchema = SchemaFactory.createForClass(ABTest);

// Índices para performance
ABTestSchema.index({ status: 1, 'schedule.startDate': -1 });
ABTestSchema.index({ type: 1, status: 1 });
ABTestSchema.index({ 'targetAudience.userSegments': 1 });
ABTestSchema.index({ createdBy: 1 });
ABTestSchema.index({ 'metadata.tags': 1 });
