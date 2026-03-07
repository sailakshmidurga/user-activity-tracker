require("dotenv").config();

const express = require("express");
const amqp = require("amqplib");
const Joi = require("joi");

const app = express();
app.use(express.json());

const QUEUE = "user_activity_events";

let channel;

// RabbitMQ connection with retry
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

// validation schema
const schema = Joi.object({

  user_id: Joi.number().required(),
  event_type: Joi.string().required(),
  timestamp: Joi.string().required(),
  metadata: Joi.object()

});

// API endpoint
app.post("/api/v1/events/track", async (req, res) => {

  try {

    const { error } = schema.validate(req.body);

    if (error) {

      return res.status(400).json({
        message: "Invalid request payload",
        details: error.details
      });

    }

    const event = JSON.stringify(req.body);

    channel.sendToQueue(
      QUEUE,
      Buffer.from(event),
      { persistent: true }
    );

    console.log("Event published:", event);

    return res.status(202).json({
      message: "Event accepted"
    });

  } catch (err) {

    console.error("Error publishing event:", err);

    return res.status(500).json({
      message: "Internal server error"
    });

  }

});

// health endpoint
app.get("/health", (req, res) => {
  res.send("Producer healthy");
});

// start server
const PORT = process.env.PRODUCER_PORT || 8000;

app.listen(PORT, async () => {

  await connectRabbitMQ();

  console.log(`Producer running on port ${PORT}`);

});