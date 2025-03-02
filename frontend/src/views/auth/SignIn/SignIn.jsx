import { useState, useContext, useEffect } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Context } from "../../../components/AuthProvider/AuthProvider";
import AOS from "aos";
import "aos/dist/aos.css";

const SignIn = () => {
  const { login, user } = useContext(Context);
  const [showP, setShowp] = useState(false);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      // Get the previous location or default based on role
      const from = location.state?.from?.pathname ||
        (user.role === 'admin' ? "/admin" :
          ['client', 'student', 'teacher'].includes(user.role) ? "/client" :
            "/");

      history.replace(from);
    }
  }, [user, history, location]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    try {
      const loginResponse = await login(email, password);

      // If login is successful, the useEffect will handle routing
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleShowP = () => {
    setShowp(!showP);
  };

  const handleLinkedInLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/linkedin';
  };

  useEffect(() => {
    AOS.init();
  }, []);

  if (user) {
    return null;
  }

  return (
    <div className="dark:bg-[#0f1729] min-h-screen">
      <Helmet>
        <title>SkillMate | Sign In</title>
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
          <h1 className="text-5xl font-bold text-main pt-4 pb-6">
            Sign In now!
          </h1>
          <div className="card w-96">
            <div className="card-body p-0">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text dark:text-gray-200">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="email"
                    className="input bg-transparent dark:text-slate-300 border border-black focus:border-dashed focus:outline-none focus:border-main focus:ring-0"
                    required
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
                      placeholder="password"
                      className="input w-full bg-transparent dark:text-slate-300 border border-black focus:border-dashed focus:outline-none focus:border-main focus:ring-0"
                      required
                    />
                    <button
                      onClick={handleShowP}
                      type="button"
                      className="absolute top-1/2 -translate-y-1/2 right-3 text-xl"
                    >
                      {showP ? <GoEyeClosed /> : <GoEye />}
                    </button>
                  </div>
                </div>
                <div className="form-control">
                  <button className="btn btn-primary bg-main hover:bg-main border-none text-white">
                    Sign In
                  </button>
                </div>
              </form>

              {/* LinkedIn Sign In */}
              <div className="divider">OR</div>
              <button
                onClick={handleLinkedInLogin}
                className="btn btn-outline w-full border-main hover:bg-main hover:border-main text-main hover:text-white"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
                  alt="LinkedIn"
                  className="w-5 h-5 mr-2"
                />
                Sign in with LinkedIn
              </button>

              <p className="text-center mt-4 dark:text-gray-200">
                New to SkillMate?{" "}
                <Link to="/auth/signup" className="text-main font-bold">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;