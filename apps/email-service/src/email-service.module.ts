import { Module } from '@nestjs/common';
import { EmailServiceController } from './email-service.controller';
import { LoggerModule } from 'nestjs-pino';
import { trace, context } from '@opentelemetry/api';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, singleLine: true },
        },
        mixin() {
          const span = trace.getSpan(context.active());
          return span ? { traceId: span.spanContext().traceId } : {};
        },
      },
    }),
  ],
  controllers: [EmailServiceController],
})
export class EmailServiceModule {}
