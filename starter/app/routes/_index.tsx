import { json, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const meta: MetaFunction = () => {
	return [
		{ title: "Freedom Wall" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

export async function loader() {
	return json({
		messages: await db.message.findMany({
			where: {
				parent_id: null,
			},
			orderBy: { createdAt: "desc" },
			select: { id: true, author: true, content: true },
		}),
	});
}

export default function Index() {
	const data = useLoaderData<typeof loader>();

	return (
		<div className="mx-auto flex max-w-lg flex-col gap-8 p-8">
			<h1 className="text-3xl font-bold">Freedom Wall</h1>
			<Link
				to="messages/new"
				className="rounded-full bg-blue-600 py-2 text-center text-white"
			>
				New Message
			</Link>
			<div className="flex flex-col gap-4">
				{data.messages.map((message) => (
					<Link key={message.id} to={`/messages/${message.id}`}>
						<article className="flex flex-col rounded-md border border-black p-4">
							<p>
								<span className="font-bold">{message.author}</span> posted:
							</p>
							<p>{message.content}</p>
						</article>
					</Link>
				))}
			</div>
		</div>
	);
}
