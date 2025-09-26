import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ABTest,
  ABTestDocument,
  ABTestStatus,
  ABTestType,
  ABTestGoal,
  VariantType,
} from './ab-test.schema';
import {
  ABTestParticipation,
  ABTestParticipationDocument,
  ParticipationEvent,
} from './ab-test-participation.schema';
import * as crypto from 'crypto';

export interface VariantAssignment {
  testId: string;
  variantId: string;
  variantConfig: Record<string, any>;
  isControl: boolean;
}

export interface ABTestResults {
  testId: string;
  status: ABTestStatus;
  totalParticipants: number;
  variantResults: {
    [variantId: string]: {
      participants: number;
      conversions: number;
      conversionRate: number;
      confidenceInterval: [number, number];
      statisticalSignificance: boolean;
      pValue: number;
      effectSize: number;
    };
  };
  winner?: string;
  confidenceLevel: number;
  recommendation: string;
  sampleSizeAdequate: boolean;
}

@Injectable()
export class ABTestingService {
  private readonly logger = new Logger(ABTestingService.name);

  constructor(
    @InjectModel(ABTest.name) private abTestModel: Model<ABTestDocument>,
    @InjectModel(ABTestParticipation.name)
    private participationModel: Model<ABTestParticipationDocument>,
  ) {}

  /**
   * Assign a user to a variant for a given test
   */
  async assignVariant(
    testId: string,
    userId: string,
    sessionId: string,
    context?: Record<string, any>,
  ): Promise<VariantAssignment | null> {
    try {
      // Get the active test
      const test = await this.abTestModel.findOne({
        _id: testId,
        status: ABTestStatus.ACTIVE,
        'schedule.startDate': { $lte: new Date() },
        $or: [
          { 'schedule.endDate': { $exists: false } },
          { 'schedule.endDate': { $gte: new Date() } },
        ],
      });

      if (!test) {
        return null;
      }

      // Check if user is already assigned to this test
      const existingParticipation = await this.participationModel.findOne({
        testId,
        userId,
        event: ParticipationEvent.ASSIGNED,
      });

      if (existingParticipation) {
        const variant = test.variants[existingParticipation.variantId];
        return {
          testId,
          variantId: existingParticipation.variantId,
          variantConfig: variant?.config || {},
          isControl: existingParticipation.variantId === VariantType.CONTROL,
        };
      }

      // Check target audience
      if (!this.isUserInTargetAudience(userId, test.targetAudience)) {
        return null;
      }

      // Assign variant using consistent hashing
      const variantId = this.assignVariantByHash(userId, testId, test.variants);

      // Record assignment
      await this.participationModel.create({
        testId,
        userId,
        variantId,
        sessionId,
        event: ParticipationEvent.ASSIGNED,
        context,
        timestamp: new Date(),
      });

      const variant = test.variants[variantId];
      return {
        testId,
        variantId,
        variantConfig: variant?.config || {},
        isControl: variantId === VariantType.CONTROL,
      };
    } catch (error) {
      this.logger.error(`Error assigning variant for test ${testId}:`, error);
      return null;
    }
  }

  /**
   * Record a participation event
   */
  async recordEvent(
    testId: string,
    userId: string,
    event: ParticipationEvent,
    context?: Record<string, any>,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Get user's assigned variant
      const assignment = await this.participationModel.findOne({
        testId,
        userId,
        event: ParticipationEvent.ASSIGNED,
      });

      if (!assignment) {
        return; // User not assigned to this test
      }

      await this.participationModel.create({
        testId,
        userId,
        variantId: assignment.variantId,
        sessionId: assignment.sessionId,
        event,
        context,
        metadata,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error recording event for test ${testId}:`, error);
    }
  }

  /**
   * Calculate test results with statistical analysis
   */
  async calculateResults(testId: string): Promise<ABTestResults | null> {
    try {
      const test = await this.abTestModel.findById(testId);
      if (!test) return null;

      // Get all participations for this test
      const participations = await this.participationModel.find({ testId });

      // Group by variant
      const variantStats = this.groupParticipationsByVariant(participations);

      // Calculate statistical significance
      const results = this.calculateStatisticalSignificance(variantStats, test.goal);

      // Determine winner and recommendation
      const { winner, recommendation } = this.determineWinner(results, test);

      // Check if sample size is adequate
      const sampleSizeAdequate = this.checkSampleSizeAdequate(
        variantStats,
        test.schedule.minSampleSize || 1000,
      );

      return {
        testId,
        status: test.status,
        totalParticipants: participations.length,
        variantResults: results,
        winner: winner || undefined,
        confidenceLevel: this.calculateOverallConfidence(results),
        recommendation,
        sampleSizeAdequate,
      };
    } catch (error) {
      this.logger.error(`Error calculating results for test ${testId}:`, error);
      return null;
    }
  }

  /**
   * Get all active tests for a user
   */
  async getActiveTestsForUser(userId: string): Promise<ABTestDocument[]> {
    try {
      const now = new Date();
      return await this.abTestModel.find({
        status: ABTestStatus.ACTIVE,
        'schedule.startDate': { $lte: now },
        $or: [
          { 'schedule.endDate': { $exists: false } },
          { 'schedule.endDate': { $gte: now } },
        ],
      });
    } catch (error) {
      this.logger.error(`Error getting active tests for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Create a new A/B test
   */
  async createTest(testData: Partial<ABTest>): Promise<ABTestDocument> {
    try {
      // Validate test configuration
      this.validateTestConfiguration(testData);

      const test = new this.abTestModel({
        ...testData,
        status: ABTestStatus.DRAFT,
        createdBy: testData.createdBy || 'system',
      });

      return await test.save();
    } catch (error) {
      this.logger.error('Error creating A/B test:', error);
      throw error;
    }
  }

  /**
   * Start an A/B test
   */
  async startTest(testId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.abTestModel.updateOne(
        { _id: testId, status: ABTestStatus.DRAFT },
        {
          status: ABTestStatus.ACTIVE,
          'schedule.startDate': new Date(),
          updatedBy: userId,
        },
      );

      return result.modifiedCount > 0;
    } catch (error) {
      this.logger.error(`Error starting test ${testId}:`, error);
      return false;
    }
  }

  /**
   * Stop an A/B test
   */
  async stopTest(testId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.abTestModel.updateOne(
        { _id: testId, status: ABTestStatus.ACTIVE },
        {
          status: ABTestStatus.COMPLETED,
          'schedule.endDate': new Date(),
          updatedBy: userId,
        },
      );

      return result.modifiedCount > 0;
    } catch (error) {
      this.logger.error(`Error stopping test ${testId}:`, error);
      return false;
    }
  }

  // Private helper methods

  private assignVariantByHash(
    userId: string,
    testId: string,
    variants: Record<string, any>,
  ): string {
    // Create consistent hash for user-test combination
    const hashInput = `${userId}:${testId}`;
    const hash = crypto.createHash('md5').update(hashInput).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16) / 0xffffffff; // 0-1

    // Assign based on weights
    let cumulativeWeight = 0;
    const variantIds = Object.keys(variants);

    for (const variantId of variantIds) {
      cumulativeWeight += variants[variantId].weight / 100;
      if (hashValue <= cumulativeWeight) {
        return variantId;
      }
    }

    // Fallback to first variant
    return variantIds[0];
  }

