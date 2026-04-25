import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoggerModule } from 'nestjs-pino';
import { trace, context } from '@opentelemetry/api';

@Module({
  imports: [
    // Register the RabbitMQ client
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // Our Docker RabbitMQ
          queue: 'demo_queue',
          queueOptions: {
            durable: false, // Keep it simple for the demo
          },
        },
      },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          targets: [
            {
              target: 'pino-pretty',
              options: { colorize: true, singleLine: true },
            },
            {
              target: 'pino-loki',
              options: {
                batching: true,
                interval: 5,
                host: 'http://localhost:3100', // Loki URL
                labels: { application: 'payment-service' },
              },
            },
          ],
        },
        mixin() {
          const span = trace.getSpan(context.active());
          return span ? { traceId: span.spanContext().traceId } : {};
        },
      },
    }),
  ],
  controllers: [PaymentController],
})
export class PaymentModule { }
