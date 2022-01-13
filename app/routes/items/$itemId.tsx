import { Link, LoaderFunction, redirect, useLoaderData } from "remix";
import { findItemById, Item, ItemDoc } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

type LoaderData = { item: ItemDoc };

export const loader: LoaderFunction = async ({
  request,
  params,
}): Promise<LoaderData> => {
  await requireUserId(request);

  if (params.itemId === undefined) {
    throw redirect("/items");
  }

  const item = await findItemById(params.itemId);

  if (item === null) {
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
