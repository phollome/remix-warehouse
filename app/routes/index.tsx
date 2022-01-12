import { LoaderFunction } from "remix";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  return null;
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
    </>
  );
}

export default Index;
