// 1. Initialize tracing FIRST
import { setupTracing } from '../../../tracer';
setupTracing('payment-service');

import { NestFactory } from '@nestjs/core';
import { PaymentServiceModule } from './payment-service.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(PaymentServiceModule);
  // Tell Nest to use the Pino logger
  app.useLogger(app.get(Logger));
  // Run on port 3001 so it doesn't conflict with Service A
  await app.listen(3001);
  app
    .get(Logger)
    .log('Payment Service (Service B) is running on http://localhost:3001');
}
bootstrap().catch((err) => {
  console.error('NestJS application failed to start', err);
  process.exit(1);
});
