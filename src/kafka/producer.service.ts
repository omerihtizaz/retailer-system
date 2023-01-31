import { Injectable } from '@nestjs/common';
import { IP_PORT } from './kafka-constants';
import {
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common/interfaces/hooks';
import { ProducerRecord } from '@nestjs/microservices/external/kafka.interface';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: [IP_PORT],
  });
  private readonly producer: Producer = this.kafka.producer();

  async onModuleInit() {
    await this.producer.connect();
  }
  async onApplicationShutdown(signal?: string) {
    await this.producer.disconnect();
  }
  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }
}
