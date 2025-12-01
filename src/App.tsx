import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./Login/Login";
import Signup from "./Login/Signup";
import MainPage from "./MainPage/MainPage";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProblems } from "./Problem/problemSlice";
// import { setProblems } from "./Problem/problemSlice";
// import { parseProblems } from "./Problem/problemParser";
// import { setSolutions } from "./Problem/solutionSlice";
// import solutionJson from "./Database/solution.json";
// import { setUsers } from "./Profile/userSlice";
// import userJson from "./Database/user.json";

function App() {
  const dispatch = useDispatch();
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
    // dispatch(setProblems(parseProblems()));
    // dispatch(setSolutions(solutionJson));
    // dispatch(setUsers(userJson));
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-600 text-lg">Loading problems...</p>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 space-y-4">
        <p className="text-rose-700 text-lg">Couldn’t reach the server.</p>
        <button
          className="px-4 py-2 bg-sky-600 text-white rounded-md"
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
