import { Movie, User, Rating } from './types';
import { sampleMovies } from './data/sampleMovies';

const KEYS = {
  movies: 'cinestream_movies',
  users: 'cinestream_users',
  currentUser: 'cinestream_current_user',
  watchlist: 'cinestream_watchlist',
  ratings: 'cinestream_ratings',
};

function init() {
  if (!localStorage.getItem(KEYS.movies)) {
    localStorage.setItem(KEYS.movies, JSON.stringify(sampleMovies));
  }
  if (!localStorage.getItem(KEYS.users)) {
    localStorage.setItem(KEYS.users, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.watchlist)) {
    localStorage.setItem(KEYS.watchlist, JSON.stringify({}));
  }
  if (!localStorage.getItem(KEYS.ratings)) {
    localStorage.setItem(KEYS.ratings, JSON.stringify([]));
  }
}

init();

export function getMovies(): Movie[] {
  const raw = localStorage.getItem(KEYS.movies);
  return raw ? JSON.parse(raw) : [];
}

export function saveMovies(movies: Movie[]) {
  localStorage.setItem(KEYS.movies, JSON.stringify(movies));
}

export function getUsers(): User[] {
  const raw = localStorage.getItem(KEYS.users);
  return raw ? JSON.parse(raw) : [];
}

export function saveUsers(users: User[]) {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(KEYS.currentUser);
  return raw ? JSON.parse(raw) : null;
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.currentUser);
  }
}

export function getWatchlist(): Record<string, string[]> {
  const raw = localStorage.getItem(KEYS.watchlist);
  return raw ? JSON.parse(raw) : {};
}

export function saveWatchlist(watchlist: Record<string, string[]>) {
  localStorage.setItem(KEYS.watchlist, JSON.stringify(watchlist));
}

export function getUserWatchlist(userId: string): string[] {
  const all = getWatchlist();
  return all[userId] || [];
}

export function toggleWatchlistItem(userId: string, movieId: string): string[] {
  const all = getWatchlist();
  const list = all[userId] || [];
  const idx = list.indexOf(movieId);
  if (idx > -1) {
    list.splice(idx, 1);
  } else {
    list.push(movieId);
  }
  all[userId] = list;
  saveWatchlist(all);
  return list;
}

export function getRatings(): Rating[] {
  const raw = localStorage.getItem(KEYS.ratings);
  return raw ? JSON.parse(raw) : [];
}

export function saveRatings(ratings: Rating[]) {
  localStorage.setItem(KEYS.ratings, JSON.stringify(ratings));
}

export function setUserRating(userId: string, movieId: string, rating: number) {
  const ratings = getRatings();
  const idx = ratings.findIndex((r) => r.userId === userId && r.movieId === movieId);
  if (idx > -1) {
    ratings[idx].rating = rating;
  } else {
    ratings.push({ userId, movieId, rating });
  }
  saveRatings(ratings);
}

export function getUserRating(userId: string, movieId: string): number {
  const ratings = getRatings();
  const found = ratings.find((r) => r.userId === userId && r.movieId === movieId);
  return found ? found.rating : 0;
}

export function incrementViews(movieId: string) {
  const movies = getMovies();
  const idx = movies.findIndex((m) => m.id === movieId);
  if (idx > -1) {
    movies[idx].views += 1;
    saveMovies(movies);
  }
}
