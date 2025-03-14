import { useState } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import AOS from "aos";
import "aos/dist/aos.css";

const SignIn = () => {
  const { signInUser, sendReactivationCode, verifyAndReactivate, user, handleGoogleSignIn, handleLinkedInSignIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  AOS.init();

  if (user) {
    navigate("/");
    return null;
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInUser({ email, password });
      toast.success("Login Successful");
      const redirectPath = location.state?.from || "/";
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.error || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="card w-96">
          <div className="card-body p-0">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  className="input input-bordered w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="input w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 pr-10"
                    required
                  />
                  <button
                    onClick={handleTogglePassword}
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-500"
                  >
                    {showPassword ? <GoEyeClosed size={20} /> : <GoEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Lien "Forgot Password?" ajouté ici */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="form-control">
                <button 
                  className="w-full btn bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transform hover:scale-105 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Login"}
                </button>
              </div>
            </form>

            <div className="divider text-gray-500 dark:text-gray-400">OR</div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="btn btn-outline w-full border-purple-600 hover:bg-purple-600 hover:border-purple-600"
            >
              <img src="/assets/images/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
            <button
              type="button"
              onClick={handleLinkedInSignIn}
              className="btn btn-outline w-full border-blue-600 hover:bg-blue-600 hover:border-blue-600"
            >
              <img src="/assets/images/linkedin.svg" alt="LinkedIn" className="w-5 h-5" />
              Sign in with LinkedIn
            </button>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
