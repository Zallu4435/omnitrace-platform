# 🚀 Event-Driven Microservices with End-to-End Observability

## Objective
A production-ready microservices architecture built with NestJS to demonstrate advanced distributed system patterns. This project serves as a technical showcase of multiple industry-standard Observability patterns:
1. **The Classic Stack:** Prometheus, Grafana, Loki, Jaeger.
2. **The ELK Stack:** Elasticsearch, Logstash, Kibana, Filebeat.
3. **The LGTM Stack:** Loki, Grafana, Tempo, Mimir.

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
* **Tracing (Choice):** Jaeger UI OR **Grafana Tempo** (LGTM)
* **Metrics (Choice):** Prometheus OR **Grafana Mimir** (LGTM)
* **Logging (Choice):** Grafana Loki OR **ELK Stack** (Elasticsearch/Kibana)
* **Collector:** OpenTelemetry SDK (Node.js)
* **Infrastructure:** Docker & Docker Compose

---

## 🚦 Quick Start Guide

### 1. Prerequisites
* Node.js (v18+)
* Docker & Docker Compose

### 2. Start the Infrastructure
Spin up RabbitMQ, Jaeger, Prometheus, Grafana, and Loki in the background:
```bash
docker-compose -f observability/docker-compose.yml up -d
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
| **Grafana** | [http://localhost:4000](http://localhost:4000) | `admin` / `admin` | View metrics/logs (Classic Stack). |
| **Grafana (LGTM)** | [http://localhost:5000](http://localhost:5000) | `admin` / `admin` | **LGTM Stack UI** — features Trace-to-Log correlation. |
| **Kibana** | [http://localhost:5601](http://localhost:5601) | (None) | **ELK Stack UI** — advanced log search and discovery. |
| **Jaeger** | [http://localhost:16686](http://localhost:16686) | (None) | Waterfall timeline for distributed traces. |
| **RabbitMQ** | [http://localhost:15672](http://localhost:15672) | `guest` / `guest` | Monitor message queues and exchanges. |
| **Prometheus**| [http://localhost:9090](http://localhost:9090) | (None) | Query raw metric data and alerting rules. |
| **Alertmanager**| [http://localhost:9093](http://localhost:9093) | (None) | View active alerts and notifications. |

## 🧠 Key Technical Highlights for Review
* **Manual Context Propagation (`tracer.ts`):** Check the `PaymentServiceController` to see how the active OpenTelemetry Trace ID is injected into the RabbitMQ message headers, and the `EmailServiceController` to see how it is extracted to resume the trace.
* **Trace-Injected Logging:** Check the terminal output of any service. Notice that every Pino JSON log contains a `trace_id` property, natively linking the log to the Jaeger trace.
* **Dual Log Shipping:** Each service ships logs to BOTH Loki (via `pino-loki`) AND a log file (via `pino/file`). Filebeat tails the files and ships to the ELK stack — both pipelines coexist without conflict.

---

## 🔴 ELK Stack (Elasticsearch + Logstash + Kibana + Filebeat)

### Quick Start

```bash
# 1. Start the ELK stack (separate compose file)
docker-compose -f elk/docker-compose.yml up -d

# 2. Start your NestJS services (if not already running)
npm run start order-gateway
npm run start payment-service
npm run start email-service

# 3. Generate some logs
curl -X POST http://localhost:3000/create-order

# 4. Open Kibana at http://localhost:5601
```

### Setting up Kibana Index Pattern (first time only)
1. Open **http://localhost:5601**
2. Go to **Stack Management → Index Patterns → Create index pattern**
3. Pattern: `microservices-logs-*` → click **Next step**
4. Time field: `@timestamp` → click **Create index pattern**
5. Go to **Discover** and filter by `level_name: "ERROR"` or search for any `trace_id`

### Useful Kibana Queries (KQL)
```
# All ERROR logs
level_name : "ERROR"

# Logs from a specific service
service : "order-gateway"

# Find a specific trace across ALL services
trace_id : "YOUR-TRACE-ID-HERE"

# Error logs from payment-service in the last 15 minutes
service : "payment-service" AND level_name : "ERROR"
```

### Useful Elasticsearch REST API Queries
```bash
# Check cluster health
curl http://localhost:9200/_cluster/health?pretty

# List all indices (one per day)
curl http://localhost:9200/_cat/indices?v

# Search all logs from order-gateway
curl http://localhost:9200/microservices-logs-*/_search?q=service:order-gateway&pretty

# Count total documents indexed
curl http://localhost:9200/microservices-logs-*/_count?pretty
```

### Log Flow Architecture
```
NestJS Services
   ├── pino-pretty   → coloured terminal output        (unchanged)
   ├── pino-loki     → Grafana Loki → Grafana Explore  (unchanged)
   └── pino/file     → ./logs/*.log
                              │
                          [Filebeat]  tails files, ships new lines
                              │
                          [Logstash]  parses JSON, enriches, filters noise
                              │
                      [Elasticsearch]  stores as indexed JSON documents
                              │
                          [Kibana]  search, visualize, dashboard
```

---

## 🏛 The LGTM Stack (Loki, Grafana, Tempo, Mimir)

The LGTM stack represents the modern state-of-the-art for OpenTelemetry-native observability. Its power comes from **Correlation** — jumping between metrics, logs, and traces without losing context.

### Quick Start

```bash
# 1. Start the LGTM stack (Loki + Grafana + Tempo + Prometheus)
docker-compose -f lgtm/docker-compose.yml up -d

# 2. Open Grafana at http://localhost:5000 (Notice port 5000!)
```

### The "Virtuous Cycle" (How to Test)
1. Trigger an order: `curl -X POST http://localhost:3000/create-order`
2. Open **Grafana (Port 5000)** -> **Explore** -> Select **Loki**.
3. Search for logs: `{application="order-gateway"}`.
4. Expand a log line. You will see a **Tempo** button next to the `traceId`.
5. **Click it!** A split-screen window opens showing the exact waterfall trace in **Tempo** for that specific log line.
6. In the Tempo trace, click on a span. You can now jump back to **Logs** for just that span or view **Node Graph** to see service dependencies.

### Why this is better than Jaeger?
While Jaeger is a great standalone tool, **Tempo** is integrated directly into the Grafana ecosystem. By using "Derived Fields" in Loki, we link the `traceId` in your JSON logs directly to the trace in Tempo, eliminating the need to manualy copy-paste IDs.