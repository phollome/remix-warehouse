import { Link, LoaderFunction, useLoaderData } from "remix";
import type { Item, ItemDoc } from "~/utils/db.server";
import { getDb } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

type LoaderDataItem = Item & {
  _id: string;
};

type LoaderData = {
  items: LoaderDataItem[];
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request, "/login");

  const db = await getDb();
  const collection = db.collection("items");

  const items = (await collection.find().toArray()) as ItemDoc[];

  return { items };
};

function ItemsIndex() {
  const loaderData = useLoaderData<LoaderData>();

  return (
    <>
      <h1>Items</h1>
      {loaderData.items.map((item) => {
        const id = item._id;
        return (
          <div key={id}>
            <p>
              <Link to={`./${id}`}>{item.name}</Link>
            </p>
            <p>
              {item.amount} {item.amountType}
            </p>
          </div>
        );
      })}
    </>
  );
}

export default ItemsIndex;
