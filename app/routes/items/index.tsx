import { LoaderFunction, useLoaderData } from "remix";
import type { Low } from "lowdb";
import type { Data, Item } from "~/utils/db.server";
import { getDb } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { Link } from "react-router-dom";

type LoaderData = {
  items: Item[];
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request, "/login");

  const db = (await getDb()) as Low<Data>;

  const items: Item[] = db.data?.items || [];

  console.log(items);

  return { items };
};

function ItemsIndex() {
  const loaderData = useLoaderData<LoaderData>();

  return (
    <>
      <h1>Items</h1>
      {loaderData.items.map((item) => {
        return (
          <div key={item.id}>
            <p>
              <Link to={`./${item.id}`}>{item.name}</Link>
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
