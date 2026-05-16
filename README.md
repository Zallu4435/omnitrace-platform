<h1 align="center">🚀 Event-Driven Microservices with End-to-End Observability</h1>

<h3 align="center">
Distributed Systems • OpenTelemetry • ELK • LGTM • NestJS
</h3>

<p align="center">
A production-focused microservices architecture built with NestJS to demonstrate distributed tracing, centralized logging, metrics collection, asynchronous messaging, and modern observability patterns.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/OpenTelemetry-000000?style=for-the-badge&logo=opentelemetry&logoColor=white" alt="OpenTelemetry" />
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" alt="RabbitMQ" />
  <img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana" />
  <img src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Prometheus" />
  <img src="https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white" alt="Elasticsearch" />
</p>

---

# 📌 Overview

This project demonstrates a production-style event-driven microservices architecture with full observability across distributed services.

The system models a simplified ecommerce checkout workflow where services communicate through synchronous HTTP requests and asynchronous RabbitMQ events while preserving distributed tracing context across network boundaries.

The primary focus of the project is observability engineering, including:

- Distributed tracing
- Metrics collection
- Structured logging
- Trace-to-log correlation
- Alerting pipelines
- Cross-service debugging
- OpenTelemetry instrumentation

---

# 🏗️ Architecture

## Services

| Service | Port | Responsibility |
|---|---|---|
| Order Gateway | `3000` | Receives HTTP order requests |
| Payment Service | `3001` | Simulates payment processing |
| Email Service | AMQP Consumer | Handles asynchronous email workflows |

---

## Event Flow

```text
Client Request
      │
      ▼
Order Gateway
      │ HTTP
      ▼
Payment Service
      │ RabbitMQ Event
      ▼
Email Service
```

---

# 🔍 Observability Stack

This project demonstrates three modern observability ecosystems.

| Stack | Components |
|---|---|
| Classic Stack | Prometheus + Grafana + Loki + Jaeger |
| ELK Stack | Elasticsearch + Logstash + Kibana + Filebeat |
| LGTM Stack | Loki + Grafana + Tempo + Mimir |

---

# 🚀 Features

## 🔗 Distributed Tracing

- OpenTelemetry instrumentation
- Jaeger trace visualization
- Tempo trace storage
- Manual trace context propagation
- Cross-service trace continuity
- Trace-to-log correlation

---

## 📊 Metrics

- Prometheus metrics collection
- Custom business metrics
- Request latency monitoring
- Grafana dashboards
- Alertmanager integration
- Metrics aggregation via Mimir

---

## 📝 Logging

- Structured JSON logging with Pino
- Loki log aggregation
- ELK stack integration
- Trace ID injection into logs
- Multi-destination log shipping
- Cross-service log search

---

## ⚡ Event-Driven Communication

- RabbitMQ event publishing
- Async background processing
- Decoupled service communication
- Reliable message handling
- Distributed workflow tracing

---

# 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Framework | NestJS (TypeScript) |
| Messaging | RabbitMQ |
| Tracing | OpenTelemetry, Jaeger, Tempo |
| Metrics | Prometheus, Grafana, Mimir |
| Logging | Loki, ELK Stack, Pino |
| Infrastructure | Docker, Docker Compose |

---

# ⚡ Engineering Highlights

- Manual OpenTelemetry context propagation
- Distributed trace continuity across RabbitMQ
- Trace-enriched structured logging
- Multi-stack observability architecture
- Async event-driven service communication
- Dual log shipping (Loki + ELK)
- Centralized monitoring & alerting

---

# 🔄 Trace Context Propagation

The project demonstrates manual trace propagation across asynchronous message boundaries.

## Flow

```text
HTTP Request
     │
     ▼
Order Gateway
     │
 Inject Trace Context
     │
 RabbitMQ Event
     │
 Extract Trace Context
     ▼
Email Service
```

