import { Link, Await, Form } from "@remix-run/react";
import { Suspense } from "react";
import type { Message as PrismaMessage } from "@prisma/client";

type Message = Pick<PrismaMessage, "author" | "content">;
type Reply = Pick<PrismaMessage, "id" | "author" | "content">;

type MessageDisplayProps = {
	message: Message | null;
	replies: Promise<Reply[]>;
	pendingReply?: Omit<Reply, "id">;
};
export default function MessageDisplay({
	message,
	replies,
	pendingReply,
}: MessageDisplayProps) {
	return (
		<div className="mx-auto flex max-w-lg flex-col gap-8 p-8">
			<Link to="/">
				<h1 className="text-3xl font-bold">&larr; Message</h1>
			</Link>

			<article className="flex flex-col rounded-[1.375rem] border border-black p-4">
				<p>
					<span className="font-bold">{message?.author}</span> posted:
				</p>
				<p className="mb-4">{message?.content}</p>

				<section className="flex flex-col gap-4">
					<h2 className="text-xl font-bold">Replies</h2>

					<Form method="post" className="flex flex-col gap-2">
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
							Post Reply
						</button>
					</Form>

					<div className="flex flex-col gap-4">
						{pendingReply && (
							<article className="flex flex-col rounded-md border border-dashed border-slate-500 bg-slate-100 p-4 text-slate-500">
								<p>
									<span className="font-bold">{pendingReply.author}</span>{" "}
									replied:
								</p>
								<p>{pendingReply.content}</p>
							</article>
						)}
						<Suspense
							fallback={
								<div className="rounded-md border border-dashed border-black p-8 text-center">
									Loading...
								</div>
							}
						>
							<Await resolve={replies}>
								{(replies) => {
									if (!pendingReply && replies.length === 0) {
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
						</Suspense>
					</div>
				</section>
			</article>
		</div>
	);
}
