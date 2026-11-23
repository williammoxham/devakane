import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page container notfound">
      <h1>This page washed out to sea</h1>
      <p className="lede">The link may be old or mistyped.</p>
      <Link className="btn btn--dark" to="/">Go to the home page</Link>
    </div>
  );
}
