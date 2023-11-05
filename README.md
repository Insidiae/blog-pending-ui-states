# Pending UI States

TODO: Intro

> **Note**
>
> Want to follow along with the code examples I'll be showing? Just head over to the `starter/` folder and follow the setup instructions to run a minimal example app without the Pending UI examples. If you want to see the finished version, just head over to the `demo/` folder instead.

## Examples of Pending UI

TODO: Short intro/explainer

### Busy Indicators (Spinners)

TODO: Page Navigation

```tsx
// app/routes/messages.new.tsx
const navigation = useNavigation();

if (navigation.state === "loading") {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spinner />
    </div>
  );
}
```

TODO: Aside - Pending Links with Remix

> **Note**
>
> Remix has a `<NavLink />` component that provides helpful props for styling active and pending states. For example, you can use the `isPending` state to render a spiner while you navigate to another page:
>
> ```tsx
> // app/routes/_index.tsx
> <NavLink to="messages/new" className="...">
>   {({ isPending }) => (
>     <>
>       {isPending ? <Spinner /> : null}
>       New Message
>     </>
>   )}
> </NavLink>
> ```
>
> &nbsp;

TODO: Adding a New Message

```tsx
// app/routes/messages.new.tsx
const isSubmitting = navigation.formAction === "/messages/new";
```

You can then use the `isSubmitting` variable to display the `<Spinner />` and disable the form inputs while the submission is in progress:

```diff
// app/routes/messages.new.tsx
<Form method="post">
-	<fieldset className="...">
+	<fieldset className="..." disabled={isSubmitting}>
		/* ... */
		<button className="...">
+			{isSubmitting ? <Spinner /> : null}
			Submit
		</button>
	</fieldset>
</Form>
```

### Skeleton Fallbacks

TODO: `defer`-red data loading and `<Suspense />`

```diff
export async function loader({ params }: LoaderFunctionArgs) {
	const message = await db.message.findUnique({
		where: {
			id: params.id,
		},
		select: { author: true, content: true },
	});
	const repliesPromise = new Promise((resolve, reject) => {
-		setTimeout(resolve, 0);
+		setTimeout(resolve, 3000);
	}).then(() =>
		db.message.findMany({
			where: { parent_id: params.id },
			select: { id: true, author: true, content: true },
			orderBy: { createdAt: "desc" },
		}),
	);

	return defer({
		message,
-		replies: await repliesPromise,
+		replies: repliesPromise,
	});
}
```

```tsx
// app/routes/messages.$id.tsx
<Suspense
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
                <span className="font-bold">{reply.author}</span> replied:
              </p>
              <p>{reply.content}</p>
            </article>
          ))}
        </>
      );
    }}
  </Await>
</Suspense>
```

### Optimistic UI

TODO: Add Reply to Message

```tsx
// app/routes/messages.$id.tsx
let pendingReply: { author: string; content: string } | undefined;
if (fetcher.formData) {
  const author = fetcher.formData.get("author") || "Anonymous";
  const content = fetcher.formData.get("content");

  //? You can use the same validation logic as you used in the `action`
  if (typeof author === "string" && typeof content === "string") {
    pendingReply = {
      author,
      content,
    };
  }
}
```

```diff
// app/routes/messages.$id.tsx
<fetcher.Form method="post" ref={$form}>
-	<fieldset className="flex flex-col gap-2">
+	<fieldset className="flex flex-col gap-2" disabled={!!pendingReply}>
		{/* ... */}
		<button className="...">
+			{pendingReply ? <Spinner /> : null}
			Post Reply
		</button>
	</fieldset>
</fetcher.Form>
```

```diff
// app/routes/messages.$id.tsx
<div className="flex flex-col gap-4">
+	{pendingReply ? (
+		<article className="flex flex-col rounded-md border border-dashed border-slate-500 bg-slate-100 p-4 text-slate-500">
+			<p>
+				<span className="font-bold">{pendingReply.author}</span>{" "}
+				replied:
+			</p>
+			<p>{pendingReply.content}</p>
+		</article>
+	) : null}
	<Suspense
		fallback={/* ... */}
	>
		<Await resolve={replies}>
			{(replies) => {
-				if (replies.length === 0) {
+				if (!pendingReply && replies.length === 0) {
					return (
						<div className="rounded-md border border-dashed border-black p-8 text-center">
							No replies yet. Be the first to reply to this post now!
						</div>
					);
				}
				/* ... */
			}}
		</Await>
		/* ... */
	</Suspense>
</div>
```

## When to Use Each Type of Pending UI

TODO: Refer to Remix Docs for Guiding Principles
