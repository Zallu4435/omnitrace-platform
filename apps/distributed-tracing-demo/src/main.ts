// 0. Increase EventEmitter limit to prevent MaxListenersExceededWarning from OTel + Pino
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 15;

// 1. THIS MUST BE THE VERY FIRST IMPORT
import { setupTracing } from '../../../tracer';
setupTracing('order-gateway');

// 2. Now import the rest of NestJS
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Tell Nest to use the Pino logger
  app.useLogger(app.get(Logger));
  // We will run Service A on port 3000
  await app.listen(3000);
  app
    .get(Logger)
    .log('Order Gateway (Service A) is running on http://localhost:3000');
}
bootstrap().catch((err) => {
  console.error('NestJS application failed to start', err);
  process.exit(1);
});
