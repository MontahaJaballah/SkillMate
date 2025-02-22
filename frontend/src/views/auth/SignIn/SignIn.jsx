import { GoEye, GoEyeClosed } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import { Link, Navigate, useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import useAuth from "../../Hook/useAuth";
import { useState } from "react";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";

const SignIn = () => {
  const { signWithGoogle, user, signInUser } = useAuth();
  const [showP, setShowp] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const notify = () =>
    toast.success("Sign In Successful.", {
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

  const handleSignIn = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");
    e.target.reset();

    signInUser(email, password)
      .then((result) => {
        notify();
      })
      .catch((error) => {
        if(error){
          toast.error("Invalid Email And Password")
        }
      });
  };
  const handleShowP = () => {
    setShowp(!showP);
  };
  const handleGoogleSignin = () => {
    signWithGoogle()
      .then(() => {
        notify()
      })
      .catch((error) => {
        // Removed console.log statement
      });
  };
  AOS.init();
  return (
    <>
      <div className="">
        <Helmet>
          <title>Skill Exchange | Sign In</title>
        </Helmet>

        <div className="flex h-screen justify-between items-center container mx-auto ">
          <div className="flex-1">
            <div
              data-aos="zoom-in"
              data-aos-offset="200"
              data-aos-duration="600"
              data-aos-mirror="true"
              data-aos-once="false"
              data-aos-anchor-placement="top"
              className="hero min-h-[80vh] "
            >
              <div className="hero-content flex-col md:w-auto w-[99vw] md:my-auto my-10 md:shadow-[0_0_10px_1px_#D1D1D1] dark:shadow-[0_0_50px_#122827] md:px-10 bg-white dark:bg-gray-900 dark:bg-gray-900 bg-opacity-70 rounded-xl">
                <h1 className="text-5xl font-bold text-main pt-8">
                  Sign In now!
                </h1>
                <div className="card  w-96   pt-3">
                  <div className="card-body">
                    <form onSubmit={handleSignIn}>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Email</span>
                        </label>
                        <input
                          type="emil"
                          name="email"
                          placeholder="email"
                          className="input bg-transparent dark:text-slate-300 border  border-black focus:border-dashed focus:outline-none focus:border-main focus:ring-0"
                          required
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Password</span>
                        </label>
                        <div className="form-control relative">
                          <input
                            type={showP ? "text" : "password"}
                            name="password"
                            placeholder="password"
                            className="input bg-transparent dark:text-slate-300 border  border-black focus:border-dashed focus:outline-none focus:border-main focus:ring-0"
                            required
                          />
                          <span
                            className="absolute top-4 right-2"
                            onClick={handleShowP}
                          >
                            {showP ? <GoEye /> : <GoEyeClosed />}
                          </span>
                        </div>
                        <label className="label">
                          <a
                            href="#"
                            className="label-text-alt link link-hover"
                          >
                            Forgot password?
                          </a>
                        </label>
                      </div>
                      <div className="form-control mt-6">
                        <button type="submit" className="btn bg-white dark:bg-gray-900 hover:bg-white  border-1 border-main hover:border-main">
                          Sign In
                        </button>
                      </div>
                    </form>
                    <div className="my-1 font-medium">
                      <p className="my-4">
                        Do not have a account ? :{" "}
                        <Link to={"/signUp"} className=" font-bold text-main">
                          Sign Up
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {user && (
                <Navigate
                  to={location?.state ? location.state : "/"}
                ></Navigate>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
