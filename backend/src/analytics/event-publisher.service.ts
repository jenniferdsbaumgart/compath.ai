import { Injectable } from '@nestjs/common';
import { EventStoreService, StoredEvent } from './event-store.service';
import { EventType } from './event-store.schema';
import {
  UserRegisteredEvent,
  UserLoggedInEvent,
  UserProfileUpdatedEvent,
  UserCoinsSpentEvent,
  UserCoinsEarnedEvent,
} from '../events/user.events';
import {
  ReportGeneratedEvent,
  ReportViewedEvent,
  ReportSharedEvent,
} from '../events/report.events';

@Injectable()
export class EventPublisherService {
  constructor(private readonly eventStore: EventStoreService) {}

  async publish(event: any): Promise<void> {
    const storedEvent = this.mapToStoredEvent(event);
    if (storedEvent) {
      await this.eventStore.store(storedEvent);
    }
  }

  private mapToStoredEvent(event: any): StoredEvent | null {
    const baseEvent = {
      timestamp: event.timestamp || new Date(),
      metadata: event.metadata || {},
    };

    switch (event.constructor.name) {
      case 'UserRegisteredEvent':
        return {
          ...baseEvent,
          eventType: EventType.USER_REGISTERED,
          aggregateId: event.userId,
          aggregateType: 'user',
          version: 1,
          eventData: {
            userId: event.userId,
            email: event.email,
            name: event.name,
          },
        };

      case 'UserLoggedInEvent':
        return {
          ...baseEvent,
          eventType: EventType.USER_LOGGED_IN,
          aggregateId: event.userId,
          aggregateType: 'user',
          version: this.generateVersion(),
          eventData: {
            userId: event.userId,
            email: event.email,
          },
        };

      case 'UserProfileUpdatedEvent':
        return {
          ...baseEvent,
          eventType: EventType.USER_PROFILE_UPDATED,
          aggregateId: event.userId,
          aggregateType: 'user',
          version: this.generateVersion(),
          eventData: {
            userId: event.userId,
            changes: event.changes,
          },
        };

      case 'UserCoinsSpentEvent':
        return {
          ...baseEvent,
          eventType: EventType.USER_COINS_SPENT,
          aggregateId: event.userId,
          aggregateType: 'user',
          version: this.generateVersion(),
          eventData: {
            userId: event.userId,
            amount: event.amount,
            purpose: event.purpose,
            remainingCoins: event.remainingCoins,
          },
        };

      case 'UserCoinsEarnedEvent':
        return {
          ...baseEvent,
          eventType: EventType.USER_COINS_EARNED,
          aggregateId: event.userId,
          aggregateType: 'user',
          version: this.generateVersion(),
          eventData: {
            userId: event.userId,
            amount: event.amount,
            source: event.source,
            totalCoins: event.totalCoins,
          },
        };

      case 'ReportGeneratedEvent':
        return {
          ...baseEvent,
          eventType: EventType.REPORT_GENERATED,
          aggregateId: event.reportId,
          aggregateType: 'report',
          version: 1,
          eventData: {
            reportId: event.reportId,
            userId: event.userId,
            searchQuery: event.searchQuery,
            reportData: event.reportData,
          },
        };

      case 'ReportViewedEvent':
        return {
          ...baseEvent,
          eventType: EventType.REPORT_VIEWED,
          aggregateId: event.reportId,
          aggregateType: 'report',
          version: this.generateVersion(),
          eventData: {
            reportId: event.reportId,
            userId: event.userId,
          },
        };

      case 'ReportSharedEvent':
        return {
          ...baseEvent,
          eventType: EventType.REPORT_SHARED,
          aggregateId: event.reportId,
          aggregateType: 'report',
          version: this.generateVersion(),
          eventData: {
            reportId: event.reportId,
            userId: event.userId,
            sharedWith: event.sharedWith,
          },
        };

      default:
        console.warn(`Unknown event type: ${event.constructor.name}`);
        return null;
    }
  }

  private generateVersion(): number {
    // In a real implementation, you'd track versions per aggregate
    // For simplicity, using timestamp-based versioning
    return Date.now();
  }
}
