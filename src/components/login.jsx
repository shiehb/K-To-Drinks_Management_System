import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import "../css/login.css";
import Loader from "./styled-components/Loader"; // Import the Loader component

export default function Login() {
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [loading, setLoading] = useState(false); // State for loading
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Set a timeout to hide the loader after 10 seconds (10000ms)
    const loaderTimeout = setTimeout(() => {
      setLoading(false);
      setError("Login process is taking longer than expected. Please try again.");
    }, 10000);

    try {
      const success = await login(credentials); // Assume login is asynchronous
      if (success) {
        // Redirect to dashboard on success
        navigate('/dashboard');
      } else {
        // Show error message on failure
        setError('Invalid username or password');
        // Clear input fields
        setCredentials({ username: '', password: '' });
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      clearTimeout(loaderTimeout); // Clear the timeout if the login process completes before the timeout
      setLoading(false);
    }

    // Remove error message after 3 seconds (3000ms)
    setTimeout(() => {
      setError("");
    }, 3000);
  };

  // Toggle password visibility
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {/* Full-screen loader */}
      {loading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent white background
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000, // Ensure it's on top of everything
        }}>
          <Loader />
        </div>
      )}

      {/* Login Container */}
      <div className="login-wrapper">
        {/* Error message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="login-container">
          {/* Left Section */}
          <div className="top-content">
            <div className="login-title">
              <div className="login-title-top">K-TO-DRINKS</div>
              <div className="login-title-bottom">TRADING</div>
            </div>
          </div>

          {/* Right Section */}
          <div className="bottom-content">
            {/* Login Form */}
            <form className="login-form" onSubmit={handleSubmit}>
              {/* Welcome Message */}
              <h1>Welcome,</h1>
              <p>Login to your account</p>

              {/* Username field */}
              <div className="input-group">
                <label htmlFor="username" className="labels">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  className="inputs"
                  placeholder="Enter your username"
                  required
                />
              </div>

              {/* Password field */}
              <div className="input-group password-input-container">
                <label htmlFor="password" className="labels">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  className="inputs"
                  placeholder="Enter your password"
                  required
                />
                <span
                  className="password-toggle-icon"
                  onClick={toggleShowPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <i className="fas fa-eye-slash"></i> // Eye-slash icon for hidden password
                  ) : (
                    <i className="fas fa-eye"></i> // Eye icon for visible password
                  )}
                </span>
              </div>

              {/* Login button */}
              <button type="submit" className="button">
                LOGIN
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}