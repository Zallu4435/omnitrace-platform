import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { HttpModule } from '@nestjs/axios';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-pino';
import { trace, context } from '@opentelemetry/api';

@Module({
  imports: [
    HttpModule,
    PrometheusModule.register(), // This creates the /metrics endpoint
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, singleLine: true },
        },
        // INTERVIEW FLEX: Auto-inject Trace ID from OpenTelemetry into every log
        mixin() {
          const span = trace.getSpan(context.active());
          return span ? { traceId: span.spanContext().traceId } : {};
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    makeCounterProvider({
      name: 'orders_created_total',
      help: 'Total number of orders created',
    }),
  ],
})
export class AppModule {}
