import {
  ActionFunction,
  json,
  Link,
  useActionData,
  useSearchParams,
} from "remix";
import { createUserSession, login } from "~/utils/session.server";

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
  const password = form.get("password");

  const redirectTo = form.get("redirectTo") || "/";

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const user = await login({ username, password });
  if (user === null) {
    return {
      fields: { username, password: "" },
      formError: "Login failed.",
    };
  }

  return createUserSession(user.id, redirectTo);
};

function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();

  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/register">Register</Link>
          </li>
        </ul>
      </nav>
      <h1>Login</h1>
      <form method="post">
        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get("redirectTo") ?? undefined}
        />
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
