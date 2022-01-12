import type { Low } from "lowdb";
import { Link, LoaderFunction, useLoaderData } from "remix";
import type { Item, Data } from "~/utils/db.server";
import { getDb } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

type LoaderData = { item: Item };

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserId(request);

  const db = (await getDb()) as Low<Data>;

  if (db.data === null) {
    throw new Response("Internal Server Error.", {
      status: 500,
    });
  }

  const item = await db.data.items.find((item) => item.id === params.itemId);
  if (item === undefined) {
    throw new Response("Not found.", {
      status: 404,
    });
  }
  const data: LoaderData = { item };
  return data;
};

function Item() {
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <p>
        <Link to=".">{data.item.name}</Link>
      </p>
      <p>
        {data.item.amount} {data.item.amountType}
      </p>
    </div>
  );
}

export default Item;
