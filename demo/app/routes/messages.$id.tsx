import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	defer,
	json,
} from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import MessageDisplay from "~/components/MessageDisplay";
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

export async function loader({ params }: LoaderFunctionArgs) {
	const message = await db.message.findUnique({
		where: {
			id: params.id,
		},
		select: { author: true, content: true },
	});
	const repliesPromise = new Promise((resolve, reject) => {
		setTimeout(resolve, 3000);
	}).then(() =>
		db.message.findMany({
			where: { parent_id: params.id },
			select: { id: true, author: true, content: true },
			orderBy: { createdAt: "desc" },
		}),
	);

	return defer({
		message,
		replies: repliesPromise,
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
	const { message, replies } = useLoaderData<typeof loader>();
	const navigation = useNavigation();

	if (navigation.formData) {
		const author = navigation.formData.get("author") || "Anonymous";
		const content = navigation.formData.get("content");

		if (typeof author === "string" && typeof content === "string") {
			return (
				<MessageDisplay
					message={message}
					replies={replies}
					pendingReply={{ author, content }}
				/>
			);
		}
	}

	return <MessageDisplay message={message} replies={replies} />;
}
