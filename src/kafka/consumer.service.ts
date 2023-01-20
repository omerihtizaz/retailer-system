import { Injectable } from '@nestjs/common';
import {
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common/interfaces/hooks';
import {
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  ProducerRecord,
} from '@nestjs/microservices/external/kafka.interface';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: ['localhost:9092'],
  });
  private readonly consumers: Consumer[] = [];

  async consume(topic: ConsumerSubscribeTopics, config: ConsumerRunConfig) {
    const consumer = this.kafka.consumer({ groupId: 'nestjs-kafka' });
    await consumer.connect();
    console.log('Topic: ', topic);
    await consumer.subscribe(topic);
    console.log('Config: ', config);
    await consumer.run(config);
    this.consumers.push(consumer);
  }
  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