  private isUserInTargetAudience(userId: string, targetAudience: any): boolean {
    // TODO: Implement proper audience targeting logic
    // For now, include all users except explicitly excluded
    return !targetAudience.excludeUserIds?.includes(userId);
  }

  private groupParticipationsByVariant(participations: ABTestParticipationDocument[]) {
    const variantStats: { [key: string]: any } = {};

    for (const participation of participations) {
      const { variantId, event } = participation;

      if (!variantStats[variantId]) {
        variantStats[variantId] = {
          participants: new Set(),
          conversions: new Set(),
          exposures: 0,
          interactions: 0,
        };
      }

      // Count unique participants
      variantStats[variantId].participants.add(participation.userId);

      // Count different event types
      if (event === ParticipationEvent.EXPOSED) {
        variantStats[variantId].exposures++;
      } else if (event === ParticipationEvent.CONVERTED) {
        variantStats[variantId].conversions.add(participation.userId);
      } else if (event === ParticipationEvent.INTERACTED) {
        variantStats[variantId].interactions++;
      }
    }

    // Convert sets to counts
    for (const variantId in variantStats) {
      variantStats[variantId] = {
        participants: variantStats[variantId].participants.size,
        conversions: variantStats[variantId].conversions.size,
        exposures: variantStats[variantId].exposures,
        interactions: variantStats[variantId].interactions,
      };
    }

    return variantStats;
  }

  private calculateStatisticalSignificance(variantStats: any, goal: ABTestGoal) {
    const results: { [key: string]: any } = {};

    // Calculate conversion rates and statistical tests
    for (const [variantId, stats] of Object.entries(variantStats)) {
      const participants = (stats as any).participants;
      const conversions = (stats as any).conversions;

      if (participants === 0) continue;

      const conversionRate = conversions / participants;

      // Calculate confidence interval (simplified)
      const standardError = Math.sqrt(conversionRate * (1 - conversionRate) / participants);
      const confidenceInterval: [number, number] = [
        Math.max(0, conversionRate - 1.96 * standardError),
        Math.min(1, conversionRate + 1.96 * standardError),
      ];

      results[variantId] = {
        participants,
        conversions,
        conversionRate,
        confidenceInterval,
        statisticalSignificance: false, // TODO: Implement proper statistical tests
        pValue: 0.5, // Placeholder
        effectSize: 0, // Placeholder
      };
    }

    return results;
  }

  private determineWinner(results: any, test: ABTestDocument) {
    // Find variant with highest conversion rate
    let winner: string | null = null;
    let maxConversionRate = -1;

    for (const [variantId, stats] of Object.entries(results)) {
      if ((stats as any).conversionRate > maxConversionRate) {
        maxConversionRate = (stats as any).conversionRate;
        winner = variantId;
      }
    }

    let recommendation = 'Continue testing to gather more data';

    if (winner && results[winner].statisticalSignificance) {
      recommendation = `Variant ${winner} shows statistically significant improvement. Consider implementing it.`;
    } else if (winner) {
      recommendation = `Variant ${winner} shows promising results but needs more data for statistical significance.`;
    }

    return { winner, recommendation };
  }

  private calculateOverallConfidence(results: any): number {
    // Simplified confidence calculation
    const significantResults = Object.values(results).filter(
      (r: any) => r.statisticalSignificance,
    );
    return significantResults.length / Object.keys(results).length;
  }

  private checkSampleSizeAdequate(variantStats: any, minSampleSize: number): boolean {
    const minParticipants = Math.min(
      ...Object.values(variantStats).map((s: any) => s.participants),
    );
    return minParticipants >= minSampleSize;
  }

  private validateTestConfiguration(testData: Partial<ABTest>): void {
    // Validate variants
    if (!testData.variants || Object.keys(testData.variants).length < 2) {
      throw new Error('Test must have at least 2 variants');
    }

    // Validate weights sum to 100
    const totalWeight = Object.values(testData.variants).reduce(
      (sum: number, variant: any) => sum + variant.weight,
      0,
    );

    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant weights must sum to 100');
    }

    // Validate schedule
    if (!testData.schedule?.startDate) {
      throw new Error('Test must have a start date');
    }
  }
}
