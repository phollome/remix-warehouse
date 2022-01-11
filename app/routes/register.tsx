import { Low } from "lowdb";
import { ActionFunction, json, Link, useActionData } from "remix";
import { Data, getDb } from "~/utils/db.server";
import { register } from "~/utils/session.server";

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username?: string;
    password?: string;
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
  const password = form.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    return badRequest({
      formError: "Form not submitted correctly.",
    });
  }

  const db = (await getDb()) as Low<Data>;

  const user = await db.data?.users.find((user) => {
    return user.username === username;
  });

  if (user !== undefined) {
    return badRequest({
      fields: { username, password: "" },
      fieldErrors: { username: "User still exists." },
    });
  }

  const registeredUser = await register({ username, password });
  return registeredUser;
};

function Register() {
  const actionData = useActionData<ActionData>();

  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
        </ul>
      </nav>
      <h1>Register</h1>
      <form method="post">
        <div>
          <label htmlFor="username-input">Username</label>
          <input
            type="text"
            id="username-input"
            name="username"
            defaultValue={actionData?.fields?.username}
          />
          {actionData?.fieldErrors?.username ? (
            <p
              className="form-validation-error"
              role="alert"
              id="username-error"
            >
              {actionData?.fieldErrors.username}
            </p>
          ) : null}
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

export default Register;
