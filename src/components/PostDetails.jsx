import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate, Link } from "react-router-dom";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [error, setError] = useState(null);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setPost(data);
    } catch (err) {
      console.error("Error fetching post:", err.message);
      setError("Failed to load the post. Please try again.");
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err.message);
      setError("Failed to load comments. Please try again.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchPost();
      await fetchComments();
      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  const handleUpvote = async () => {
    if (!post || isUpvoting) return; // Ensure post is loaded and not already upvoting

    setIsUpvoting(true); // Prevent multiple upvotes at the same time

    try {
      // Optimistically update the UI
      setPost((prevPost) => ({
        ...prevPost,
        upvotes: prevPost.upvotes + 1,
      }));

      // Perform the atomic increment using Supabase's increment method
      const { error } = await supabase.rpc("increment_upvotes", {
        row_id: id,
      });

      if (error) {
        throw error; // Handle the error in the catch block
      }

      // Optionally refetch the post to ensure data consistency
      await fetchPost();
    } catch (err) {
      console.error("Error upvoting:", err.message);
      alert("Failed to upvote. Please try again.");

      // Revert the optimistic update
      setPost((prevPost) => ({
        ...prevPost,
        upvotes: prevPost.upvotes - 1,
      }));
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([{ post_id: id, content: newComment }]);

      if (error) throw error;

      // Refetch comments to ensure the latest ones are displayed
      await fetchComments();

      setNewComment(""); // Clear the input field
    } catch (err) {
      console.error("Error adding comment:", err.message);
      setError("Failed to add comment. Please try again.");
    }
  };

  const handleDeletePost = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) throw error;

      navigate("/");
    } catch (err) {
      console.error("Error deleting post:", err.message);
      setError("Failed to delete the post. Please try again.");
    }
  };

  const handleEditPost = () => {
    navigate(`/edit/${id}`);
  };

  if (isLoading) return <div className="p-4">Loading...</div>;

  if (error)
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
        <button onClick={() => setError(null)} className="mt-2 underline">
          Dismiss
        </button>
      </div>
    );

  if (!post) return <div className="p-4">Post not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{post.title}</h2>
        <div>
          <button
            onClick={handleEditPost}
            className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
          >
            Edit
          </button>
          <button
            onClick={handleDeletePost}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-500 mb-2">
        Created at: {new Date(post.created_at).toLocaleString()}
      </div>
      <div className="mb-4">
        {post.content && <p className="mb-2">{post.content}</p>}
        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="max-w-full h-auto"
          />
        )}
      </div>
      <div className="flex items-center mb-4">
        <button
          onClick={handleUpvote}
          disabled={isUpvoting}
          className={`bg-blue-500 text-white px-3 py-1 rounded mr-2 ${
            isUpvoting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isUpvoting ? "Upvoting..." : "Upvote"}
        </button>
        <span>Upvotes: {post.upvotes}</span>
      </div>
      <hr />
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Comments</h3>
        <form onSubmit={handleAddComment} className="mb-4">
          <textarea
            className="w-full border p-2"
            rows="3"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded mt-2"
          >
            Submit
          </button>
        </form>
        <ul>
          {comments.map((comment) => (
            <li key={comment.id} className="border p-2 mb-2 rounded">
              {comment.content}
              <div className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PostDetails;
