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


---

# Authentication thing

Yes, Better Auth supports protected routes, but it doesn't provide a direct equivalent of NextAuth's `withAuth()` middleware wrapper.

Instead, Better Auth provides `auth.api.getSession()` and recommends protecting routes on the server.

The good news is that you don't necessarily need middleware.

## 1. Protect routes directly in Server Components

For example, `app/dashboard/page.tsx`:

```
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      Welcome {session.user.name}
    </div>
  );
}
```

That's the recommended server-side approach.

## 2. Avoid repeating this everywhere

Personally, I'd create a reusable authentication helper.

`lib/auth-guard.ts`:

```
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}
```

Now any protected page becomes simple:

```
import { requireAuth } from "@/lib/auth-guard";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div>
      Welcome {session.user.name}
    </div>
  );
}
```

You can also use this in server components and server actions (with appropriate authorization checks).

## 3. What about protecting an entire route group?

This is where Next.js layouts become useful.

Structure:

```
app/
├── (auth)/
│   ├── sign-in/
│   └── sign-up/
│
├── (protected)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── profile/
│       └── page.tsx
```

In `(protected)/layout.tsx`:

```
import { requireAuth } from "@/lib/auth-guard";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <>{children}</>;
}
```

Now every page inside that route group requires authentication.

Important: Layout checks are useful for protecting the UI, but don't rely on them as your only security boundary. Also validate sessions and permissions inside sensitive Server Actions and Route Handlers. Next.js layouts can be reused during navigation without rerunning on every request.

## 4. What about middleware?

Better Auth does have middleware integration guidance.

For example, you can use:

```
import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(
      new URL("/sign-in", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

This is an optimistic check only. It checks whether a session cookie exists, not whether the session is valid. Always perform server-side validation too.

For Next.js 16, the convention is `proxy.ts`; older versions use `middleware.ts`.

Source: [Better Auth – Next.js integration and auth protection](https://better-auth.com/docs/integrations/next?utm_source=chatgpt.com).

## My recommendation

For your application, I'd use:

- Protected route groups + reusable `requireAuth()` helper.
- No middleware required for basic route protection.
- Validate authentication and authorization again in sensitive backend operations.

This gives you clean code without needing to maintain a separate middleware just for authentication.

You can also check the [official NextAuth-to-Better-Auth migration guide](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/guides/next-auth-migration-guide.mdx?utm_source=chatgpt.com), which specifically explains the differences in route protection.


---

# Again another one

Yes! That's actually a clean approach, and I'd recommend it.

You can create two route groups:

- Protected routes: Only authenticated users can access them.
- Open/auth routes: Login and signup are accessible without authentication, but authenticated users get redirected to the dashboard.

You can implement both using layouts and a shared session helper. No middleware is necessary.

## 1. Folder structure

```
app/
├── layout.tsx
├── (open)/
│   ├── layout.tsx
│   ├── sign-in/
│   │   └── page.tsx
│   └── sign-up/
│       └── page.tsx
│
├── (protected)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
│
└── page.tsx
```

Remember, route groups in parentheses don't affect URLs. So `/sign-in` and `/dashboard` remain your actual URLs.

## 2. Create a session helper

`lib/auth-guard.ts`:

```
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireGuest() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return session;
}
```

## 3. Protected layout

`app/(protected)/layout.tsx`:

```
import { requireAuth } from "@/lib/auth-guard";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <>{children}</>;
}
```

## 4. Open routes layout

`app/(open)/layout.tsx`:

```
import { requireGuest } from "@/lib/auth-guard";

export default async function OpenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireGuest();

  return <>{children}</>;
}
```

Now the behavior is:

| User              | Visits `/sign-in`       | Visits `/dashboard`   |
| ----------------- | ----------------------- | --------------------- |
| Not authenticated | Allowed                 | Redirected to sign-in |
| Authenticated     | Redirected to dashboard | Allowed               |

## 5. One important Next.js consideration

Next.js layouts can persist across client-side navigation and aren't guaranteed to rerun on every navigation.

So I'd use the layouts for convenient route-level protection, but also call `requireGuest()` inside the sign-in and sign-up pages if you want their redirect checks to run whenever those pages render.

Likewise, always check authorization inside sensitive server actions and API routes.

My recommendation: Keep `app/layout.tsx` as your global root layout. Put authentication logic in `(open)/layout.tsx` and `(protected)/layout.tsx`.

This is a clean architecture for Better Auth + Next.js, and you don't need middleware just to achieve this behavior.


---

That's exactly what the open route layout (your `(auth)/layout.tsx`) is designed to prevent.

Even if an authenticated user manually enters `/login` or `/register` in the browser's address bar, the server checks their session before rendering the page.

For example:

`app/(auth)/layout.tsx`

```
import { requireGuest } from "@/lib/auth-guard";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireGuest();

  return <>{children}</>;
}
```

Your `requireGuest()` helper:

```
export async function requireGuest() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return session;
}
```

### Expected behavior

| User state | URL          | Result                   |
| ---------- | ------------ | ------------------------ |
| Logged out | `/login`     | Login page               |
| Logged out | `/register`  | Registration page        |
| Logged in  | `/login`     | Redirect to `/dashboard` |
| Logged in  | `/register`  | Redirect to `/dashboard` |
| Logged in  | `/dashboard` | Dashboard                |

This works even with manually entered URLs because the server performs the session check.

One important detail: Don't rely exclusively on layouts for security. Protect your server actions, API routes and sensitive data access independently.

So yes, your route-group layout approach handles precisely the scenario you're describing.