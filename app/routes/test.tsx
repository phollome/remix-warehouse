import { LoaderFunction, useLoaderData } from "remix";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  return { message: "You've logged in successfully." };
};

function Test() {
  const data = useLoaderData();

  return <h1>{data.message}</h1>;
}

export default Test;
