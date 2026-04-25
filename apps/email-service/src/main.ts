// 1. Initialize tracing FIRST
import { setupTracing } from '../../../libs/tracing/src/tracer';
setupTracing('email-service');

import { NestFactory } from '@nestjs/core';
import { EmailModule } from './email.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  // 2. Create a pure Microservice instead of a standard HTTP app
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EmailModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'demo_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  // Tell Nest to use the Pino logger
  app.useLogger(app.get(Logger));

  await app.listen();
  app.get(Logger).log('Email Service (Service C) is listening to RabbitMQ...');
}
bootstrap().catch((err) => {
  console.error('NestJS application failed to start', err);
  process.exit(1);
});
