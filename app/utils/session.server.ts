import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { Low } from "lowdb";
import { createCookieSessionStorage, redirect } from "remix";
import { Data, getDb, User } from "./db.server";

type LoginForm = {
  username: string;
  password: string;
};

const sessionSecret = process.env.SESSION_SECRET;
if (sessionSecret === undefined) {
  throw new Error("Session secret must be set.");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "remix_warehouse_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax", // TODO: check this setting
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true, // TODO: check this setting
  },
});

export async function register({ username, password }: LoginForm) {
  const passwordHash = await bcrypt.hash(password, 10);

  const db = (await getDb()) as Low<Data>;

  const date = new Date();

  const user: User = {
    id: randomUUID(),
    username,
    passwordHash,
    validated: false,
    createdAt: date,
    updatedAt: date,
  };

  db.data?.users.push(user);
  db.write();

  return user;
}

export async function login({ username, password }: LoginForm) {
  const db = (await getDb()) as Low<Data>;

  const user = await db.data?.users.find((user) => {
    return user.username === username;
  });

  if (user === undefined) {
    return null;
  }

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (isCorrectPassword === false) {
    return null;
  }

  if (user.validated === false) {
    return null;
  }

  return user;
}

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");

  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function logout(request: Request, redirectTo: string = "/login") {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
