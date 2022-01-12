import { join } from "path";
import { randomUUID } from "crypto";

export type Data = {
  users: User[];
  items: Item[];
};

export type User = {
  id: string;
  username: string;
  passwordHash: string;
  validated: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Item = {
  id: string;
  name: string;
  amount: number;
  amountType: string;
};

let db: any;
let adapter: any;

async function getDb() {
  if (db === undefined && adapter === undefined) {
    // Use JSON file for storage
    const { Low, JSONFile } = await import("lowdb");
    adapter = new JSONFile<Data>(join(__dirname, "db.json"));
    db = new Low<Data>(adapter);
  }

  // Read data from JSON file, this will set db.data content
  await db.read();

  // Set defaults
  if (db.data === null) {
    db.data = { users: [], items: [] };
    await db.write();
  }

  return db;
}

type AddItemParameters = {
  name: string;
  amount: number;
  amountType: string;
};

export async function addItem(params: AddItemParameters) {
  const db = await getDb();
  const id = randomUUID();

  const item = {
    id,
    ...params,
  };

  db.data.items.push(item);
  await db.write();

  return item;
}

export { getDb };
