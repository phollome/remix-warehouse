import { Link } from "remix";

function Index() {
  return (
    <>
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
      <h1>Home</h1>
    </>
  );
}

export default Index;
