/**
 * Redux store setup for SQL Study Room
 * - Combines all Redux slices into one central store
 * - Allows components to access shared data and dispatch actions with Redux
 */

import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../Profile/userSlice";
import problemReducer from "../Problem/problemSlice";
import solutionReducer from "../Problem/solutionSlice";
const store = configureStore({
  reducer: { userReducer, problemReducer, solutionReducer },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
