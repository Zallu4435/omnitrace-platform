import { Controller, Post, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

export interface PaymentResponse {
  status: string;
  message: string;
}

@Controller()
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectMetric('orders_created_total') public counter: Counter<string>,
  ) { }

  @Post('create-order')
  async createOrder() {
    this.counter.inc(); // Increment the metric every time this endpoint is hit!
    this.logger.log('Order received, calling Payment Service...');

    // Make the synchronous HTTP call to Service B
    const { data } = await firstValueFrom(
      this.httpService.post<PaymentResponse>(
        'http://localhost:3001/process-payment',
      ),
    );

    return {
      message: 'Order Placed!',
      paymentDetails: data,
    };
  }
}
