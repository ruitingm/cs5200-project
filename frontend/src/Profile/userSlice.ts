/**
 * - Manages user-related state in Redux
 *  > currentUser = the logged-in user  
 *  > users = list of all users (for admin view)  
 * - Defines reducers / actions to:  
 *  > set current user on login/signup
 *  > update first/last name of current user  
 *  > set the full users list (for admin view)
 *  > delete a user 
 */

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "./userType";

type userState = {
  currentUser: User | null;
  users: User[];
};

const initialState: userState = {
  currentUser: null,
  users: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    updateFirstName: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        state.currentUser.firstName = action.payload;
      }
    },
    updateLastName: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        state.currentUser.lastName = action.payload;
      }
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    deleteUser: (state, action: PayloadAction<User>) => {
      state.users = state.users.filter(
        (user) =>
          user.accountNumber !== action.payload.accountNumber &&
          user.email !== action.payload.email
      );
    },
  },
});

export const {
  setCurrentUser,
  updateFirstName,
  updateLastName,
  setUsers,
  deleteUser,
} = userSlice.actions;

export default userSlice.reducer;
