import { Link, LoaderFunction, useLoaderData } from "remix";
import { getUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  const isLoggedIn = userId !== null;
  return { isLoggedIn };
};

function Index() {
  const { isLoggedIn } = useLoaderData();

  return (
    <>
      {isLoggedIn === false ? (
        <nav>
          <ul>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </ul>
        </nav>
      ) : null}
      {isLoggedIn ? (
        <form action="/logout" method="post">
          <button type="submit" className="button">
            Logout
          </button>
        </form>
      ) : null}
      <h1>Home</h1>
    </>
  );
}

export default Index;
