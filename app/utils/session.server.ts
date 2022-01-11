import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { Low } from "lowdb";
import { Data, getDb, User } from "./db.server";

type LoginForm = {
  username: string;
  password: string;
};

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
