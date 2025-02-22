import { useState } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { Link, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import AOS from "aos";
import "aos/dist/aos.css";

const SignUp = () => {
  const { signUpUser, updateUserProfile, user } = useAuth();
  const [showP, setShowp] = useState(false);
  const history = useHistory();

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
          history.push("/");
        });
      })
      .catch((error) => {
        if (error) {
          toast.error("Email already in use");
        }
      });
  };

  const handleShowP = () => {
    setShowp(!showP);
  };

  AOS.init();

  if (user) {
    history.push("/");
    return null;
  }

  return (
    <div className="dark:bg-[#0f1729] min-h-screen">
      <Helmet>
        <title>SkillMate | Sign Up</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center">
        <div
          data-aos="zoom-in"
          data-aos-offset="200"
          data-aos-duration="600"
          data-aos-mirror="true"
          data-aos-once="false"
          data-aos-anchor-placement="top"
          className="hero-content flex-col md:w-auto w-[99vw] md:my-auto my-10 md:shadow-[0_0_10px_1px_#D1D1D1] dark:shadow-[0_0_50px_#122827] md:px-10 bg-white dark:bg-gray-900 bg-opacity-70 rounded-xl p-8"
        >
          <h1 className="text-5xl font-bold text-main pt-4 pb-6">Sign Up now!</h1>
          <div className="card w-96">
            <div className="card-body p-0">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text dark:text-gray-200">Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input bg-transparent dark:text-slate-300 border border-black focus:border-dashed focus:outline-none focus:border-main focus:ring-0"
                    placeholder="Your name"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text dark:text-gray-200">Photo URL</span>
                  </label>
                  <input
                    type="text"
                    name="photo"
                    required
                    className="input bg-transparent dark:text-slate-300 border border-black focus:border-dashed focus:outline-none focus:border-main focus:ring-0"
                    placeholder="Photo URL"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text dark:text-gray-200">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="input bg-transparent dark:text-slate-300 border border-black focus:border-dashed focus:outline-none focus:border-main focus:ring-0"
                    placeholder="Your email"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text dark:text-gray-200">Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showP ? "text" : "password"}
                      name="password"
                      required
                      className="input w-full bg-transparent dark:text-slate-300 border border-black focus:border-dashed focus:outline-none focus:border-main focus:ring-0"
                      placeholder="Your password"
                    />
                    <span
                      onClick={handleShowP}
                      className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    >
                      {showP ? <GoEyeClosed className="text-gray-500" /> : <GoEye className="text-gray-500" />}
                    </span>
                  </div>
                </div>
                <div className="form-control mt-6">
                  <button
                    type="submit"
                    className="btn bg-main hover:bg-main/90 text-white border-none"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
              <div className="mt-4 text-center">
                <p className="dark:text-gray-300">
                  Already have an account?{" "}
                  <Link to="/auth/signin" className="font-bold text-main hover:text-main/90">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
