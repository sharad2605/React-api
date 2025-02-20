import React, { useState, useEffect, useCallback } from 'react';
import MoviesList from './components/MoviesList';
import './App.css';
import AddMovie from './components/AddMovie';

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [retryTimeout, setRetryTimeout] = useState(null);

 const fetchMoviesHandler =useCallback (async ()=> {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://react-http-2ca06-default-rtdb.firebaseio.com/movies.json');
      if (!response.ok) {
        throw new Error('Something went wrong...Retrying');
      }
      const data = await response.json();
      console.log(data);

      const loadedMovies = [];
      for(const key in data) {
        loadedMovies.push({
          id: key,
          title: data[key].title,
          openingText: data[key].openingText,
          releaseDate: data[key].releaseDate,
        });
      }
      setMovies(loadedMovies);
      setRetrying(false); // Stop retrying once it succeeds
    } catch (error) {
      setError(error.message);
      if (retrying) {
        const timeout = setTimeout(fetchMoviesHandler, 5000); // Retry after 5 seconds
        setRetryTimeout(timeout);
      }
    }
    setIsLoading(false);
  }, [retrying]);

  useEffect(() => {
    fetchMoviesHandler();
  }, [fetchMoviesHandler]);

  async function addMovieHandler(movie) {
    const response = await fetch('https://react-http-2ca06-default-rtdb.firebaseio.com/movies.json', {
      method: 'POST',
      body: JSON.stringify(movie),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data);

  }

  async function deleteMovieHandler(movieId) {
    try {
      const response = await fetch(`https://react-http-2ca06-default-rtdb.firebaseio.com/movies/${movieId}.json`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete the movie.');
      }
      setMovies((prevMovies) => prevMovies.filter(movie => movie.id !== movieId));
    } catch (error) {
      setError(error.message);
    }
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
    content = <MoviesList movies={movies} onDeleteMovie={deleteMovieHandler} />;
  }

  return (
    <React.Fragment>
      <section>
        <AddMovie   onAddMovie={addMovieHandler}/>
        </section>
        <section>
        <button onClick={startRetrying}>Fetch Movies</button>
        {retrying && <button onClick={stopRetrying}>Cancel Retry</button>}
      </section>
      <section>{content}</section>
    </React.Fragment>
  );
}

export default App;
