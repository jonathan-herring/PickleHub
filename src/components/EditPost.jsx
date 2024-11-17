import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
    } else {
      setTitle(data.title);
      setContent(data.content || "");
      setImageUrl(data.image_url || "");
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required.");
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .update({ title, content, image_url: imageUrl, updated_at: new Date() })
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error updating post:", error);
    } else {
      navigate(`/posts/${id}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title*</label>
          <input
            type="text"
            className="w-full border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Content</label>
          <textarea
            className="w-full border p-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium">Image URL</label>
          <input
            type="url"
            className="w-full border p-2"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Update Post
        </button>
      </form>
    </div>
  );
};

export default EditPost;
