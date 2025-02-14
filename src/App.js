import React, { useState } from 'react';
import MoviesList from './components/MoviesList';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [retryTimeout, setRetryTimeout] = useState(null);

  async function fetchMoviesHandler() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://swapi.dev/api/film/');
      if (!response.ok) {
        throw new Error('Something went wrong...Retrying');
      }
      const data = await response.json();
      const transformedMovies = data.results.map((movieData) => {
        return {
          id: movieData.episode_id,
          title: movieData.title,
          openingText: movieData.opening_crawl,
          releaseDate: movieData.release_date,
        };
      });
      setMovies(transformedMovies);
      setRetrying(false); // Stop retrying once it succeeds
    } catch (error) {
      setError(error.message);
      if (retrying) {
        const timeout = setTimeout(fetchMoviesHandler, 5000); // Retry after 5 seconds
        setRetryTimeout(timeout);
      }
    }
    setIsLoading(false);
  }

  function startRetrying() {
    setRetrying(true);
    fetchMoviesHandler();
  }

  function stopRetrying() {
    setRetrying(false);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
    }
  }

  let content = <p>Found no movies.</p>;

  if (error) {
    content = <p>{error}</p>;
  }

  if (isLoading) {
    content = <p>Loading...</p>;
  }

  if (!isLoading && movies.length > 0) {
    content = <MoviesList movies={movies} />;
  }

  return (
    <React.Fragment>
      <section>
        <button onClick={startRetrying}>Fetch Movies</button>
        {retrying && <button onClick={stopRetrying}>Cancel Retry</button>}
      </section>
      <section>{content}</section>
    </React.Fragment>
  );
}

export default App;
