import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  await Promise.all(
    getMessages().map((message) => {
      return db.message.create({ data: message });
    })
  );
  console.log("Database seeded successfully!");
}

seed();

function getMessages() {
  return [
    {
      author: "Anonymous",
      content: "Test 1",
    },
    {
      author: "Anonymous",
      content: "Test 2",
    },
    {
      author: "Anonymous",
      content: "Test 3",
    },
  ];
}
