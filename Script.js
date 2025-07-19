document.addEventListener('DOMContentLoaded', function() {
    // Check current page and load appropriate content
    if (document.getElementById('movies-container')) {
        loadMovies();
        setupFilters();
        setupSearch();
    } else if (document.getElementById('movie-detail-container')) {
        loadMovieDetails();
    }
});

// Load all movies from JSON
function loadMovies() {
    fetch('movies.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayMovies(data.movies);
        })
        .catch(error => {
            console.error('Error loading movies:', error);
            alert('Failed to load movies. Please try again later.');
        });
}

// Display movies in grid
function displayMovies(movies) {
    const container = document.getElementById('movies-container');
    if (!container) return;
    
    container.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.dataset.category = movie.category;
        movieCard.dataset.title = movie.title.toLowerCase();
        
        movieCard.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" loading="lazy">
            <button class="download-btn" onclick="event.stopPropagation(); downloadMovie('${movie.downloadUrl}', '${movie.title.replace(/'/g, "\\'")}')">
                Download
            </button>
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-year">${movie.year}</div>
                <div class="movie-size">${movie.size}</div>
            </div>
        `;
        
        // Add click event to view movie details
        movieCard.addEventListener('click', () => {
            window.location.href = `movie.html?id=${movie.id}`;
        });
        
        container.appendChild(movieCard);
    });
}

// Setup filter buttons
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter movies
            const filter = this.dataset.filter;
            const movies = document.querySelectorAll('.movie-card');
            
            movies.forEach(movie => {
                if (filter === 'all' || movie.dataset.category === filter) {
                    movie.style.display = 'block';
                } else {
                    movie.style.display = 'none';
                }
            });
        });
    });
}

// Setup search functionality
function setupSearch() {
    const searchBar = document.querySelector('.search-bar');
    if (!searchBar) return;
    
    searchBar.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const movies = document.querySelectorAll('.movie-card');
        
        movies.forEach(movie => {
            const title = movie.dataset.title;
            const shouldShow = title.includes(searchTerm);
            movie.style.display = shouldShow ? 'block' : 'none';
        });
    });
}

// Load movie details for detail page
function loadMovieDetails() {
    const container = document.getElementById('movie-detail-container');
    if (!container) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    
    if (!movieId) {
        window.location.href = 'index.html';
        return;
    }
    
    fetch('movies.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const movie = data.movies.find(m => m.id == movieId);
            if (movie) {
                displayMovieDetails(movie);
            } else {
                window.location.href = 'index.html';
            }
        })
        .catch(error => {
            console.error('Error loading movie details:', error);
            alert('Failed to load movie details. Please try again later.');
        });
}

// Display movie details with streaming option
function displayMovieDetails(movie) {
    const container = document.getElementById('movie-detail-container');
    const videoContainer = document.getElementById('video-container');
    const videoPlayer = document.getElementById('video-player');
    
    if (!container || !videoContainer || !videoPlayer) return;
    
    container.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" class="movie-poster-large" loading="lazy">
        <div class="movie-info-container">
            <h1 class="movie-title-large">${movie.title}</h1>
            <div class="movie-meta">
                <span>${movie.year}</span>
                <span>${movie.category}</span>
                <span>${movie.size}</span>
                <span>${movie.quality}</span>
                <span>${movie.duration}</span>
                <span>${movie.rating}</span>
            </div>
            <p class="movie-description">${movie.description || 'No description available.'}</p>
            <div class="action-buttons">
                <button class="stream-btn" onclick="streamMovie('${movie.downloadUrl}')">
                    <span>▶</span> Stream Now
                </button>
                <button class="download-btn-large" onclick="downloadMovie('${movie.downloadUrl}', '${movie.title.replace(/'/g, "\\'")}')">
                    <span>↓</span> Download
                </button>
            </div>
        </div>
    `;
}

// Stream movie function
function streamMovie(url) {
    if (!url) {
        alert('Streaming link is not available');
        return;
    }
    
    const videoContainer = document.getElementById('video-container');
    const videoPlayer = document.getElementById('video-player');
    
    if (videoContainer && videoPlayer) {
        videoPlayer.src = url;
        videoContainer.style.display = 'block';
        videoPlayer.load();
        videoPlayer.play().catch(e => console.error('Autoplay prevented:', e));
        
        // Scroll to video player
        videoContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Download movie function
function downloadMovie(url, filename) {
    if (!url || !filename) {
        alert('Download link is not available');
        return;
    }
    
    try {
        // Create temporary anchor element
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace(/[^a-z0-9]/gi, '_') + '.mp4'; // Sanitize filename
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Fallback if download doesn't start
        setTimeout(() => {
            window.open(url, '_blank');
        }, 300);
    } catch (error) {
        console.error('Download error:', error);
        alert('Failed to start download. Please try again.');
    }
}