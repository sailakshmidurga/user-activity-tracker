# Event-Driven User Activity Tracking Service (RabbitMQ)

## Project Overview

This project implements an **event-driven backend system** for tracking user activities using **RabbitMQ as a message broker**.

Instead of directly saving user events to the database, the API publishes events to a message queue.
A separate consumer service processes the events asynchronously and stores them in a MySQL database.

This design demonstrates **event-driven architecture, asynchronous processing, and service decoupling**, which are important concepts for scalable backend systems.

---

# Architecture

```
Client
   ↓
Producer API (Node.js + Express)
   ↓
RabbitMQ Queue (user_activity_events)
   ↓
Consumer Service (Node.js Worker)
   ↓
MySQL Database
```

### Components

| Component        | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| Producer Service | REST API that receives activity events and publishes them to RabbitMQ |
| RabbitMQ         | Message broker used to decouple producer and consumer services        |
| Consumer Service | Listens to the queue and processes incoming events                    |
| MySQL            | Stores processed user activity data                                   |

---

# Technology Stack

* Node.js
* Express.js
* RabbitMQ
* MySQL
* Docker
* Docker Compose
* Jest (for automated tests)

---

# Project Structure

```
user-activity-tracker
│
├── producer-service
│   ├── src
│   │   └── server.js
│   ├── tests
│   │   └── producer.test.js
│   └── Dockerfile
│
├── consumer-service
│   ├── src
│   │   └── server.js
│   ├── tests
│   │   └── consumer.test.js
│   └── Dockerfile
│
├── db
│   └── init.sql
│
├── docker-compose.yml
├── .env.example
├── README.md
└── .gitignore
```

---

# API Endpoint

### Track User Activity

**POST**

```
/api/v1/events/track
```

### Request Body

```json
{
  "user_id": 1,
  "event_type": "login",
  "timestamp": "2025-03-07T10:00:00Z",
  "metadata": {
    "device": "mobile"
  }
}
```

### Response

```
202 Accepted
```

The API validates the input and publishes the event to RabbitMQ.

---

# Database Schema

```sql
CREATE TABLE user_activities (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT NOT NULL,
 event_type VARCHAR(50) NOT NULL,
 timestamp DATETIME NOT NULL,
 metadata JSON
);
```

---

# Running the Application

Start all services using Docker:

```
docker-compose up --build
```

This will start:

* RabbitMQ
* MySQL
* Producer API
* Consumer Service

---

# RabbitMQ Dashboard

Open in browser:

```
http://localhost:15672
```

Credentials:

```
username: guest
password: guest
```

You can monitor queues and messages from this interface.

---

# Running Tests

### Producer Tests

```
docker-compose exec producer-service npm test
```

### Consumer Tests

```
docker-compose exec consumer-service npm test
```

These tests verify:

* API endpoint functionality
* Event processing
* Database persistence

---

# Design Decisions

### Event-Driven Architecture

The producer does not directly write to the database.
Instead, it publishes events to RabbitMQ which are processed asynchronously by the consumer.

### Asynchronous Processing

The API responds immediately after publishing the event.
The consumer processes events independently.

### Decoupled Services

Producer and consumer are independent services connected via the message queue.

---

# Error Handling

The system includes:

* Input validation for API requests
* RabbitMQ connection retry logic
* Database connection retry logic
* Message acknowledgement to prevent message loss

---

# Possible Improvements

* Dead-letter queues
* Retry mechanisms
* Authentication and authorization
* API documentation using Swagger
* Monitoring and logging

---

# Author

Sai Lakshmi Durga Koneti
