import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { LoggerModule } from 'nestjs-pino';
import { trace, context } from '@opentelemetry/api';

@Module({
  imports: [
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
                labels: { application: 'email-service' },
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
  controllers: [EmailController],
})
export class EmailModule { }
