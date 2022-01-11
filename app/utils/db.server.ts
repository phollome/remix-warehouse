export type Data = {
  users: User[];
};

export type User = {
  username: string;
  passwordHash: string;
  validated: boolean;
};

let db: any;
let adapter: any;

async function getDb() {
  if (db === undefined && adapter === undefined) {
    // Use JSON file for storage
    const { Low, JSONFile } = await import("lowdb");
    adapter = new JSONFile<Data>("db.json");
    db = new Low<Data>(adapter);
  }

  // Read data from JSON file, this will set db.data content
  await db.read();
  return db;
}

export { getDb };
