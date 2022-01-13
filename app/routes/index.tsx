import { Link, LoaderFunction } from "remix";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  return requireUserId(request);
};

function Index() {
  return (
    <>
      <form action="/logout" method="post">
        <button type="submit" className="button">
          Logout
        </button>
      </form>
      <h1>Home</h1>
      <Link to="/items" prefetch="render">
        All items
      </Link>
      ,{" "}
      <Link to="/items/new" prefetch="render">
        Add new item
      </Link>
    </>
  );
}

export default Index;
