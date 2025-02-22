import { useState } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../Hook/useAuth";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";

const SignUp = () => {
  const { signWithGoogle, signUpUser, updateUserProfile } = useAuth();
  const [showP, setShowp] = useState(false);
  const navigate = useNavigate();

  const handleShowP = () => {
    setShowp(!showP);
  };

  const notify = () =>
    toast.success("Sign Up Successful.", {
      style: {
        border: "1px solid #007456",
        padding: "20px",
        color: "#007456",
      },
      iconTheme: {
        primary: "#007456",
        secondary: "#FFFAEE",
      },
    });

  const handleSignUp = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name");
    const photo = form.get("photo");
    const email = form.get("email");
    const password = form.get("password");

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error("Password must contain at least one special character");
      return;
    }

    signUpUser(email, password)
      .then(() => {
        updateUserProfile(name, photo).then(() => {
          notify();
          navigate("/");
        });
      })
      .catch((error) => {
        if (error) {
          toast.error("Email already in use");
        }
      });
  };

  const handleGoogleSignUp = () => {
    signWithGoogle()
      .then(() => {
        notify();
        navigate("/");
      })
      .catch((error) => {
        if (error) {
          toast.error("Sign up failed");
        }
      });
  };

  return (
    <div className="dark:bg-[#0f1729]">
      <Helmet>
        <title>Skill Exchange | Sign Up</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-[#0f1729] p-8 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-semibold mb-6 text-center dark:text-white">Sign Up</h2>
          <form onSubmit={handleSignUp}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-white text-sm font-bold mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-main"
                placeholder="Your name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-white text-sm font-bold mb-2">
                Photo URL
              </label>
              <input
                type="text"
                name="photo"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-main"
                placeholder="Photo URL"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-white text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-main"
                placeholder="Your email"
              />
            </div>
            <div className="mb-6 relative">
              <label className="block text-gray-700 dark:text-white text-sm font-bold mb-2">
                Password
              </label>
              <input
                type={showP ? "text" : "password"}
                name="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-main"
                placeholder="Your password"
              />
              <div
                onClick={handleShowP}
                className="absolute right-3 top-10 cursor-pointer"
              >
                {showP ? <GoEyeClosed></GoEyeClosed> : <GoEye></GoEye>}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-main text-white py-2 rounded-lg hover:bg-opacity-90 transition duration-300"
            >
              Sign Up
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-white">Or sign up with</p>
            <button
              onClick={handleGoogleSignUp}
              className="mt-2 w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center hover:bg-gray-50 transition duration-300"
            >
              <FcGoogle className="text-2xl mr-2" />
              <span className="dark:text-white">Google</span>
            </button>
          </div>
          <p className="mt-4 text-center text-gray-600 dark:text-white">
            Already have an account?{" "}
            <Link to="/signin" className="text-main hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
