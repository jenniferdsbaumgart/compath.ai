import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ABTestingService } from './ab-testing.service';

export interface ABTestMetadata {
  testId: string;
  feature: string;
}

@Injectable()
export class ABTestingGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abTestingService: ABTestingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.user?._id;

    if (!userId) {
      return true; // Allow access if no user (public endpoints)
    }

    // Get A/B test metadata from decorator
    const abTestMetadata = this.reflector.get<ABTestMetadata>(
      'ab-test',
      context.getHandler(),
    );

    if (!abTestMetadata) {
      return true; // No A/B test configured for this endpoint
    }

    const { testId, feature } = abTestMetadata;

    try {
      // Get active tests for user
      const activeTests = await this.abTestingService.getActiveTestsForUser(userId);

      // Find the specific test
      const test = activeTests.find(t => t._id.toString() === testId);

      if (!test) {
        // Test not found or not active, use control variant
        this.setControlVariant(request, feature);
        return true;
      }

      // Assign user to variant
      const assignment = await this.abTestingService.assignVariant(
        testId,
        userId,
        request.sessionId || `session_${Date.now()}`,
        {
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip,
          path: request.path,
          method: request.method,
        },
      );

      if (assignment) {
        // Record exposure event
        await this.abTestingService.recordEvent(
          testId,
          userId,
          'exposed',
          {
            feature,
            path: request.path,
            method: request.method,
          },
        );

        // Set variant in request
        this.setVariantInRequest(request, feature, assignment);
      } else {
        // User not eligible for test
        this.setControlVariant(request, feature);
      }

    } catch (error) {
      console.error('A/B Testing Guard error:', error);
      // On error, use control variant
      this.setControlVariant(request, feature);
    }

    return true;
  }

  private setVariantInRequest(
    request: any,
    feature: string,
    assignment: any,
  ): void {
    if (!request.abTests) {
      request.abTests = {};
    }

    request.abTests[feature] = {
      testId: assignment.testId,
      variantId: assignment.variantId,
      config: assignment.variantConfig,
      isControl: assignment.isControl,
    };
  }

  private setControlVariant(request: any, feature: string): void {
    if (!request.abTests) {
      request.abTests = {};
    }

    request.abTests[feature] = {
      testId: null,
      variantId: 'control',
      config: {},
      isControl: true,
    };
  }
}
