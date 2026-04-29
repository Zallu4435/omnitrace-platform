import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
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
                labels: { application: 'order-gateway' },
              },
            },
            // ── ELK: Write JSON logs to file for Filebeat to pick up ──
            // Filebeat tails this file → Logstash parses it → Elasticsearch stores it → Kibana shows it
            {
              target: 'pino/file',
              options: {
                destination: './logs/order-gateway.log',  // Filebeat watches this
                mkdir: true,                              // Create ./logs/ dir if it doesn't exist
                sync: false,                              // Async writes (non-blocking)
              },
            },
          ],
        },
        // INTERVIEW FLEX: Auto-inject Trace ID from OpenTelemetry into every log
        mixin() {
          const span = trace.getSpan(context.active());
          return span ? { traceId: span.spanContext().traceId } : {};
        },
      },
    }),
  ],
  controllers: [OrderController],
  providers: [
    makeCounterProvider({
      name: 'orders_created_total',
      help: 'Total number of orders created',
    }),
  ],
})
export class OrderModule { }
