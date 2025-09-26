import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventStore,
  EventStoreDocument,
  EventType,
} from './event-store.schema';

export interface StoredEvent {
  eventType: EventType;
  aggregateId: string;
  aggregateType: string;
  eventData: Record<string, any>;
  version: number;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    correlationId?: string;
  };
  timestamp?: Date;
}

@Injectable()
export class EventStoreService {
  constructor(
    @InjectModel(EventStore.name)
    private eventStoreModel: Model<EventStoreDocument>,
  ) {}

  async store(event: StoredEvent): Promise<EventStoreDocument> {
    const eventDoc = new this.eventStoreModel({
      ...event,
      timestamp: event.timestamp || new Date(),
    });

    return eventDoc.save();
  }

  async getEventsByAggregate(
    aggregateId: string,
    aggregateType: string,
    fromVersion?: number,
  ): Promise<EventStoreDocument[]> {
    const query: any = { aggregateId, aggregateType };
    if (fromVersion !== undefined) {
      query.version = { $gte: fromVersion };
    }

    return this.eventStoreModel.find(query).sort({ version: 1 }).exec();
  }

  async getEventsByType(
    eventType: EventType,
    limit = 100,
    offset = 0,
  ): Promise<EventStoreDocument[]> {
    return this.eventStoreModel
      .find({ eventType })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
  }

  async getEventsByUser(
    userId: string,
    limit = 100,
    offset = 0,
  ): Promise<EventStoreDocument[]> {
    return this.eventStoreModel
      .find({ 'eventData.userId': userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
  }

  async getEventsInTimeRange(
    startDate: Date,
    endDate: Date,
    eventTypes?: EventType[],
  ): Promise<EventStoreDocument[]> {
    const query: any = {
      timestamp: { $gte: startDate, $lte: endDate },
    };

    if (eventTypes && eventTypes.length > 0) {
      query.eventType = { $in: eventTypes };
    }

    return this.eventStoreModel.find(query).sort({ timestamp: 1 }).exec();
  }

  async getLatestVersion(
    aggregateId: string,
    aggregateType: string,
  ): Promise<number> {
    const latestEvent = await this.eventStoreModel
      .findOne({ aggregateId, aggregateType })
      .sort({ version: -1 })
      .exec();

    return latestEvent ? latestEvent.version : 0;
  }

  async replayEvents(
    aggregateId: string,
    aggregateType: string,
  ): Promise<EventStoreDocument[]> {
    return this.getEventsByAggregate(aggregateId, aggregateType);
  }
}
