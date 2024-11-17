import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PostFeed from "./components/PostFeed";
import CreatePost from "./components/CreatePost";
import PostDetails from "./components/PostDetails";
import EditPost from "./components/EditPost";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PostFeed />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/posts/:id" element={<PostDetails />} />
        <Route path="/edit/:id" element={<EditPost />} />
      </Routes>
    </Router>
  );
}

export default App;
