import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const REPORT_URL = "http://localhost:8000/api/v1";

export default function IssueDetail() {
    const { id } = useParams();

    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const headers = { Authorization: `Bearer ${token}` };
        fetch(`${REPORT_URL}/issues/${id}`, { headers })
            .then((res) => res.json())
            .then((data) => setIssue(data))
            .finally(() => setLoading(false));
    }, [id, token]);

    const submitComment = async () => {
        if (!commentText.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${REPORT_URL}/issues/${id}/comments`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: commentText }),
            });

            const newComment = await res.json();

            // Add new comment to UI
            setIssue((prev) => ({
                ...prev,
                comments: [...prev.comments, newComment],
            }));

            setCommentText("");
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !issue) {
        return (
            <div className="min-h-screen bg-cwDark text-cwText flex justify-center items-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cwDark text-cwText px-6 py-10 flex justify-center">
            <div className="max-w-3xl w-full bg-cwMedium/90 border border-cwBlue/40 p-6 rounded-xl shadow-lg">

                <h1 className="text-3xl font-bold text-cwBlue mb-4">
                    {issue.title}
                </h1>

                {/* IMAGE */}
                {issue.image_url && (
                    <img
                        src={issue.image_url}
                        alt="Issue"
                        className="w-full rounded-lg mb-6 border border-cwBlue/20"
                    />
                )}

                {/* DETAILS */}
                <p className="text-gray-300 mb-4">{issue.description}</p>

                <p className="text-gray-400 text-sm mb-1">
                    <strong>Category:</strong> {issue.category}
                </p>

                <p className="text-gray-400 text-sm mb-4">
                    <strong>Status:</strong> {issue.status}
                </p>

                {/* COMMENTS SECTION */}
                <h2 className="text-2xl font-semibold text-cwBlue mt-6 mb-3">
                    Comments
                </h2>

                <div className="space-y-3 mb-6">
                    {issue.comments.length === 0 ? (
                        <p className="text-gray-400 text-sm">No comments yet.</p>
                    ) : (
                        issue.comments.map((c) => (
                            <div
                                key={c.comment_id}
                                className="bg-cwDark/40 border border-cwBlue/30 rounded-lg p-3"
                            >
                                <p className="text-gray-300">{c.text}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                    {new Date(c.created_at).toLocaleString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* ADD COMMENT */}
                <textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-cwDark/40 border border-cwBlue/40 p-3 rounded-lg text-cwText mb-3"
                    rows={3}
                ></textarea>

                <button
                    onClick={submitComment}
                    disabled={submitting}
                    className="bg-cwBlue hover:bg-cwLight text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                >
                    {submitting ? "Posting..." : "Post Comment"}
                </button>
            </div>
        </div>
    );
}
