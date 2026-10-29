No 😂 You don't need to repeat that whole code everywhere!

The clean approach is to create a custom hook that gives you the current user wherever you need it.

## 1. Create a reusable hook

Create `src/hooks/use-current-user.ts`:

```
"use client";

import { authClient } from "@/lib/auth-client";

export function useCurrentUser() {
  const { data: session, isPending, error } = authClient.useSession();

  return {
    user: session?.user ?? null,
    isPending,
    error,
    isAuthenticated: !!session?.user,
  };
}
```

Now you have one reusable hook for your app.

## 2. Use it anywhere

Dashboard

```
"use client";

import { useCurrentUser } from "@/hooks/use-current-user";

export default function Dashboard() {
  const { user, isPending } = useCurrentUser();

  if (isPending) return <p>Loading...</p>;
  if (!user) return <p>Please log in.</p>;

  return <h1>Welcome, {user.name}</h1>;
}
```

Navbar

```
"use client";

import { useCurrentUser } from "@/hooks/use-current-user";

export default function Navbar() {
  const { user, isPending } = useCurrentUser();

  if (isPending) return null;

  return (
    <nav>
      {user ? (
        <span>{user.name}</span>
      ) : (
        <a href="/login">Sign in</a>
      )}
    </nav>
  );
}
```

Both components use the same Better Auth session system. You don't need Redux to share the user.

## 3. Want to access the user even more easily?

You can also create a reusable `UserProvider` with React Context if you want one shared interface for your entire component tree. But start with the custom hook; Better Auth already manages the session and your hook avoids repeating the logic.

My recommendation: use `useCurrentUser()` throughout your app. One hook, no Redux, no duplicated session logic.