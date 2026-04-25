# 🚀 Event-Driven Microservices with End-to-End Observability

## Objective
A production-ready microservices architecture built with NestJS to demonstrate advanced distributed system patterns. This project serves as a technical showcase of **Event-Driven Architecture (EDA)** and full-stack Observability using OpenTelemetry, Prometheus, Alertmanager, Grafana, and RabbitMQ.

## 🏗 Architecture Overview
The system models a simplified e-commerce checkout flow, highlighting the transition from synchronous HTTP calls to asynchronous background processing without losing context.

1. **Order Gateway (Service A - Port 3000):** Exposes an HTTP endpoint to receive orders. Makes a synchronous HTTP call to the Payment Service.
2. **Payment Service (Service B - Port 3001):** Simulates payment processing. Emits a `payment.succeeded` event to RabbitMQ.
3. **Email Service (Service C - AMQP):** Acts as a RabbitMQ consumer. Listens for the payment event and simulates sending an email in the background.

## 🔍 The Three Pillars of Observability
This project implements a complete observability stack to monitor, trace, and debug requests across network boundaries.

* **1. Traces (OpenTelemetry & Jaeger):** Captures end-to-end request latency. Features **manual trace context propagation** (inject/extract) to maintain trace continuity when moving from HTTP to the RabbitMQ message broker.
* **2. Metrics (Prometheus & Grafana):** Exposes a `/metrics` endpoint to track custom business metrics (e.g., `orders_created_total`), visualized in real-time via Grafana dashboards.
* **3. Logs (Pino JSON Logger + Grafana Loki):** Contextual structured logging. OpenTelemetry Trace IDs are automatically injected into JSON log payloads. These logs are streamed natively from NestJS to a centralized Grafana Loki database, allowing exact cross-service debugging by Trace ID.
* **4. Alerts (Prometheus & Alertmanager):** Proactive system monitoring with configured rules (e.g. `InstanceDown`, `HighErrorRate`) that trigger notifications to external channels like Slack or webhooks.

## 🛠 Technology Stack
* **Framework:** NestJS (TypeScript)
* **Message Broker:** RabbitMQ
* **Tracing:** OpenTelemetry (OTLP Exporter) + Jaeger UI
* **Metrics:** Prometheus + Grafana (`@willsoto/nestjs-prometheus`)
* **Logging:** Pino (`nestjs-pino`) + Grafana Loki (`pino-loki`)
* **Alerting:** Alertmanager
* **Infrastructure:** Docker & Docker Compose

---

## 🚦 Quick Start Guide

### 1. Prerequisites
* Node.js (v18+)
* Docker & Docker Compose

### 2. Start the Infrastructure
Spin up RabbitMQ, Jaeger, Prometheus, Grafana, and Loki in the background:
```bash
docker-compose up -d
```

### 3. Install Dependencies
```bash
npm install
\`\`\`

### 4. Start the Microservices
Open three separate terminals to run each service concurrently:
\`\`\`bash
# Terminal 1
npm run start order-gateway

# Terminal 2
npm run start payment-service

# Terminal 3
npm run start email-service
\`\`\`

### 5. Trigger the System
Send a few POST requests to simulate user traffic and generate observability data:
\`\`\`bash
curl -X POST http://localhost:3000/create-order
\`\`\`

---

## 📊 Observability Dashboards
Once you have triggered a few orders, explore the generated data across the infrastructure:

| Tool | URL | Credentials | Purpose |
| :--- | :--- | :--- | :--- |
| **Grafana** | [http://localhost:4000](http://localhost:4000) | `admin` / `admin` | View real-time metrics and order counters. |
| **Jaeger** | [http://localhost:16686](http://localhost:16686) | (None) | Visualize the waterfall timeline of distributed traces. |
| **RabbitMQ** | [http://localhost:15672](http://localhost:15672) | `guest` / `guest` | Monitor message queues and exchanges. |
| **Prometheus**| [http://localhost:9090](http://localhost:9090) | (None) | Query raw metric data and view configured alerting rules. |
| **Alertmanager**| [http://localhost:9093](http://localhost:9093) | (None) | View active alerts, silences, and routing configurations. |
| **Loki**| Accessed via Grafana Explore | (None) | Centralized logging. Filter all cross-service logs using `{application=~".+"} |= "YOUR-TRACE-ID"`. |

## 🧠 Key Technical Highlights for Review
* **Manual Context Propagation (`tracer.ts`):** Check the `PaymentServiceController` to see how the active OpenTelemetry Trace ID is injected into the RabbitMQ message headers, and the `EmailServiceController` to see how it is extracted to resume the trace.
* **Trace-Injected Logging:** Check the terminal output of any service. Notice that every Pino JSON log contains a `trace_id` property, natively linking the log to the Jaeger trace.