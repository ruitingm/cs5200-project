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

// import { useRef } from "react";
// import { ChevronRight } from "lucide-react";
// import { Link } from "react-router";
// import ProblemItem from "./ProblemItem";
// import { useSelector } from "react-redux";
// import { problemCategories } from "./problemType";
// import type { RootState } from "../store/store";

// export default function AllProblems() {
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const problems = useSelector(
//     (state: RootState) => state.problemReducer.problems
//   );
//   const scrollRight = () => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
//     }
//   };

//   return (
//     <div className="flex flex-col h-full w-full bg-stone-100 text-stone-900 rounded-xl p-4 overflow-hidden space-y-5">
//       <div className="relative flex items-center mb-8">
//         <div
//           ref={scrollRef}
//           className="flex flex-row gap-3 overflow-x-auto no-scrollbar scroll-smooth pr-12 w-[calc(100%-2.5rem)]"
//         >
//           {problemCategories.map((topic, index) => (
//             <button
//               key={index}
//               className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors text-nowrap ${
//                 topic === "Basic"
//                   ? "bg-stone-600 text-white"
//                   : "bg-gray-300 hover:bg-stone-400 text-stone-800"
//               }`}
//             >
//               {topic}
//             </button>
//           ))}
//         </div>
//         <button
//           onClick={scrollRight}
//           className="absolute right-0 bg-stone-200 hover:bg-stone-300 p-1 rounded-full shadow-sm"
//         >
//           <ChevronRight className="text-stone-700" size={20} />
//         </button>
//       </div>
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2 bg-stone-200 px-3 py-1 rounded-3xl w-1/2">
//           <input
//             type="text"
//             placeholder="Search questions..."
//             className="bg-transparent w-full focus:outline-none text-stone-700 placeholder-stone-700"
//           />
//           <Link to="/main/chat">
//             <button className="py-2 px-3 rounded-3xl border border-sky-500 bg-stone-300 text-sm font-semibold text-stone-700 text-nowrap hover:bg-sky-700 hover:text-stone-50 shadow-md">
//               Ask AI for New Questions
//             </button>
//           </Link>
//         </div>
//       </div>
//       <div className="flex-1 overflow-y-auto rounded-lg ">
//         {problems?.map((p: any) => (
//           <div key={p.pId}>
//             <ProblemItem
//               pId={p.pId}
//               pTitle={p.pTitle}
//               difficultyTag={p.difficultyTag}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProblems } from "./problemSlice";
import type { AppDispatch, RootState } from "../store/store";
import ProblemItem from "./ProblemItem";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { problemCategories } from "./problemType";
import { fetchTagsApi, fetchTagProblemsApi } from "../api/tags";

export default function AllProblems() {
  const dispatch = useDispatch<AppDispatch>();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Redux data
  const { problems, loading, error } = useSelector(
    (state: RootState) => state.problemReducer
  );

  // Multi-select filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    []
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [topics, setTopics] = useState<
    { label: string; tagId?: number }[]
  >(problemCategories.map((label) => ({ label })));
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [filterMessage, setFilterMessage] = useState("");
  const [filtering, setFiltering] = useState(false);

  // Load problems on page load
  useEffect(() => {
    dispatch(fetchProblems());
    const loadTags = async () => {
      try {
        const result = await fetchTagsApi();
        const names = result.map(
          (tag: { concept: string; tag_id: number }) => ({
            label: tag.concept,
            tagId: tag.tag_id,
          })
        );
        setTopics(names);
        setTagsError(null);
      } catch (error) {
        console.log("failed to load tags", error);
        setTagsError("Could not load tags, using defaults.");
        setTopics(problemCategories.map((label) => ({ label })));
      } finally {
        setTagsLoading(false);
      }
    };
    loadTags();
  }, []);

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  // Toggle tag selection
  const toggleCategory = async (topic: { label: string; tagId?: number }) => {
    if (filtering) return;

    setSelectedCategories((prev) =>
      prev.includes(topic.label)
        ? prev.filter((t) => t !== topic.label)
        : [...prev, topic.label]
    );

    if (topic.tagId) {
      setFiltering(true);
      setFilterMessage(`Loading problems for ${topic.label}...`);
      try {
        const result = await fetchTagProblemsApi(topic.tagId);
        setFilterMessage(`Loaded ${result.length} problems for ${topic.label}.`);
      } catch (error) {
        console.log("failed to fetch tag problems", error);
        setFilterMessage(
          "Couldn't fetch problems for this tag. Showing local filter."
        );
      } finally {
        setFiltering(false);
      }
    }
  };

  // Toggle difficulty
  const toggleDifficulty = (level: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(level) ? prev.filter((d) => d !== level) : [...prev, level]
    );
  };

  // Apply ALL filters
  const filteredProblems = problems.filter((p) => {
    const matchCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((tag) => p.conceptTag.includes(tag));

    const matchDifficulty =
      selectedDifficulties.length === 0 ||
      selectedDifficulties.includes(p.difficultyTag);

    const matchSearch =
      searchKeyword === "" ||
      p.pTitle.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      p.pDescription.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchCategory && matchDifficulty && matchSearch;
  });

  if (loading) return <div className="p-4">Loading problems…</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full w-full bg-stone-100 p-4 space-y-5">
      {/* ===================== CATEGORY FILTER ===================== */}
      <div className="relative flex items-center mb-4">
        <div
          ref={scrollRef}
          className="flex flex-row gap-3 overflow-x-auto no-scrollbar scroll-smooth pr-12 w-[calc(100%-2.5rem)]"
        >
          {(topics.length > 0
            ? topics
            : problemCategories.map((label) => ({ label }))
          ).map((topic) => (
            <button
              key={topic.label}
              onClick={() => toggleCategory(topic)}
              className={`px-4 py-2 rounded-full text-sm font-semibold text-nowrap
                ${
                  selectedCategories.includes(topic.label)
                    ? "bg-stone-700 text-white"
                    : "bg-gray-300 hover:bg-stone-400 text-stone-800"
                }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
        <button
          onClick={scrollRight}
          className="absolute right-0 bg-stone-200 hover:bg-stone-300 p-1 rounded-full shadow-sm"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {tagsLoading && (
        <div className="text-sm text-slate-500">Loading tags…</div>
      )}
      {!tagsLoading && tagsError && (
        <div className="text-sm text-rose-600">{tagsError}</div>
      )}
      {filterMessage && (
        <div className="text-sm text-slate-600">{filterMessage}</div>
      )}

      {/* ===================== DIFFICULTY FILTER ===================== */}
      <div className="flex gap-3">
        {["Easy", "Medium", "Hard"].map((diff) => (
          <button
            key={diff}
            onClick={() => toggleDifficulty(diff)}
            className={`px-4 py-1 rounded-full text-sm font-semibold
              ${
                selectedDifficulties.includes(diff)
                  ? "bg-sky-600 text-white"
                  : "bg-gray-300 text-stone-800 hover:bg-sky-300"
              }`}
          >
            {diff}
          </button>
        ))}
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
        {filteredProblems.length === 0 ? (
          <div className="p-6 text-stone-500 text-center">
            No problems match your filters.
          </div>
        ) : (
          filteredProblems.map((p) => (
            <ProblemItem
              key={p.pId}
              pId={p.pId}
              pTitle={p.pTitle}
              difficultyTag={p.difficultyTag}
              conceptTags={p.conceptTag}
            />
          ))
        )}
      </div>
    </div>
  );
}
