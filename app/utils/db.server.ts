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

declare global {
  var __client: MongoClient | undefined;
}

let client: MongoClient;

const mongodbUri = process.env.MONGODB_URI;
if (mongodbUri === undefined) {
  throw new Error("MongoDB uri must be set.");
}

async function getDb(): Promise<Db> {
  let db;

  if (process.env.NODE_ENV === "production") {
    if (client === undefined) {
      client = new MongoClient(mongodbUri as string);
      await client.connect();
    }
    db = client.db("remix-warehouse");
  } else {
    if (global.__client === undefined) {
      console.log("connect");
      global.__client = new MongoClient(mongodbUri as string);
      await global.__client.connect();
    }
    db = global.__client.db("remix-warehouse");
  }

  return db;
}

// needed for hexString conversion
// ObjectId.createFromHexString doesn't work in browser context
async function findItemById(id: string): Promise<ItemDoc | null> {
  const db = await getDb();
  const collection = db.collection("items");

  const item = await collection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  return item as ItemDoc;
}

export async function removeItemById(id: string) {
  const db = await getDb();
  const collection = db.collection("items");

  await collection.findOneAndDelete({
    _id: ObjectId.createFromHexString(id),
  });
}

export async function updateItemById(id: string, data: Item) {
  const db = await getDb();
  const collection = db.collection("items");

  const result = await collection.findOneAndUpdate(
    {
      _id: ObjectId.createFromHexString(id),
    },
    { $set: { ...data } }
  );

  console.log(result);
}

export { getDb, findItemById };
