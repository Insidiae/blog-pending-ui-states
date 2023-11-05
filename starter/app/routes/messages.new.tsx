import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { db } from "~/utils/db.server";

export async function action({ request }: ActionFunctionArgs) {
	const form = await request.formData();
	const author = form.get("author") || "Anonymous";
	const content = form.get("content");

	//? we do this type check to be extra sure and to make TypeScript happy
	//? in a real app, you'll want to validate these inputs!
	if (typeof author !== "string" || typeof content !== "string") {
		throw new Error("Form not submitted correctly.");
	}

	await db.message.create({
		data: {
			author,
			content,
		},
	});

	return redirect("/");
}

export default function NewMessage() {
	return (
		<div className="mx-auto flex max-w-lg flex-col gap-8 p-8">
			<Link to="/">
				<h1 className="text-3xl font-bold">&larr; New Message</h1>
			</Link>
			<form method="post" className="flex flex-col gap-2">
				<label htmlFor="author" className="text-lg font-medium">
					Screen Name
				</label>
				<input
					type="text"
					name="author"
					id="author"
					placeholder="Anonymous"
					className="mb-2 rounded-md border border-black p-2"
				/>
				<label htmlFor="content" className="text-lg font-medium">
					Message
				</label>
				<textarea
					name="content"
					id="content"
					className="mb-2 rounded-md border border-black p-2"
					placeholder="Your Message"
					required
				></textarea>
				<button className="rounded-full bg-blue-600 py-2 text-center text-white">
					Submit
				</button>
			</form>
		</div>
	);
}
