import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("⚠️ Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("⚠️ Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/users/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Password reset successful!");
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate("/auth/signin");
        }, 2000);
      } else {
        setMessage(`⚠️ ${data.message || "An error occurred"}`);
      }
    } catch (error) {
      setMessage("❌ Reset failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
        <h2>🔐 Reset Password</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            required
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full btn bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transform hover:scale-105 transition-all duration-300"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && (
          <p
            style={{
              marginTop: "15px",
              color: message.includes("✅") ? "green" : message.includes("⚠️") ? "#ff9800" : "red",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;