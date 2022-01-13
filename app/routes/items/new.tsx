import type { Collection } from "mongodb";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
  useActionData,
} from "remix";
import type { Item } from "~/utils/db.server";
import { getDb } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

type ActionData = {
  formError?: string;
  fields?: Item;
};

export const loader: LoaderFunction = async ({ request }) => {
  return requireUserId(request);
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const name = form.get("itemName");
  const amount = form.get("itemAmount");
  const amountType = form.get("itemAmountType");

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

  const db = await getDb();
  const collection: Collection = db.collection("items");

  const doc = {
    name,
    amount: parsedAmount,
    amountType,
  };
  const result = await collection.insertOne(doc);

  return redirect(`/items/${result.insertedId.toString()}`);
};

function NewItem() {
  const actionData = useActionData<ActionData>();

  return (
    <section>
      <h1>Add new item</h1>
      <form method="post">
        <div>
          <label htmlFor="item-name-input">name</label>
          <input type="text" id="item-name-input" name="itemName" />
        </div>
        <div>
          <label htmlFor="item-amount-input">amount</label>
          <input type="number" id="item-amount-input" name="itemAmount" />
        </div>
        <div>
          <label htmlFor="item-amount-type-select">amount type</label>
          <select id="item-amount-type-select" name="itemAmountType">
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
        <button type="submit" className="button">
          Submit
        </button>
      </form>
    </section>
  );
}

export default NewItem;
