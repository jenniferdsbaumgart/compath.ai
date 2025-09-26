import { SetMetadata } from '@nestjs/common';

export const AB_TEST_KEY = 'ab-test';

export interface ABTestMetadata {
  testId: string;
  feature: string;
}

/**
 * Decorator to mark endpoints that participate in A/B testing
 * @param testId - The ID of the A/B test
 * @param feature - The feature name being tested
 */
export const ABTest = (testId: string, feature: string) => {
  return SetMetadata(AB_TEST_KEY, { testId, feature });
};

/**
 * Decorator to record A/B test events
 * @param event - The event type to record
 * @param metadata - Additional metadata for the event
 */
export const RecordABEvent = (event: string, metadata?: any) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args[0]; // Assuming first parameter is request
      const result = await originalMethod.apply(this, args);

      // Record the event if A/B testing is active
      if (request.abTests && this.abTestingService) {
        const abTestData = Object.values(request.abTests)[0] as any;
        if (abTestData && abTestData.testId) {
          const userId = request.user?.id || request.user?._id;
          if (userId) {
            await this.abTestingService.recordEvent(
              abTestData.testId,
              userId,
              event,
              {
                feature: abTestData.feature,
                path: request.path,
                method: request.method,
              },
              metadata,
            );
          }
        }
      }

      return result;
    };

    return descriptor;
  };
};
