/**
 * Displays the logged-in user’s profile info
 * - Fetches full profile data from backend on mount  
 * - Allows user to edit first and last name and save changes via backend API  
 * - Provides a logout button to clear user state and navigate to login page  
 * 
 * TODO:
 * Validate user input before saving profile
 */

import dayjs from "dayjs";
import { BellDot } from "lucide-react";
import { useEffect, useState } from "react";
// import userData from "../Database/user.json";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser } from "./userSlice";
// import { setCurrentUser, updateFirstName, updateLastName } from "./userSlice";
import { useNavigate } from "react-router";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { fetchProfileApi, updateProfileApi } from "../api/profile";

export default function Profile() {
  dayjs.extend(customParseFormat);
  const { currentUser } = useSelector((state: any) => state.userReducer);
  const [profileData, setProfileData] = useState<any>(currentUser);
  // Manually add user
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const profilePicture = "/images/default_profile.jpg";
  // const email = currentUser?.email || userData[0].email;
  const email = profileData?.email || currentUser?.email || "";
  // const registerDate = currentUser?.registerDate || userData[0].registerDate;
  const registerDate = profileData?.registerDate || currentUser?.registerDate;
  // const isStudent = currentUser?.isStudent || userData[0].isStudent;
  const isStudent =
    profileData?.isStudent ?? currentUser?.isStudent ?? false;
  //
  const today = dayjs().format("dddd, MMMM D, YYYY");
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  console.log("currentUser");
  console.log(currentUser);
  console.log("DATE");
  console.log(registerDate);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.accountNumber) {
        return;
      }

      try {
        const result = await fetchProfileApi(currentUser.accountNumber);
        setProfileData({
          ...currentUser,
          ...result,
        });
        setFirstName(result.firstName || "");
        setLastName(result.lastName || "");
      } catch (error) {
        console.log("failed to load profile", error);
      }
    };

    loadProfile();
  }, [currentUser]);
  const handleSaveProfile = async () => {
    if (!currentUser?.accountNumber) {
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateProfileApi(currentUser.accountNumber, {
        firstName,
        lastName,
      });
      setProfileData((prev: any) => ({
        ...prev,
        ...updated,
      }));
      dispatch(
        setCurrentUser({
          ...currentUser,
          ...updated,
        })
      );
      setIsEditing(false);
    } catch (error) {
      console.log("failed to save profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="profile" className="flex flex-col px-6">
      <header
        id="profile-header"
        className="flex items-center justify-between mb-5 mt-6"
      >
        <div>
          <h1 className="text-xl text-stone-600">Welcome, {firstName}</h1>
          <h3 className="text-stone-600">{today}</h3>
        </div>
        <div className="flex space-x-5 items-center">
          <BellDot size={20} className="text-stone-600" />
          <img
            src={profilePicture}
            alt="Profile"
            className="w-11 h-11 rounded-sm border-stone-200 border-2 object-cover text-sm"
          />
        </div>
      </header>
      <main
        id="profile-box"
        className="rounded-lg bg-white pt-8 pb-15 px-5 shadow-lg"
      >
        <div id="profile-content" className="flex flex-col space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-6 items-center">
              <img
                src={profilePicture}
                alt="Profile"
                className="rounded-full h-20 w-20 shadow-sm"
              />
              <div>
                <div className="text-xl text-stone-800 font-semibold">
                  {firstName} {lastName}
                </div>
                <div className="text-sm text-stone-600">{email}</div>
              </div>
            </div>
            {!isEditing && (
              <button
                id="edit-profile-btn"
                className="text-lg text-white bg-sky-600 rounded-sm px-5 py-1 hover:bg-sky-700"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
            {isEditing && (
              <div className="flex space-x-2">
                <button
                  id="save-profile-btn"
                  className="text-lg text-white bg-rose-700 rounded-sm px-5 py-1 hover:bg-rose-800 disabled:opacity-50"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  id="cancel-edit-profile-btn"
                  className="text-lg text-stone-800 bg-neutral-200 rounded-sm px-4 py-1 hover:bg-neutral-300"
                  onClick={() => {
                    setFirstName(
                      profileData?.firstName || currentUser?.firstName || ""
                    );
                    setLastName(
                      profileData?.lastName || currentUser?.lastName || ""
                    );
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col text-stone-600 text-m space-y-5">
            <div className="flex space-x-10">
              <div className="flex flex-col flex-1">
                <label htmlFor="first-name">First Name</label>
                {!isEditing && (
                  <input
                    id="first-name"
                    type="text"
                    value={firstName}
                    className="px-3 py-2 bg-gray-100 rounded-lg focus:outline-none"
                    readOnly
                  />
                )}
                {isEditing && (
                  <input
                    id="first-name"
                    type="text"
                    value={firstName}
                    className="px-3 py-2 bg-gray-100 rounded-lg focus:ring-2 focus:ring-gray-300 border border-neutral-400"
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                )}
              </div>
              <div className="flex flex-col flex-1">
                <label htmlFor="nickname">Last Name</label>
                {!isEditing && (
                  <input
                    id="last-name"
                    type="text"
                    value={lastName}
                    className="px-3 py-2 bg-gray-100 rounded-lg focus:outline-none"
                    readOnly
                  />
                )}
                {isEditing && (
                  <input
                    id="last-name"
                    type="text"
                    value={lastName}
                    className="px-3 py-2 bg-gray-100 rounded-lg  focus:ring-2 focus:ring-gray-300 border border-neutral-400"
                    onChange={(e) => setLastName(e.target.value)}
                  />
                )}
              </div>
            </div>
            <div className="flex space-x-10">
              <div className="flex flex-col flex-1">
                <label htmlFor="register-date">Registered Date</label>
                <input
                  id="register-date"
                  type="text"
                  value={
                    dayjs(registerDate).isValid()
                      ? dayjs(registerDate).format("YYYY-MM-DD")
                      : ""
                  }
                  className="px-3 py-2 bg-gray-100 rounded-lg focus:outline-none"
                  readOnly
                />
              </div>
              <div className="flex flex-col flex-1">
                <label htmlFor="user-type">User Type</label>
                <div
                  id="user-type"
                  className="flex items-center space-x-8 h-full"
                >
                  <div>
                    <input
                      disabled
                      id="student-btn"
                      type="radio"
                      className="me-2 ms-1"
                      checked={isStudent}
                    />
                    <label htmlFor="student-btn">Student</label>
                  </div>
                  <div>
                    <input
                      disabled
                      id="admin-btn"
                      type="radio"
                      className="me-2"
                      checked={!isStudent}
                    />
                    <label htmlFor="admin-btn">Administrator</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="flex my-10 justify-end">
        <button
          id="logout-btn"
          className="px-10 py-2 bg-rose-700 hover:bg-rose-800 rounded-md text-white"
          onClick={() => {
            dispatch(setCurrentUser(null as any)), navigate("/login");
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
