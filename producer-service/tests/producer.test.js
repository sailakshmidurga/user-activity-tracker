const axios = require("axios");

describe("Producer API Test", () => {

test("POST /api/v1/events/track should return 202", async () => {

 const response = await axios.post(
 "http://localhost:8000/api/v1/events/track",
 {
  user_id: 1,
  event_type: "login",
  timestamp: "2025-03-07T10:00:00Z",
  metadata: { device: "mobile" }
 });

 expect(response.status).toBe(202);

});

});