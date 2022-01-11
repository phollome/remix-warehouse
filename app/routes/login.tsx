import { ActionFunction, json, Link, useActionData } from "remix";
import { Data, getDb } from "~/utils/db.server";

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    username: string;
    password: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const username = form.get("username");

  const db = await getDb();

  const user = await (db.data as Data)?.users.find((user) => {
    return user.username === username;
  });

  if (user === undefined) {
    return badRequest({ formError: "User does not exist." });
  }

  console.log(form);
  return null;
};

function Login() {
  const actionData = useActionData<ActionData>();

  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/register">Register</Link>
          </li>
        </ul>
      </nav>
      <h1>Login</h1>
      <form method="post">
        <div>
          <label htmlFor="username-input">Username</label>
          <input type="text" id="username-input" name="username" />
        </div>
        <div>
          <label htmlFor="password-input">Password</label>
          <input type="text" id="password-input" name="password" />
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
    </>
  );
}

export default Login;
