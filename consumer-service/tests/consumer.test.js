const mysql = require("mysql2/promise");

describe("Consumer Database Test", () => {

 test("Event should be stored in database", async () => {

  const db = await mysql.createConnection({
   host: "mysql",
   user: "root",
   password: "root_password",
   database: "user_activity_db"
  });

  const [rows] = await db.execute(
   "SELECT * FROM user_activities ORDER BY id DESC LIMIT 1"
  );

  expect(rows.length).toBeGreaterThan(0);

  await db.end();

 });

});