import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import debounce from "lodash.debounce";

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [search, setSearch] = useState("");

  const fetchPosts = async () => {
    let query = supabase.from("posts").select("*");

    if (search.trim()) {
      query = query.ilike("title", `%${search}%`);
    }

    query = query.order(sortBy, { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data);
    }
  };

  const debouncedSearch = debounce((value) => {
    setSearch(value);
  }, 300);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    fetchPosts();
    return () => {
      debouncedSearch.cancel();
    };
  }, [sortBy, search]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Feed</h2>
        <Link
          to="/create"
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Create Post
        </Link>
      </div>
      <div className="flex justify-between mb-4">
        <div>
          <label className="mr-2">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-1"
          >
            <option value="created_at">Created Time</option>
            <option value="upvotes">Upvotes</option>
          </select>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search by title..."
            className="border p-1"
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <ul>
        {posts.map((post) => (
          <li
            key={post.id}
            className="border p-4 mb-2 rounded hover:bg-gray-50"
          >
            <Link to={`/posts/${post.id}`}>
              <h3 className="text-xl font-semibold">{post.title}</h3>
            </Link>
            <div className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleString()} | Upvotes:{" "}
              {post.upvotes}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostFeed;
