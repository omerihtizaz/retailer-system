import { Injectable } from '@nestjs/common';
import { GROUP_ID, IP_PORT } from './kafka-constants';
import { OnApplicationShutdown } from '@nestjs/common/interfaces/hooks';
import {
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
} from '@nestjs/microservices/external/kafka.interface';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: [IP_PORT],
  });
  private readonly consumers: Consumer[] = [];

  async consume(topic: ConsumerSubscribeTopics, config: ConsumerRunConfig) {
    const consumer = this.kafka.consumer({ groupId: GROUP_ID });
    await consumer.connect();
    await consumer.subscribe(topic);
    await consumer.run(config);
    this.consumers.push(consumer);
  }
  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
