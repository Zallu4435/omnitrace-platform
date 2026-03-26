import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { context, propagation, trace } from '@opentelemetry/api';

export interface PaymentSucceededEvent {
  orderId: string;
  amount: number;
  status: string;
}

@Controller()
export class EmailServiceController {
  private readonly logger = new Logger(EmailServiceController.name);
  // Grab the global OpenTelemetry tracer
  private tracer = trace.getTracer('email-service-tracer');

  @EventPattern('payment.succeeded')
  async handlePaymentSuccess(
    @Payload() data: PaymentSucceededEvent,
    @Ctx() rmqContext: RmqContext,
  ) {
    this.logger.log(
      `Received event for Order: ${data.orderId}. Preparing email...`,
    );

    // ==========================================
    // INTERVIEW FLEX: Manual Context Extraction
    // ==========================================

    // 1. Get the raw RabbitMQ message to access the headers we sent from Service B
    const message = rmqContext.getMessage() as {
      properties: { headers: Record<string, string> };
    };
    const headers = message.properties.headers || {};

    // 2. Extract the parent trace context from those headers
    const parentContext = propagation.extract(context.active(), headers);

    // 3. Start a new span, explicitly linking it to that parent context
    return context.with(parentContext, async () => {
      return this.tracer.startActiveSpan(
        'send_email_notification',
        async (span) => {
          // Add some searchable attributes to the span for debugging
          span.setAttribute('orderId', data.orderId);
          span.setAttribute('email.type', 'confirmation');

          // Simulate a slow external email API (e.g., SendGrid) taking 800ms
          await new Promise((resolve) => setTimeout(resolve, 800));

          this.logger.log(`Email successfully sent for Order: ${data.orderId}`);

          // 4. CRITICAL: You must end the span so Jaeger records it!
          span.end();
        },
      );
    });
  }
}
