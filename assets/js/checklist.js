const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.querySelector('.sidebar-toggle');

// Toggle sidebar
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

// Bookmark functionality
const checklistButton = document.getElementById('bookmarkButton');
let isBookmarked = false;

// Create toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Get current page metadata
function getPageMetadata() {
    return {
        url: window.location.pathname,
        title: document.title,
        timestamp: new Date().toISOString()
    };
}

// Check if page is already bookmarked
function checkBookmarkStatus() {
    const bookmarkedPages = JSON.parse(localStorage.getItem('bookmarkedPages') || '[]');
    const currentPage = window.location.pathname;
    isBookmarked = bookmarkedPages.some(page => page.url === currentPage);
    updateChecklistButton();
}

// Update button appearance
function updateChecklistButton() {
    if (isBookmarked) {
        checklistButton.classList.add('active');
        checklistButton.setAttribute('aria-label', 'Remove from bookmarks');
    } else {
        checklistButton.classList.remove('active');
        checklistButton.setAttribute('aria-label', 'Add to bookmarks');
    }
}

// Toggle bookmark
function toggleBookmark() {
    const bookmarkedPages = JSON.parse(localStorage.getItem('bookmarkedPages') || '[]');
    const currentPage = getPageMetadata();

    if (isBookmarked) {
        const index = bookmarkedPages.findIndex(page => page.url === currentPage.url);
        if (index > -1) {
            bookmarkedPages.splice(index, 1);
            showToast('Removed from bookmarks');
        }
    } else {
        bookmarkedPages.push(currentPage);
        showToast('Saved to bookmarks');
    }

    localStorage.setItem('bookmarkedPages', JSON.stringify(bookmarkedPages));
    isBookmarked = !isBookmarked;
    updateChecklistButton();
}

// Handle checklist button click
checklistButton.addEventListener('click', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn) {
        // Show login modal if user is not logged in
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.classList.add('active');
        // Store the bookmark intent
        localStorage.setItem('pendingBookmark', 'true');
    } else {
        toggleBookmark();
    }
});

// Check bookmark status on page load
checkBookmarkStatus();

// Handle successful login
const loginForm = document.querySelector('.login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Your login logic here
        localStorage.setItem('isLoggedIn', 'true');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.classList.remove('active');

        // Check if there was a pending bookmark
        if (localStorage.getItem('pendingBookmark') === 'true') {
            toggleBookmark();
            localStorage.removeItem('pendingBookmark');
        }
    });
}

// Add toast styles
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%) translateY(100%);
        background: #45A29E;
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1100;
        opacity: 0;
        transition: all 0.3s ease;
        font-family: 'Nunito', sans-serif;
        font-weight: 600;
        min-width: 200px;
        text-align: center;
    }
    .toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
    .toast.error {
        background: #ef4444;
    }
    .toast.success {
        background: #45A29E;
    }
`;
document.head.appendChild(style); 