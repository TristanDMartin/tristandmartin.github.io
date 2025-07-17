// Bookmark functionality with authentication
document.addEventListener('DOMContentLoaded', function() {
    console.log('Bookmark.js loaded - checking for bookmark button...');
    
    let bookmarkButton = document.getElementById('bookmarkButton');
    
    // If button doesn't exist, create it dynamically
    if (!bookmarkButton) {
        console.log('Bookmark button not found, creating dynamically...');
        bookmarkButton = createBookmarkButton();
        document.body.appendChild(bookmarkButton);
        console.log('Bookmark button created and added to DOM');
    } else {
        console.log('Bookmark button found in DOM');
    }
    
    // Get current page info
    const currentPage = {
        title: document.title,
        url: window.location.href,
        pathname: window.location.pathname
    };
    
    // Check if user is logged in
    const isLoggedIn = () => {
        return localStorage.getItem('isLoggedIn') === 'true';
    };
    
    // Check if current page is bookmarked
    const isBookmarked = () => {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        return bookmarks.some(bookmark => bookmark.url === currentPage.url);
    };
    
    // Update button appearance based on bookmark status
    const updateButtonState = () => {
        if (isBookmarked()) {
            bookmarkButton.classList.add('bookmarked');
            bookmarkButton.setAttribute('aria-label', 'Remove bookmark');
        } else {
            bookmarkButton.classList.remove('bookmarked');
            bookmarkButton.setAttribute('aria-label', 'Bookmark this page');
        }
    };
    
    // Show login modal
    const showLoginModal = () => {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };
    
    // Add bookmark
    const addBookmark = () => {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        
        // Check if already bookmarked
        if (bookmarks.some(bookmark => bookmark.url === currentPage.url)) {
            return;
        }
        
        // Add new bookmark
        bookmarks.push({
            title: currentPage.title,
            url: currentPage.url,
            pathname: currentPage.pathname,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        updateButtonState();
        
        // Show success feedback
        showBookmarkFeedback('Page bookmarked!', 'success');
    };
    
    // Remove bookmark
    const removeBookmark = () => {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const filteredBookmarks = bookmarks.filter(bookmark => bookmark.url !== currentPage.url);
        
        localStorage.setItem('bookmarks', JSON.stringify(filteredBookmarks));
        updateButtonState();
        
        // Show success feedback
        showBookmarkFeedback('Bookmark removed!', 'info');
    };
    
    // Show feedback message
    const showBookmarkFeedback = (message, type = 'success') => {
        // Remove existing feedback
        const existingFeedback = document.querySelector('.bookmark-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = `bookmark-feedback bookmark-feedback-${type}`;
        feedback.textContent = message;
        
        // Style the feedback
        feedback.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'success' ? 'rgba(102, 126, 234, 0.9)' : 'rgba(31, 40, 51, 0.9)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            backdrop-filter: blur(10px);
            border: 1px solid ${type === 'success' ? '#667eea' : '#C5C6C7'};
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        // Animate in
        setTimeout(() => {
            feedback.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            feedback.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.remove();
                }
            }, 300);
        }, 3000);
    };
    
    // Handle bookmark button click
    const handleBookmarkClick = () => {
        if (!isLoggedIn()) {
            showLoginModal();
            return;
        }
        
        if (isBookmarked()) {
            removeBookmark();
        } else {
            addBookmark();
        }
    };
    
    // Add click event listener
    bookmarkButton.addEventListener('click', handleBookmarkClick);
    
    // Initialize button state
    updateButtonState();
    
    // Listen for login/logout events
    window.addEventListener('storage', function(e) {
        if (e.key === 'userToken') {
            updateButtonState();
        }
    });
    
    // Listen for login modal close to update state
    document.addEventListener('loginSuccess', function() {
        updateButtonState();
    });
    
    console.log('Bookmark functionality initialized successfully');
});

// Function to create bookmark button dynamically
function createBookmarkButton() {
    const button = document.createElement('button');
    button.className = 'streaming-checklist-button';
    button.id = 'bookmarkButton';
    button.setAttribute('aria-label', 'Bookmark this page');
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
    `;
    return button;
}

// Add CSS for feedback animations
const style = document.createElement('style');
style.textContent = `
    @keyframes bookmarkPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    .streaming-checklist-button.bookmarked {
        animation: bookmarkPulse 0.3s ease;
    }
    
    .bookmark-feedback {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    
    body.light-mode .bookmark-feedback {
        background: rgba(255, 255, 255, 0.95) !important;
        color: #495057 !important;
        border-color: #667eea !important;
    }
`;
document.head.appendChild(style); 