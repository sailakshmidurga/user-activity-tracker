require("dotenv").config();

const amqp = require("amqplib");
const mysql = require("mysql2/promise");
const express = require("express");

const QUEUE = "user_activity_events";

let channel;
let db;

// health server
const app = express();

app.get("/health", (req, res) => {
  res.send("Consumer healthy");
});

const PORT = process.env.CONSUMER_PORT || 8001;

app.listen(PORT, () => {
  console.log(`Consumer health server running on port ${PORT}`);
});

// connect to RabbitMQ with retry
async function connectRabbitMQ() {

  while (true) {

    try {

      const connection = await amqp.connect(
        `amqp://${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`
      );

      channel = await connection.createChannel();

      await channel.assertQueue(QUEUE, { durable: true });

      console.log("Connected to RabbitMQ");

      break;

    } catch (error) {

      console.log("RabbitMQ not ready, retrying in 5 seconds...");
      await new Promise(res => setTimeout(res, 5000));

    }

  }

}

// connect to MySQL
async function connectDatabase() {

  while (true) {

    try {

      db = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB
      });

      console.log("Connected to MySQL");

      break;

    } catch (error) {

      console.log("MySQL not ready, retrying in 5 seconds...");
      await new Promise(res => setTimeout(res, 5000));

    }

  }

}

// start consumer
async function startConsumer() {

  await connectRabbitMQ();

  await connectDatabase();

  console.log("Consumer waiting for messages...");

 channel.consume(QUEUE, async (msg) => {

  try {

    const event = JSON.parse(msg.content.toString());

    console.log("Received event:", event);

    // Convert ISO timestamp to MySQL format
    const mysqlTimestamp = new Date(event.timestamp)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await db.execute(
      `INSERT INTO user_activities (user_id,event_type,timestamp,metadata)
       VALUES (?,?,?,?)`,
      [
        event.user_id,
        event.event_type,
        mysqlTimestamp,
        JSON.stringify(event.metadata)
      ]
    );

    console.log("Event stored in database");

    channel.ack(msg);

  } catch (error) {

    console.error("Error processing message:", error);

    channel.nack(msg, false, false);

  }

});
}

startConsumer();