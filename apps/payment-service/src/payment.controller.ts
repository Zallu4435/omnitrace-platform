import { Controller, Post, Inject, Logger } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { context, propagation } from '@opentelemetry/api';
import { lastValueFrom } from 'rxjs';

@Controller()
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  // Inject the RabbitMQ client we just registered
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) { }

  @Post('process-payment')
  async processPayment() {
    this.logger.log('Processing payment...');
    // Simulate payment delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // ==========================================
    // INTERVIEW FLEX: Manual Context Propagation
    // ==========================================

    // 1. Create an empty object to hold our trace headers
    const traceHeaders = {};

    // 2. Tell OpenTelemetry to inject the current active trace context into our object
    propagation.inject(context.active(), traceHeaders);

    // 3. Build the RabbitMQ message, attaching the traceHeaders
    const record = new RmqRecordBuilder({
      orderId: 'ORDER-123',
      amount: 99.99,
      status: 'success',
    })
      .setOptions({ headers: traceHeaders })
      .build();

    // 4. Fire and await! Publish the event to RabbitMQ
    this.logger.log('Publishing payment.succeeded event to RabbitMQ...');
    await lastValueFrom(this.client.emit('payment.succeeded', record));

    return { status: 'success', message: 'Payment processed successfully' };
  }
}
