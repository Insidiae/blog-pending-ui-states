import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
	defer,
	json,
} from "@remix-run/node";
import { useLoaderData, Link, Await, useFetcher } from "@remix-run/react";
import { Suspense, useEffect, useRef } from "react";
import Spinner from "~/components/Spinner";
import { db } from "~/utils/db.server";

// export async function loader({ params }: LoaderFunctionArgs) {
// 	return json({
// 		message: await db.message.findUnique({
// 			where: {
// 				id: params.id,
// 			},
// 			include: {
// 				replies: {
// 					select: { id: true, author: true, content: true },
// 					orderBy: { createdAt: "desc" },
// 				},
// 			},
// 		}),
// 	});
// }

export const meta: MetaFunction = () => {
	return [{ title: "Message | Freedom Wall" }];
};

export async function loader({ params }: LoaderFunctionArgs) {
	const message = await db.message.findUnique({
		where: {
			id: params.id,
		},
		select: { author: true, content: true },
	});
	const repliesPromise = new Promise((resolve, reject) => {
		setTimeout(resolve, 0);
	}).then(() =>
		db.message.findMany({
			where: { parent_id: params.id },
			select: { id: true, author: true, content: true },
			orderBy: { createdAt: "desc" },
		}),
	);

	return defer({
		message,
		replies: await repliesPromise,
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

	return json({ ok: true });
}

export default function Index() {
	const { message, replies } = useLoaderData<typeof loader>();
	let $form = useRef<HTMLFormElement>(null);
	const fetcher = useFetcher<typeof action>();

	useEffect(
		function resetFormOnSuccess() {
			console.log(fetcher.state, fetcher.data);
			if (fetcher.state === "idle" && fetcher.data?.ok) {
				$form.current?.reset();
			}
		},
		[fetcher.state, fetcher.data],
	);

	return (
		<div className="mx-auto flex max-w-lg flex-col gap-8 p-8">
			<Link to="/">
				<h1 className="text-3xl font-bold">&larr; Message</h1>
			</Link>

			<article className="flex flex-col rounded-[1.375rem] border border-black p-4">
				<p className="text-2xl">
					<span className="font-bold">{message?.author}</span> posted:
				</p>
				<p className="mb-4 text-2xl">{message?.content}</p>

				<section className="flex flex-col gap-4">
					<hr className="border-slate-300" />
					<h2 className="text-xl font-bold">Replies</h2>

					<fetcher.Form method="post" ref={$form}>
						<fieldset className="flex flex-col gap-2">
							<label htmlFor="author" className="text-lg font-medium">
								Display Name
							</label>
							<input
								type="text"
								name="author"
								id="author"
								placeholder="Anonymous"
								className="mb-2 rounded-md border border-black p-2 disabled:bg-slate-200"
							/>
							<label htmlFor="content" className="text-lg font-medium">
								Message
							</label>
							<textarea
								name="content"
								id="content"
								className="mb-2 rounded-md border border-black p-2 disabled:bg-slate-200"
								placeholder="Your Message"
								required
							></textarea>
							<button className="flex items-center justify-center gap-2 rounded-full bg-blue-600 py-2 text-center text-white disabled:bg-blue-400">
								Post Reply
							</button>
						</fieldset>
					</fetcher.Form>

					<div className="flex flex-col gap-4">
						{replies.length === 0 ? (
							<div className="rounded-md border border-dashed border-black p-8 text-center">
								No replies yet. Be the first to reply to this post now!
							</div>
						) : (
							<>
								{replies.map((reply) => (
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
							</>
						)}

						{/* <Suspense
							fallback={
								<div className="flex flex-col gap-2 rounded-md border border-dashed border-black p-4">
									<div className="h-4 w-36 animate-pulse bg-slate-500" />
									<div className="h-4 w-64 animate-pulse bg-slate-500" />
								</div>
							}
						>
							<Await resolve={replies}>
								{(replies) => {
									if (replies.length === 0) {
										return (
											<div className="rounded-md border border-dashed border-black p-8 text-center">
												No replies yet. Be the first to reply to this post now!
											</div>
										);
									}

									return (
										<>
											{replies.map((reply) => (
												<article
													key={reply.id}
													className="flex flex-col rounded-md border border-black p-4"
												>
													<p>
														<span className="font-bold">{reply.author}</span>{" "}
														replied:
													</p>
													<p>{reply.content}</p>
												</article>
											))}
										</>
									);
								}}
							</Await>
						</Suspense> */}
					</div>
				</section>
			</article>
		</div>
	);
}
