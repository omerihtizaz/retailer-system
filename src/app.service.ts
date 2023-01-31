import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return 'Hello World!';
  }
}
// constructor(private readonly producerService: ProducerService) {}
// async getHello() {
//   await this.producerService.produce({
//     topic: 'testing',
//     messages: [
//       {
//         value: 'Testing for Kafka',
//       },
//     ],
//   });
