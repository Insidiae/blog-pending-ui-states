import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
	await Promise.all(
		getMessages().map((message) => {
			return db.message.create({ data: message });
		}),
	);
	console.log("Database seeded successfully!");
}

seed();

function getMessages() {
	return [
		{
			author: "Anonymous",
			content: "Is this real life, or is it just fantasy?",
		},
		{
			author: "Anonymous",
			content: "Caught in a landslide, no escape from reality",
		},
		{
			author: "Anonymous",
			content: "Open your eyes, look up to the skies and see...",
		},
	];
}
