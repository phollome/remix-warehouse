import type { Db } from "mongodb";
import { MongoClient, ObjectId } from "mongodb";

export type User = {
  username: string;
  passwordHash: string;
  validated: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserDoc = User & {
  _id: ObjectId | string;
};

export type Item = {
  name: string;
  amount: number;
  amountType: string;
};

export type ItemDoc = Item & {
  _id: ObjectId | string;
};

let db: any;

const mongodbUri = process.env.MONGODB_URI;
if (mongodbUri === undefined) {
  throw new Error("MongoDB uri must be set.");
}
const client = new MongoClient(mongodbUri);

async function getDb(): Promise<Db> {
  if (db === undefined) {
    await client.connect();
    db = client.db("remix-warehouse");
  }
  return db;
}

// needed for hexString conversion
// ObjectId.createFromHexString doesn't work in browser context
async function findItemById(id: string): Promise<ItemDoc | null> {
  if (db === undefined) {
    await getDb();
  }
  const collection = db.collection("items");

  const item = await collection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  return item;
}

export async function removeItemById(id: string) {
  if (db === undefined) {
    await getDb();
  }
  const collection = db.collection("items");

  await collection.findOneAndDelete({
    _id: ObjectId.createFromHexString(id),
  });
}

export { getDb, findItemById };
