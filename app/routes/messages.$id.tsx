import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
	return json({
		message: await db.message.findUnique({
			where: {
				id: params.id,
			},
			include: {
				replies: {
					select: { id: true, author: true, content: true },
					orderBy: { createdAt: "desc" },
				},
			},
		}),
	});
}

export async function action({ request, params }: ActionFunctionArgs) {
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
			parent_id: params.id,
		},
	});

	return null;
}

export default function Index() {
	const data = useLoaderData<typeof loader>();

	return (
		<div className="flex flex-col gap-8 p-8">
			<Link to="/">
				<h1 className="text-3xl font-bold">&larr; Message</h1>
			</Link>

			<article
				key={data.message?.id}
				className="flex flex-col rounded-[1.375rem] border border-black p-4"
			>
				<p>
					<span className="font-bold">{data.message?.author}</span> posted:
				</p>
				<p className="mb-4">{data.message?.content}</p>

				<section className="flex flex-col gap-4">
					<h2 className="text-xl font-bold">Replies</h2>

					<form method="post" className="flex flex-col gap-2">
						<label htmlFor="author" className="text-lg font-medium">
							Screen Name
						</label>
						<input
							type="text"
							name="author"
							id="author"
							placeholder="Anonymous"
							className="mb-2 border border-black p-2"
						/>
						<label htmlFor="content" className="text-lg font-medium">
							Message
						</label>
						<textarea
							name="content"
							id="content"
							className="mb-2 border border-black p-2"
							placeholder="Your Message"
							required
						></textarea>
						<button className="rounded-full bg-blue-600 py-2 text-center text-white">
							Post Reply
						</button>
					</form>

					{data.message?.replies.length !== 0 ? (
						<div className="flex flex-col gap-4">
							{data.message?.replies.map((reply) => (
								<article
									key={reply.id}
									className="flex flex-col rounded-md border border-black p-4"
								>
									<p>
										<span className="font-bold">{reply.author}</span> replied:
									</p>
									<p>{reply.content}</p>
								</article>
							))}
						</div>
					) : null}
				</section>
			</article>
		</div>
	);
}
