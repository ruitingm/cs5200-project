/**
 * A reusable modal dialog that handles delete confirmatiom flow
 * - Uses @headlessui/react’s Dialog to show a modal overlay and panel
 * - Ensures user must confirm deletion before proceeding
 * - On “Delete” click:
 *  > closes the modal  
 *  > dispatches either deleteUser or deleteProblem action via Redux  
 * 
 * TODO:
 * Need backend API calls, right now it only updates Redux store.
 * Need loading/error message if backend call fails.
 */

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useDispatch } from "react-redux";
import type { User } from "../Profile/userType";
import { deleteUser } from "../Profile/userSlice";
import type { Problem } from "../Problem/problemType";
import { deleteProblem } from "../Problem/problemSlice";

export default function DeleteModal({
  openModal,
  setOpenModal,
  user,
  problem,
}: {
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  user?: User;
  problem?: Problem;
}) {
  const dispatch = useDispatch();
  return (
    <Dialog open={openModal} onClose={setOpenModal} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-stone-200/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-stone-700"
                  >
                    {user ? "Deleting User" : "Deleting Problem"}
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-stone-700">
                      {user
                        ? `Are you sure you want to delete ${user.firstName} ${user.lastName}`
                        : `Are you sure you want to delete ${problem?.pTitle}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-stone-200 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => {
                  setOpenModal(false);
                  if (user) {
                    dispatch(deleteUser(user));
                  }
                  if (problem) {
                    dispatch(deleteProblem(problem));
                  }
                }}
                className="inline-flex w-full justify-center rounded-md bg-rose-700 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-800 sm:ml-3 sm:w-auto"
              >
                Delete
              </button>
              <button
                type="button"
                data-autofocus
                onClick={() => setOpenModal(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-stone-400 px-3 py-2 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-stone-500 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
