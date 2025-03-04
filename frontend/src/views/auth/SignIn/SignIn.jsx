import { useState, useContext } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { Link, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Context } from "../../../components/AuthProvider/AuthProvider";
import { toast } from "react-hot-toast";
import axios from "axios";

const SignIn = () => {
  const { login } = useContext(Context);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();
  
  // States for account deactivation/reactivation flow
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [userId, setUserId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(email, password);
      
      if (response.deactivated) {
        // Handle deactivated account
        setIsDeactivated(true);
        setUserId(response.userId);
        toast.error(response.message || "Account is deactivated. Please reactivate it using your phone number.");
      } else if (response.success) {
        toast.success("Login Successful");
        history.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('http://localhost:5000/api/users/reactivate/send-code', 
        { userId, phoneNumber },
        { withCredentials: true }
      );
      toast.success("Verification code sent to your phone");
      setShowVerificationForm(true);
    } catch (error) {
      console.error("Send code error:", error);
      toast.error(error.response?.data?.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReactivate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('http://localhost:5000/api/users/reactivate/verify', 
        { userId, verificationCode },
        { withCredentials: true }
      );
      toast.success("Account reactivated successfully");
      setIsDeactivated(false);
      setShowVerificationForm(false);
      // Clear form fields
      setEmail("");
      setPassword("");
      setPhoneNumber("");
      setVerificationCode("");
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error.response?.data?.message || "Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark:bg-[#0f1729] min-h-screen">
      <Helmet>
        <title>SkillMate | Sign In</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center">
        <div className="hero-content flex-col md:w-auto w-[99vw] md:my-auto my-10 md:shadow-[0_0_10px_1px_#D1D1D1] dark:shadow-[0_0_50px_#122827] md:px-10 bg-white dark:bg-gray-900 bg-opacity-70 rounded-xl p-8">
          <h1 className="text-5xl font-bold text-main pt-4 pb-6">
            {isDeactivated 
              ? (showVerificationForm ? "Reactivate Account" : "Account Deactivated") 
              : "Sign In"}
          </h1>
          <div className="card w-96">
            <div className="card-body p-0">
              {!isDeactivated && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text dark:text-gray-200">Email</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                        className="input w-full bg-transparent dark:text-slate-300 border border-black focus:border-dashed focus:outline-none focus:border-main focus:ring-0"
                        required
                      />
                      <button
                        onClick={handleTogglePassword}
                        type="button"
                        className="absolute top-1/2 -translate-y-1/2 right-3 text-xl"
                      >
                        {showPassword ? <GoEyeClosed /> : <GoEye />}
                      </button>
                    </div>
                  </div>
                  <div className="form-control">
                    <button 
                      className="btn btn-primary bg-main hover:bg-main border-none text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Loading..." : "Sign In"}
                    </button>
                  </div>
                </form>
              )}

              {isDeactivated && !showVerificationForm && (
                <form onSubmit={handleSendVerificationCode} className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Your account is deactivated. Enter your phone number to reactivate it.
                  </p>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text dark:text-gray-200">Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                      className="input bg-transparent dark:text-slate-300 border border-black focus:border-dashed focus:outline-none focus:border-main focus:ring-0"
                      required
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      Enter in international format (e.g., +1234567890)
                    </span>
                  </div>
                  <div className="form-control">
                    <button 
                      className="btn btn-primary bg-main hover:bg-main border-none text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send Verification Code"}
                    </button>
                  </div>
                </form>
              )}

              {isDeactivated && showVerificationForm && (
                <form onSubmit={handleVerifyAndReactivate} className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    A verification code has been sent to your phone. Enter it below to reactivate your account.
                  </p>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text dark:text-gray-200">Verification Code</span>
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      className="input bg-transparent dark:text-slate-300 border border-black focus:border-dashed focus:outline-none focus:border-main focus:ring-0"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <button 
                      className="btn btn-primary bg-main hover:bg-main border-none text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify & Reactivate"}
                    </button>
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      className="text-main text-sm hover:underline"
                      disabled={isLoading}
                    >
                      Resend verification code
                    </button>
                  </div>
                </form>
              )}

              {!isDeactivated && (
                <>
                  <div className="divider">OR</div>
                  <button
                    onClick={() => window.location.href = 'http://localhost:5000/api/auth/linkedin'}
                    className="btn btn-outline w-full border-main hover:bg-main hover:border-main text-main hover:text-white"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
                      alt="LinkedIn"
                      className="w-5 h-5 mr-2"
                    />
                    Login with LinkedIn
                  </button>

                  <p className="text-center mt-4 dark:text-gray-200">
                    New to SkillMate?{" "}
                    <Link to="/auth/signup" className="text-main font-bold">
                      Sign Up
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;