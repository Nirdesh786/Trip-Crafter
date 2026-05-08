import { Link } from "react-router-dom";


function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
      <h1 className="text-4xl font-bold mb-6">Welcome to Trip Crafter ✈️</h1>
      <p className="mb-8 text-lg">Plan your perfect journey with ease</p>

      <div className="flex gap-4">
        <Link to="/login">
          <button className="bg-green-500 px-6 py-3 rounded-xl text-white hover:bg-green-600">
            Login
          </button>
        </Link>

        <Link to="/register">
          <button className="bg-white px-6 py-3 rounded-xl text-blue-600 hover:bg-gray-200">
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}
export default Home;