import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
    return (
        <main className="not-found-page">
            <div className="not-found-content">
                <p className="not-found-eyebrow">404 · NOTHING HERE</p>

                <h1>
                    This pretty little page
                    <span> wandered away.</span>
                </h1>

                <p className="not-found-text">
                    The page you're looking for doesn't exist or may have moved.
                </p>

                <div className="not-found-actions">
                    <Link to="/" className="button button-dark">
                        Back to Home
                    </Link>

                    <Link to="/scoops" className="button button-outline">
                        Shop Scoops
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default NotFound;