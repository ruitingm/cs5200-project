/**
 * Root component for SQL Study Room frontend
 * - Sets up different pages of the website with React Router
 * - Loads all SQL problems from backend as soon as app opens
 * - Handles loading/error screens
 * - Defines the main routes (pages) and direct users to them
 *    > "/" automatically sends the user to the signup page
 *    > "/signup" the page where users create an account
 *    > "/login"  the page where users log in
 *    > "/main/*" the main part of the app
 */

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./Login/Login";
import Signup from "./Login/Signup";
import MainPage from "./MainPage/MainPage";
import { useAppDispatch } from "./store/hooks";
import { useEffect, useState } from "react";
import { fetchProblems } from "./Problem/problemSlice";
function App() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  // All Problems page pull data straight from database now instead of local json files
  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchProblems()).unwrap();
        setLoadFailed(false);
      } catch (err) {
        setLoadFailed(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-600 text-lg">Loading page...</p>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 space-y-4">
        <p className="text-rose-800 text-lg">Couldn’t reach the server.</p>
        <button
          className="px-4 py-2 bg-stone-300 text-stone-800 hover:bg-stone-400 rounded-md"
          onClick={async () => {
            setIsLoading(true);
            setLoadFailed(false);
            try {
              await dispatch(fetchProblems()).unwrap();
            } catch (err) {
              setLoadFailed(true);
            } finally {
              setIsLoading(false);
            }
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div id="sql-study-room" className="bg-stone-50 min-h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signup" />} />
          <Route path="/main/*" element={<MainPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
