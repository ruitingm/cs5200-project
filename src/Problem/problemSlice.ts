import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Problem } from "./problemType";
import { fetchProblemsApi } from "../api/problem";

type problemState = {
  problems: Problem[];
  loading: boolean;
  error: string | null;
};

const initialState: problemState = {
  problems: [],
  loading: false,
  error: null,
};
export const fetchProblems = createAsyncThunk(
  "problem/fetchProblems",
  async () => {
    const problems = await fetchProblemsApi();
    return problems; // 返回后端 JSON 数组
  }
);
const problemSlice = createSlice({
  name: "problem",
  initialState,
  reducers: {
    setProblems: (state, action: PayloadAction<Problem[]>) => {
      state.problems = action.payload;
    },
    addProblem: (state, action: PayloadAction<Problem>) => {
      const newProblem: Problem = {
        pId: action.payload.pId,
        pTitle: action.payload.pTitle,
        difficultyTag: action.payload.difficultyTag,
        conceptTag: action.payload.conceptTag,
        pDescription: action.payload.pDescription,
        pSolutionId: action.payload.pSolutionId,
        reviewed: true,
      };
      state.problems = state.problems
        ? [...state.problems, newProblem]
        : [newProblem];
    },
    deleteProblem: (state, action: PayloadAction<Problem>) => {
      state.problems = state.problems
        ? (state.problems.filter(
            (p: Problem) => p.pId !== action.payload.pId
          ) as Problem[])
        : state.problems;
    },
    updateProblem: (state, action: PayloadAction<Problem>) => {
      state.problems = state.problems
        ? (state.problems.map((p: Problem) =>
            p.pId === action.payload.pId ? action.payload : p
          ) as Problem[])
        : state.problems;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.problems = action.payload; // <-- 数据塞进 Redux!
      })
      .addCase(fetchProblems.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to fetch problems";
      });
  },
});

export const { setProblems, addProblem, deleteProblem, updateProblem } =
  problemSlice.actions;
export default problemSlice.reducer;
