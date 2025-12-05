import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Solution } from "./solutionType";

type solutionState = {
  solutions: Solution[] | null;
};

const initialState: solutionState = {
  solutions: [],
};

const solutionSlice = createSlice({
  name: "solution",
  initialState,
  reducers: {
    setSolutions: (state, action: PayloadAction<Solution[]>) => {
      state.solutions = action.payload;
    },
    addSolution: (state, action: PayloadAction<Solution>) => {
      const newSolution: Solution = {
        sId: action.payload.sId,
        sDescription: action.payload.sDescription,
      };
      state.solutions = state.solutions
        ? [...state.solutions, newSolution]
        : [newSolution];
    },
    deleteSolution: (state, action: PayloadAction<Solution>) => {
      state.solutions = state.solutions
        ? (state.solutions.filter(
            (s: Solution) => s.sId !== action.payload.sId
          ) as Solution[])
        : state.solutions;
    },
    updateSolution: (state, action: PayloadAction<Solution>) => {
      state.solutions = state.solutions
        ? (state.solutions.map((s: Solution) =>
            s.sId === action.payload.sId ? action.payload : s
          ) as Solution[])
        : state.solutions;
    },
  },
});

export const { setSolutions, addSolution, deleteSolution, updateSolution } =
  solutionSlice.actions;

export default solutionSlice.reducer;
