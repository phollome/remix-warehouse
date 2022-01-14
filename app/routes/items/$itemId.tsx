import {
  ActionFunction,
  Link,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import { findItemById, ItemDoc, removeItemById } from "~/utils/db.server";
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

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const itemId = form.get("itemId");

  if (typeof itemId !== "string") {
    throw new Response("Bad Request.", {
      status: 400,
    });
  }

  await removeItemById(itemId);
  return redirect(`/items`);
};

function Item() {
  const data = useLoaderData<LoaderData>();

  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/items" prefetch="render">
              Items
            </Link>
          </li>
        </ul>
      </nav>
      <h1>
        <Link to=".">{data.item.name}</Link>
      </h1>
      <p>
        {data.item.amount} {data.item.amountType}
      </p>
      <form method="post">
        <input type="hidden" name="itemId" value={data.item._id as string} />
        <button type="submit">Delete</button>
      </form>
    </>
  );
}

export default Item;
