import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "690fffe6";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [watched, setWatched] = useLocalStorageState([], "watched");
  const { movies, isLoading, isError } = useMovies(query);

  function handleSelectedId(id) {
    selectedId === id ? setSelectedId(null) : setSelectedId(id);
  }
  function handleback() {
    setSelectedId(null);
  }
  function onWatched(newMovie) {
    setWatched((watched) => [...watched, newMovie]);
  }
  function handleRemove(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <Nav movies={movies}>
        <Search query={query} setQuery={setQuery} />
        <Numresults movies={movies} />
      </Nav>
      <Main>
        <Box>
          {isLoading && <Load />}
          {!isLoading && !isError && (
            <MovieList movies={movies} onSelectedId={handleSelectedId} />
          )}
          {isError && <ErorMessage message={isError} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              watched={watched}
              selectedId={selectedId}
              handleback={handleback}
              onWatched={onWatched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                handleRemove={handleRemove}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function ErorMessage({ message }) {
  return <span className="error">⛔ {message}</span>;
}
function Load() {
  return <p className="loader loaderr"></p>;
}
function Main({ children }) {
  return (
    <>
      <main className="main">{children}</main>
    </>
  );
}
function Box({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);
  return (
    <>
      <div className="box">
        <button
          className="btn-toggle"
          onClick={() => setIsOpen1((open) => !open)}
        >
          {isOpen1 ? "–" : "+"}
        </button>
        {isOpen1 && children}
      </div>
    </>
  );
}
function MovieList({ movies, onSelectedId }) {
  return (
    <>
      <ul className="list list-movies">
        {movies?.map((movie) => (
          <Movie movie={movie} key={movie.imdbID} onSelectedId={onSelectedId} />
        ))}
      </ul>
    </>
  );
}
function Movie({ movie, onSelectedId }) {
  return (
    <>
      <li onClick={() => onSelectedId(movie.imdbID)} className="movies-li">
        <img src={movie.Poster} alt={`${movie.Title} poster`} />
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>🗓</span>
            <span>{movie.Year}</span>
          </p>
        </div>
      </li>
    </>
  );
}
function MovieDetails({ selectedId, handleback, onWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setRatingUser] = useState("");
  const countRef = useRef(0);
  useKey("Escape", handleback);
  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );

  const userRatingValue = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  console.log(title, year);
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  function handleWatchedMovie() {
    const newMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countingRating: countRef,
    };
    onWatched(newMovie);
    handleback();
  }
  console.log(userRating);
  return (
    <div className="details">
      {isLoading ? (
        <Load />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={() => handleback()}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull;{runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} imdb Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {watched.map((movie) => movie.imdbID).includes(selectedId) ? (
                <p>You rated this movie with {userRatingValue} ⭐ </p>
              ) : (
                <>
                  <StarRating
                    size={24}
                    maxRating={10}
                    onSetRating={setRatingUser}
                  />

                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleWatchedMovie}>
                      + Add new movie
                    </button>
                  )}
                </>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Nav({ children }) {
  return (
    <>
      <nav className="nav-bar">
        <Logo />
        {children}
      </nav>
    </>
  );
}
function Logo() {
  return (
    <>
      {" "}
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
    </>
  );
}
function Search({ query, setQuery }) {
  const inputEl = useRef(null);
  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <>
      {" "}
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
      />
    </>
  );
}
function Numresults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <>
      {" "}
      <div className="summary">
        <h2>Movies you watched</h2>
        <div>
          <p>
            <span>#️⃣</span>
            <span>{watched.length} movies</span>
          </p>
          <p>
            <span>⭐️</span>
            <span>{avgImdbRating.toFixed(2)}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{avgUserRating.toFixed(2)}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{avgRuntime} min</span>
          </p>
        </div>
      </div>
    </>
  );
}
function WatchedMoviesList({ watched, handleRemove }) {
  return (
    <>
      <ul className="list">
        {watched.map((movie) => (
          <WatchedMovie
            movie={movie}
            key={movie.imdbID}
            handleRemove={handleRemove}
          />
        ))}
      </ul>
    </>
  );
}
function WatchedMovie({ movie, handleRemove }) {
  return (
    <>
      <li>
        <img src={movie.poster} alt={`${movie.title} poster`} />
        <h3>{movie.title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
          <button
            className="btn-delete"
            onClick={() => handleRemove(movie.imdbID)}
          >
            X
          </button>
        </div>
      </li>
    </>
  );
}
