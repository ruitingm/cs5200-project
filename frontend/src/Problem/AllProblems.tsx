/**
 * Main page listing all SQL problems for users
 * - Fetches all problems on load via Redux thunk
 * - Loads tags, supports filtering
 *
 * TODO:
 * Right now, clicking a tag triggers a fetch from /tags/{tagId}/problems/
 * but you don’t update the displayed problem list with fetched result.
 * Need to either merge with Redux or update local state so filter actually works.
 */

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProblems } from "./problemSlice";
import type { AppDispatch, RootState } from "../store/store";
import ProblemItem from "./ProblemItem";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { type ProblemCategory, type ProblemDifficultyTag } from "./problemType";
import { fetchTagsApi, fetchFilteredProblemsApi } from "../api/tags";

export default function AllProblems() {
  const dispatch = useDispatch<AppDispatch>();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Redux data
  const { problems, loading, error } = useSelector(
    (state: RootState) => state.problemReducer
  );

  // Filter state - separate selected (UI) from applied (backend)
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory>();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>();
  const [, setAppliedTagId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Tags data from backend: { tag_id, difficulty, concept }
  const [tags, setTags] = useState<
    {
      tag_id: number;
      difficulty: ProblemDifficultyTag;
      concept: ProblemCategory;
    }[]
  >([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [filterMessage, setFilterMessage] = useState("");
  const [filtering, setFiltering] = useState(false);

  // Filtered problems from backend
  const [filteredProblems, setFilteredProblems] = useState<any[]>([]);

  // Load problems and tags on page load
  useEffect(() => {
    dispatch(fetchProblems());
    const loadTags = async () => {
      try {
        const result = await fetchTagsApi();
        setTags(result);
        setTagsError(null);
      } catch (error) {
        console.log("failed to load tags", error);
        setTagsError("Could not load tags.");
      } finally {
        setTagsLoading(false);
      }
    };
    loadTags();
  }, [dispatch]);

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  // Apply filters: find matching tag and fetch filtered problems
  const applyFilters = async () => {
    if (!selectedDifficulty && !selectedCategory) {
      return;
    }

    setFiltering(true);
    setFilterMessage("Applying filters...");

    try {
      let matchingTags = tags;

      if (selectedDifficulty) {
        matchingTags = matchingTags.filter(
          (tag) =>
            tag.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
        );
      }

      if (selectedCategory) {
        matchingTags = matchingTags.filter((tag) =>
          tag.concept.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      }

      if (matchingTags.length === 0) {
        setFilterMessage("No matching tags found for this combination.");
        setFilteredProblems([]);
        setFiltering(false);
        return;
      }

      // Fetch problems for all matching tags
      const allProblems: any[] = [];
      for (const tag of matchingTags) {
        const result = await fetchFilteredProblemsApi(tag.tag_id);
        allProblems.push(...result);
      }

      // Remove duplicates based on problem_id
      const uniqueProblems = Array.from(
        new Map(allProblems.map((p) => [p.problem_id, p])).values()
      );

      setFilteredProblems(uniqueProblems);
      setAppliedTagId(matchingTags[0].tag_id);
      setFilterMessage(
        `Found ${uniqueProblems.length} problem(s) matching your filters.`
      );
    } catch (error) {
      console.log("failed to fetch filtered problems", error);
      setFilterMessage("Failed to apply filters. Please try again.");
    } finally {
      setFiltering(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedDifficulty(undefined);
    setAppliedTagId(null);
    setFilteredProblems([]);
    setFilterMessage("");
  };

  // Determine which problems to display
  const displayProblems =
    filteredProblems.length > 0 ? filteredProblems : problems;

  // Apply search filter client-side
  const searchFilteredProblems = displayProblems.filter((p: any) => {
    if (!searchKeyword) return true;
    const title = p.pTitle || p.description || "";
    const desc = p.pDescription || p.description || "";
    return (
      title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      desc.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  });

  if (loading)
    return <div className="p-4 text-stone-800">Loading problems...</div>;
  if (error) return <div className="p-4 text-rose-800">{error}</div>;

  return (
    <div className="flex flex-col h-full w-full bg-stone-100 p-4 space-y-5">
      {/* ===================== CATEGORY FILTER ===================== */}
      <div className="relative flex items-center mb-4 felx-col">
        <div
          ref={scrollRef}
          className="flex flex-row gap-3 overflow-x-auto no-scrollbar scroll-smooth pr-12 w-[calc(100%-2.5rem)]"
        >
          {Array.from(new Set(tags.map((tag) => tag.concept))).map(
            (concept) => (
              <button
                key={concept}
                onClick={() => {
                  setSelectedCategory(concept as ProblemCategory);
                  console.log(concept);
                }}
                className={`px-4 py-2 rounded-full text-sm font-semibold text-nowrap
                ${
                  selectedCategory === concept
                    ? "bg-stone-700 text-white"
                    : "bg-gray-300 hover:bg-stone-400 text-stone-800"
                }`}
              >
                {concept}
              </button>
            )
          )}
        </div>
        <button
          onClick={scrollRight}
          className="absolute right-0 bg-stone-200 hover:bg-stone-300 p-1 rounded-full shadow-sm"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      {/* ===================== DIFFICULTY FILTER ===================== */}
      <div className="flex gap-3 items-center">
        {["Easy", "Medium", "Hard"].map((diff) => (
          <button
            key={diff}
            onClick={() => {
              setSelectedDifficulty(diff);
              console.log(diff);
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold
              ${
                selectedDifficulty === diff
                  ? "bg-sky-600 text-white"
                  : "bg-gray-300 text-stone-800 hover:bg-sky-300"
              }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {tagsLoading && (
        <div className="text-sm text-stone-600">Loading tags…</div>
      )}
      {!tagsLoading && tagsError && (
        <div className="text-sm text-rose-800">{tagsError}</div>
      )}
      {filterMessage && (
        <div className="text-sm text-stone-600">{filterMessage}</div>
      )}
      <div className="flex space-x-4 justify-end">
        <button
          onClick={applyFilters}
          disabled={filtering}
          className="ml-4 px-6 py-1 rounded-full text-sm font-semibold bg-rose-700 text-white hover:bg-rose-800 disabled:cursor-not-allowed"
        >
          {filtering ? "Applying..." : "Apply Filters"}
        </button>
        <button
          onClick={clearFilters}
          className="px-6 py-1 rounded-full text-sm font-semibold bg-stone-200 text-stone-900 hover:bg-stone-300"
        >
          Clear Filters
        </button>
      </div>
      {/* ===================== SEARCH FILTER ===================== */}
      <div className="flex gap-2 bg-white px-3 py-1 rounded-3xl shadow">
        <input
          type="text"
          placeholder="Search problems..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="bg-transparent w-full focus:outline-none text-stone-700"
        />

        <Link to="/main/chat">
          <button className="py-2 px-3 rounded-3xl border border-sky-500 bg-stone-200 text-sm font-semibold hover:bg-sky-700 hover:text-white shadow-md">
            Ask AI
          </button>
        </Link>
      </div>
      {/* ===================== PROBLEM LIST ===================== */}
      <div className="flex-1 overflow-y-auto rounded-lg">
        {searchFilteredProblems.length === 0 ? (
          <div className="p-6 text-stone-500 text-center">
            No problems match your filters.
          </div>
        ) : (
          searchFilteredProblems.map((p: any) => (
            <ProblemItem
              key={p.pId || p.problem_id}
              pId={p.pId || p.problem_id}
              pTitle={p.pTitle || p.description}
              difficultyTag={p.difficultyTag || "Easy"}
              conceptTags={p.conceptTag || []}
            />
          ))
        )}
      </div>
    </div>
  );
}