This preserves distributed trace continuity even when transitioning from synchronous HTTP communication to asynchronous messaging.

---

# 🏁 Quick Start

## Prerequisites

- Node.js v18+
- Docker & Docker Compose

---

# 1️⃣ Start Infrastructure

```bash
docker-compose -f observability/docker-compose.yml up -d
```

This starts:

- RabbitMQ
- Grafana
- Prometheus
- Loki
- Jaeger

---

# 2️⃣ Install Dependencies

```bash
npm install
```

---

# 3️⃣ Start Microservices

## Terminal 1

```bash
npm run start order-gateway
```

## Terminal 2

```bash
npm run start payment-service
```

## Terminal 3

```bash
npm run start email-service
```

---

# 4️⃣ Trigger Requests

Generate observability data using:

```bash
curl -X POST http://localhost:3000/create-order
```

---

# 📊 Observability Dashboards

| Tool | URL | Purpose |
|---|---|---|
| Grafana | `http://localhost:4000` | Metrics & logs |
| Grafana (LGTM) | `http://localhost:5000` | Unified LGTM dashboards |
| Kibana | `http://localhost:5601` | ELK log exploration |
| Jaeger | `http://localhost:16686` | Distributed trace visualization |
| Prometheus | `http://localhost:9090` | Raw metrics queries |
| Alertmanager | `http://localhost:9093` | Alert monitoring |
| RabbitMQ | `http://localhost:15672` | Queue monitoring |
| Elasticsearch | `http://localhost:9200` | Indexed log storage |
| Loki | `http://localhost:3100` | Log query API |
| Tempo | `http://localhost:3200` | Trace storage |
| Mimir | `http://localhost:9009` | Metrics storage |

---

# 🔒 Logging Pipeline

Each service ships logs to both Loki and the ELK stack simultaneously.

```text
NestJS Services
   ├── Pino Logger
   │
   ├── Loki Pipeline
   │      └── Grafana Explore
   │
   └── File Logs
           │
        Filebeat
           │
        Logstash
           │
     Elasticsearch
           │
         Kibana
```

---

# 📈 Metrics & Alerts

## Example Metrics

- `orders_created_total`
- `http_request_duration_seconds`
- `payment_processed_total`

---

## Example Alerts

- High error rate
- Service downtime
- Elevated request latency
- Queue processing failures

---

# 🧠 LGTM Stack

The LGTM stack enables deep observability correlation between:

- Logs
- Metrics
- Traces

## Correlation Workflow

1. Open Grafana Explore
2. Search logs in Loki
3. Select a log line
4. Jump directly to Tempo trace
5. Navigate between spans and logs

This enables end-to-end debugging without manually copying trace IDs.

---

# 🔴 ELK Stack

The ELK stack provides centralized indexing and advanced search capabilities for structured logs.

## Kibana Features

- Full-text log search
- Trace ID filtering
- Service-specific debugging
- Error monitoring
- Time-series log analysis

---

# 📂 Project Structure

```bash
microservices-observability/
│
├── apps/
│   ├── order-gateway/
│   ├── payment-service/
│   └── email-service/
│
├── observability/
│   ├── prometheus/
│   ├── grafana/
│   ├── loki/
│   └── jaeger/
│
├── elk/
│   ├── elasticsearch/
│   ├── logstash/
│   └── filebeat/
│
├── lgtm/
│   ├── tempo/
│   ├── mimir/
│   └── grafana/
│
└── docker-compose.yml
```

---

# ⚠️ Important Notes

## Port Conflicts

The Classic and LGTM stacks share several ports, including:

- `3100` (Loki)
- `4318` (OTLP)

Run only one observability stack at a time.

---

# 🧪 Future Improvements

- Kubernetes deployment support
- Distributed rate limiting
- Service mesh integration
- Kafka event streaming
- Auto-scaling observability stack
- CI/CD monitoring pipelines

---

# 📝 License

Released under the MIT License.