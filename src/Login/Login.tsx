/**
 * UI for users to log in with email & password  
 * - Calls backend via loginApi and, if successful stores user info in Redux  
 * - Redirects user to main page on successful login; shows error messages on failure  
 * 
 * TODO:
 * Connect to backend databae for login credential check
 */

import { EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import { setCurrentUser } from "../Profile/userSlice";
import { MockLogin } from "./MockLogin";
import { useState } from "react";
import { loginApi } from "../api/auth";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // const handleLogin = (email: string, password: string) => {
  //   const result = MockLogin(email, password);
  //   if (!result.success) {
  //     setError(result.message || null);
  //     return;
  //   }
  //   if (result.user) {
  //     dispatch(
  //       setCurrentUser({
  //         ...result.user,
  //       })
  //     );
  //     navigate("/main");
  //   }
  // };
  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await loginApi(email, password);

      if (!result.success) {
        setError(result.message || "Login failed");
        return;
      }

      dispatch(
        setCurrentUser({
          email: result.email,
          firstName: result.firstName, // ensure loginApi has turned to camelCase
          lastName: result.lastName,
          accountNumber: result.accountNumber,
          isStudent: result.isStudent, // boolean
          isAdmin: result.isAdmin, // boolean
        })
      );

      navigate("/main");
    } catch (err) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login" className="flex justify-center items-center">
      <div
        id="login-box"
        className="bg-white shadow-lg rounded-3xl max-w-sm w-full p-8 text-stone-800 mt-10"
      >
        <h2 className="text-3xl text-center font-semibold my-5 text-stone-700">
          Log in
        </h2>
        <form id="login-form" className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="login-email" className="text-xs text-start ps-1">
              Email
            </label>
            <input
              id="login-email"
              type="text"
              placeholder="Email"
              className="w-full rounded border border-stone-300 ps-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-stone-200"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col relative">
            <label htmlFor="login-password" className="text-xs text-start ps-1">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="Password"
              autoComplete="off"
              className="w-full rounded border border-stone-300 ps-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-stone-200"
              onChange={(e) => setPassword(e.target.value)}
            />
            <EyeOff
              size={18}
              className="absolute text-stone-400 cursor-pointer right-3 top-8"
            />
          </div>
          {error && (
            <div className="text-rose-700 flex mx-2 text-sm">{error}</div>
          )}
          {/* <button
            className="w-full bg-sky-600 py-2 rounded mt-4 hover:bg-sky-700 text-white text-lg font-semibold"
            onClick={(e) => {
              e.preventDefault();
              handleLogin(email, password);
            }}
          >
            Log in
          </button> */}
          <button
            className="w-full bg-sky-600 py-2 rounded mt-4 hover:bg-sky-700 text-white text-lg font-semibold"
            onClick={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
          <div className="text-sm text-center">
            Do not have an account? &nbsp;
            <Link to="/signup" className="text-sky-600 hover:text-sky-800">
              Sign up here
            </Link>
          </div>
          <div className="relative flex items-center">
            <div className="grow border-t border-stone-400"></div>
            <span className="shrink mx-4 text-stone-400">or</span>
            <div className="grow border-t border-stone-400"></div>
          </div>
          <button
            className="w-full py-2 rounded mt-2 hover:bg-stone-100 font-bold border justify-center border-stone-500
          "
          >
            <div className="flex justify-center">
              <FcGoogle size={22} />
              <span className="ms-2 text-stone-600">Log in with Google</span>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
