/**
 * UI for users to sign up (first name, last name, email, password)  
 * - On “Sign up” click, stores user data in Redux and navigates to main page (currently mock flow)  
 * 
 * TODO: 
 * Need backend signup API call
 * Check user input values, set error messge for invalid inputs
 */

import { EyeOff } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCurrentUser } from "../Profile/userSlice";

export default function Signup() {
  const [user, setUser] = useState<any>({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error] = useState(null);
  const signupHandler = () => {
    setUser({
      ...user,
      registerDate: new Date(),
      isAdmin: false,
      isStudent: true,
    });
    dispatch(setCurrentUser(user));
    navigate("/main");
  };

  return (
    <div id="signup" className="flex justify-center items-center">
      <div
        id="signup-box"
        className="bg-white shadow-lg rounded-3xl max-w-sm w-full p-8 text-stone-800 mt-10"
      >
        <h2 className="text-3xl text-center font-semibold my-5">Sign up</h2>
        <form id="signiup-form" className="space-y-4">
          <div className="flex flex-col">
            <label
              htmlFor="signup-first-name"
              className="text-xs text-start ps-1"
            >
              First Name
            </label>
            <input
              id="signup-first-name"
              type="text"
              placeholder="First Name"
              className="w-full rounded border border-stone-300 ps-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-stone-100 text-stone-700"
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="signup-last-name"
              className="text-xs text-start ps-1"
            >
              Last Name
            </label>
            <input
              id="signup-last-name"
              type="text"
              placeholder="Last Name"
              className="w-full rounded border border-stone-300 ps-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-stone-100 text-stone-700"
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="signup-email" className="text-xs text-start ps-1">
              Email
            </label>
            <input
              id="signup-email"
              type="text"
              placeholder="Email"
              className="w-full rounded border border-stone-300 ps-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-stone-100 text-stone-700"
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>
          <div className="relative flex flex-col">
            <label
              htmlFor="signup-password"
              className="text-xs text-start ps-1"
            >
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              placeholder="Password"
              autoComplete="off"
              className="w-full rounded border border-stone-300 ps-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-stone-100 text-stone-700"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
            <EyeOff
              size={18}
              className="absolute text-stone-400 cursor-pointer right-3 top-8"
            />
          </div>
          {error && (
            <div className="text-rose-700 flex mx-2 text-sm">{error}</div>
          )}
          <button
            className="w-full bg-sky-600 py-2 rounded mt-4 hover:bg-sky-700 text-white text-lg font-semibold"
            onClick={signupHandler}
          >
            Sign up
          </button>
          <div className="text-sm text-center">
            Already have an account? &nbsp;
            <Link to="/login" className="text-sky-600 hover:text-sky-800">
              Log in
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
              <span className="ms-2 text-stone-600">Sign up with Google</span>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
