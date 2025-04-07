import { useState } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import AOS from "aos";
import "aos/dist/aos.css";

const SignIn = () => {
  const { signInUser, user, handleGoogleSignIn, handleLinkedInSignIn } = useAuth();
  const [showP, setShowp] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");
    
    signInUser({ email, password })  
      .then(() => {
        toast.success('Successfully signed in!');
        navigate("/");
      })
      .catch((error) => {
        console.error('Sign in error:', error);
        if (error.response?.data?.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error("An error occurred while signing in");
        }
      });
  };

  AOS.init();

  if (user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Sign In | SkillMate</title>
      </Helmet>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 space-y-8 transform hover:scale-[1.02] transition-transform duration-300">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Sign in to continue your journey
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-4">
            {/* Email field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="input input-bordered w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Password field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showP ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className="input input-bordered w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowp(!showP)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-500"
                >
                  {showP ? <GoEyeClosed size={20} /> : <GoEye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full btn bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transform hover:scale-105 transition-all duration-300"
          >
            Sign In
          </button>
        </form>

        {/* Social Sign In Options */}
        <div className="divider text-gray-500 dark:text-gray-400">OR</div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn btn-outline flex-1 gap-2 hover:bg-red-600 hover:border-red-600"
          >
            <img src="/assets/images/google.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
          <button
            type="button"
            onClick={handleLinkedInSignIn}
            className="btn btn-outline flex-1 gap-2 hover:bg-blue-600 hover:border-blue-600"
          >
            <img src="/assets/images/linkedin.svg" alt="LinkedIn" className="w-5 h-5" />
            Sign in with LinkedIn
          </button>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
