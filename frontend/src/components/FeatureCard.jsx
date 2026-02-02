// FeatureCard.jsx
import { Link } from "react-router-dom";

export default function FeatureCard({ title, description, to }) {
  return (
    <Link to={to}>
      <div className="bg-white text-purple-600 shadow-md p-6 rounded-lg text-center transition duration-300 ease-in-out transform hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-400 hover:text-white hover:scale-105">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <p className="text-gray-600 mt-2 hover:text-white">{description}</p>
      </div>
    </Link>
  );
}
