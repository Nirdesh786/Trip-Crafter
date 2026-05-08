import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Trip<span className="text-green-400">Crafter</span>
            </h2>
            <p className="text-gray-400 text-sm">
              Your ultimate travel companion. Plan, organize, and experience the perfect journey with ease.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Connect With Us</h3>
            <p className="text-gray-400 text-sm mb-4">
              Join our newsletter to get the best travel tips and destination guides.
            </p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 w-full rounded-l-lg bg-gray-800 border-none focus:ring-2 focus:ring-green-400 text-sm outline-none text-white"
              />
              <button className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
<p>
  &copy; {new Date().getFullYear()} Trip Crafter. All rights reserved. |
  Designed & Developed by Nirdesh Yadav
</p>        </div>
      </div>
    </footer>
  );
}

export default Footer;