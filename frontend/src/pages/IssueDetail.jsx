import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const REPORT_URL = "http://localhost:8000/api/v1";

export default function IssueDetail() {
    const { id } = useParams();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${REPORT_URL}/issues/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setIssue(data))
            .catch(() => setError("Failed to load issue."))
            .finally(() => setLoading(false));
    }, [id]);

    const handleConfirm = async () => {
        const token = localStorage.getItem("token");
        setError("");
        setSuccess("");

        const res = await fetch(`${REPORT_URL}/issues/${id}/confirm`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
            setSuccess(data.message);
        } else {
            setError(data.detail || data.message || "Confirmation failed.");
        }
    };

    const handleComment = async () => {
        const token = localStorage.getItem("token");
        setError("");
        setSuccess("");

        const res = await fetch(`${REPORT_URL}/issues/${id}/comments`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: comment }),
        });

        const data = await res.json();
        if (res.ok) {
            setSuccess("Comment added!");
            setComment("");
        } else {
            setError(data.detail || data.message || "Failed to add comment.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cwDark text-cwText flex justify-center items-center">
                Loading Issue...
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="min-h-screen bg-cwDark text-cwText flex justify-center items-center">
                Issue not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cwDark text-cwText px-6 py-10 flex justify-center">
            <div className="max-w-3xl w-full bg-cwMedium/90 rounded-xl p-6 border border-cwBlue/40 shadow-lg">

                {/* Title */}
                <h1 className="text-3xl font-bold text-cwBlue mb-4">{issue.title}</h1>

                {/* Image */}
                {issue.image_url && (
                    <img
                        src={issue.image_url}
                        alt="Issue"
                        className="w-full max-h-80 object-cover rounded-xl mb-4 border border-cwLight/20"
                    />
                )}

                {/* Info Section */}
                <div className="space-y-2 mb-6">
                    <p><strong>Status:</strong> {issue.status}</p>
                    <p><strong>Priority:</strong> {issue.priority}</p>
                    <p><strong>Category:</strong> {issue.category}</p>
                    <p>
                        <strong>Location:</strong>  
                        {issue.latitude}, {issue.longitude}
                    </p>
                    <p className="text-gray-300 mt-3">{issue.description}</p>
                </div>

                {/* Success/Error */}
                {error && <p className="text-red-400 mb-2">{error}</p>}
                {success && <p className="text-green-400 mb-2">{success}</p>}

                {/* Confirm Button */}
                <button
                    onClick={handleConfirm}
                    className="bg-cwBlue hover:bg-cwLight text-white px-4 py-2 rounded-lg shadow mb-6"
                >
                    Confirm Issue
                </button>

                {/* Comment Box */}
                <div className="space-y-3">
                    <textarea
                        rows="3"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full bg-cwDark/50 border border-cwBlue/40 text-cwText p-3 rounded-lg focus:ring-2 focus:ring-cwBlue"
                        placeholder="Add a comment..."
                    />

                    <button
                        onClick={handleComment}
                        className="bg-cwLight/20 border border-cwBlue/40 text-cwText px-4 py-2 rounded-lg hover:bg-cwLight/30"
                    >
                        Submit Comment
                    </button>
                </div>
            </div>
        </div>
    );
}
