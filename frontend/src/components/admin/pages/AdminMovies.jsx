import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/movies")
      .then(res => setMovies(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container mt-4">
      <h2>🎬 Quản lý Phim (Admin)</h2>
      <ul>
        {movies.map(movie => (
          <li key={movie.id}>{movie.title}</li>
        ))}
      </ul>
    </div>
  );
}