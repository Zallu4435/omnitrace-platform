import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export const setupTracing = (serviceName: string) => {
  const exporter = new OTLPTraceExporter({
    // Port 4318 is the OTLP HTTP receiver — shared by both:
    //   Jaeger (observability/docker-compose.yml)  → visualize at http://localhost:16686
    //   Tempo  (lgtm/docker-compose.yml)           → visualize via Grafana at http://localhost:5000
    // Run ONE stack at a time. No code changes needed when switching stacks.
    url: 'http://localhost:4318/v1/traces',
  });

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter: exporter,
    // Auto-instrumentations will automatically wrap HTTP and NestJS calls in spans
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk.shutdown().then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
};