const schedule = require("node-schedule");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

schedule.scheduleJob("* * * * *", function () {
  console.log("The answer to life, the universe, and everything!");
});
