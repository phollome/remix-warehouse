import React from "react";
import {
  ActionFunction,
  json,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import { Item, ItemDoc, updateItemById } from "~/utils/db.server";
import { findItemById, removeItemById } from "~/utils/db.server";
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

type ActionData = {
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData | Response> => {
  const form = await request.formData();

  const itemId = form.get("itemId");
  const name = form.get("itemName");
  const amount = form.get("itemAmount");
  const amountType = form.get("itemAmountType");

  if (itemId === null || typeof itemId !== "string") {
    throw new Response("Bad Request.", {
      status: 400,
    });
  }

  // handle deletion
  if (name === null && amount === null && amountType === null) {
    await removeItemById(itemId);
    return redirect(`/items`);
  }

  // handle update
  const parsedAmount = amount !== null ? parseInt(amount as string) : 0;

  if (
    typeof name !== "string" ||
    typeof amountType !== "string" ||
    typeof parsedAmount !== "number"
  ) {
    return badRequest({
      formError: "Form not submitted correctly.",
    });
  }

  const result = await updateItemById(itemId, {
    name,
    amount: parsedAmount,
    amountType,
  });
  return {};
};

function Item() {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [hasChanged, setHasChanged] = React.useState(false);

  const handleChange = () => {
    setHasChanged(true);
  };

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
      <form method="post" onChange={handleChange}>
        <input type="hidden" name="itemId" value={data.item._id as string} />
        <div>
          <label htmlFor="item-name-input">name</label>
          <input
            type="text"
            id="item-name-input"
            name="itemName"
            defaultValue={data.item.name}
          />
        </div>
        <div>
          <label htmlFor="item-amount-input">amount</label>
          <input
            type="number"
            id="item-amount-input"
            name="itemAmount"
            defaultValue={data.item.amount}
          />
        </div>
        <div>
          <label htmlFor="item-amount-type-select">amount type</label>
          <select
            id="item-amount-type-select"
            name="itemAmountType"
            defaultValue={data.item.amountType}
          >
            <option value="grams">grams</option>
            <option value="kilograms">kilograms</option>
            <option value="pieces">pieces</option>
          </select>
        </div>
        <div id="form-error-message">
          {actionData?.formError ? (
            <p className="form-validation-error" role="alert">
              {actionData?.formError}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          className="button"
          disabled={hasChanged === false}
        >
          Update
        </button>
      </form>
      <form method="post">
        <input type="hidden" name="itemId" value={data.item._id as string} />
        <button type="submit">Delete</button>
      </form>
    </>
  );
}

export default Item;
