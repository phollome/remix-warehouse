import bcrypt from "bcryptjs";
import { Low } from "lowdb";
import { Data, getDb, User } from "./db.server";

type LoginForm = {
  username: string;
  password: string;
};

export async function register({ username, password }: LoginForm) {
  const passwordHash = await bcrypt.hash(password, 10);

  const db = (await getDb()) as Low<Data>;

  const user: User = {
    username,
    passwordHash,
    validated: false,
  };

  db.data?.users.push(user);
  db.write();

  return user;
}
