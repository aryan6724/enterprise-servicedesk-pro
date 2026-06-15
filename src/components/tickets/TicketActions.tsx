"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type TicketActionsProps = {
  ticketId: string;
  currentStatus: string;
  userRole: string;
};

export default function TicketActions({
  ticketId,
  currentStatus,
  userRole,
}: TicketActionsProps) {
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [comment, setComment] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState("");

  const canUpdateStatus = userRole !== "EMPLOYEE";

  async function handleStatusUpdate() {
  setError("");
  setStatusLoading(true);

  try {
    const response = await fetch(`/api/tickets/${ticketId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Failed to update status");
      return;
    }

    router.refresh();
  } catch (error) {
    console.error("Frontend status update error:", error);
    setError("Status API failed. Check terminal error.");
  } finally {
    setStatusLoading(false);
  }
}

  async function handleAddComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setCommentLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to add comment");
        return;
      }

      setComment("");
      router.refresh();
    } catch {
      setError("Something went wrong while adding comment.");
    } finally {
      setCommentLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-bold">Ticket Actions</h2>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {canUpdateStatus && (
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Update Status
          </label>

          <div className="flex gap-3">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REOPENED">Reopened</option>
            </select>

            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={statusLoading}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {statusLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleAddComment} className="mt-6">
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Add Comment
        </label>

        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
          placeholder="Write an update or response..."
        />

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={commentLoading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {commentLoading ? "Adding..." : "Add Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}