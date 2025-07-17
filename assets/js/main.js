// Auth state management
const authButtons = document.querySelector('.auth-button');
const profileButton = document.querySelector('.profile-button');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');

// Modal functionality
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Open modals from header buttons
document.querySelector('.auth-button.login')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(loginModal);
});

document.querySelector('.auth-button.signup')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(signupModal);
});

// Close modals
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal(btn.closest('.modal-overlay'));
    });
});

// Close modals when clicking outside
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
});

// Switch between login and signup
document.querySelector('.switch-to-signup')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(signupModal);
});

document.querySelector('.switch-to-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(signupModal);
    openModal(loginModal);
});

// Handle login form submission
document.querySelector('.login-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Here you would typically make an API call to your backend
    // For demo purposes, we'll just simulate a successful login
    const user = {
        email: email,
        name: email.split('@')[0] // Just for demo
    };
    
    // Store auth state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update UI
    checkAuthState();
    
    // Close modal
    closeModal(loginModal);

    // Dispatch login success event for bookmark functionality
    document.dispatchEvent(new CustomEvent('loginSuccess'));

    // Check if there was a pending bookmark
    if (localStorage.getItem('pendingBookmark') === 'true') {
        toggleBookmark();
        localStorage.removeItem('pendingBookmark');
    }
});

// Handle signup form submission
document.querySelector('.signup-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Basic validation
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Here you would typically make an API call to your backend
    // For demo purposes, we'll just simulate a successful signup
    const user = {
        username: username,
        email: email
    };
    
    // Store auth state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update UI
    checkAuthState();
    
    // Close modal
    closeModal(signupModal);

    // Dispatch login success event for bookmark functionality
    document.dispatchEvent(new CustomEvent('loginSuccess'));
});

// Handle social auth buttons
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Here you would implement OAuth login/signup
        alert('Social authentication would be implemented here');
    });
});

// Check if user is logged in
function checkAuthState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const logoutButton = document.querySelector('.logout');
    
    if (isLoggedIn && user) {
        // Hide auth buttons and show profile
        document.querySelectorAll('.auth-button').forEach(btn => btn.style.display = 'none');
        profileButton.style.display = 'flex';
        // Show logout button
        if (logoutButton) {
            logoutButton.style.display = 'block';
        }
    } else {
        // Show auth buttons and hide profile
        document.querySelectorAll('.auth-button').forEach(btn => btn.style.display = 'block');
        profileButton.style.display = 'none';
        // Hide logout button
        if (logoutButton) {
            logoutButton.style.display = 'none';
        }
    }
}

// Handle logout
document.querySelector('.logout')?.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Clear auth state
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    
    // Update UI
    checkAuthState();
    
    // Close settings menu
    settingsMenu.style.display = 'none';
});

// Initialize auth state
checkAuthState();

// DOM Elements
const searchInput = document.querySelector('.search-input');
const searchResults = document.querySelector('.search-results');
const sidebar = document.querySelector('.sidebar');
const settingsTrigger = document.querySelector('.settings-trigger');
const settingsMenu = document.querySelector('.settings-menu');

// Search data
const searchData = [
    { title: 'Home', description: 'Welcome to Streamer Tips - Your Ultimate Streaming Resource', url: 'index.html' },
    { title: 'Creator Tools', description: 'Access thousands of sound effects and memes to engage your audience', url: 'creator-tools.html' },
    { title: 'Streamer Academy', description: 'Learn how to stream, grow, and succeed', url: 'streamer-academy.html' },
    { title: 'Featured Guides', description: 'Essential tips and tricks to help you grow your stream', url: 'featured-guides.html' },
    { title: 'New Streamer Guide', description: 'Start your streaming journey with our comprehensive guide', url: 'new-streamer.html' },
    { title: 'Overlays', description: 'Find and customize stream overlays for your channel', url: 'overlays.html' },
    { title: 'Growth Tactics', description: 'Advanced strategies to grow your streaming channel', url: 'growth-tactics.html' },
    { title: 'Stream Alerts', description: 'Set up and customize your stream alerts', url: 'alerts.html' },
    { title: 'Account Settings', description: 'Manage your account preferences and settings', url: 'account.html' },
    { title: 'Streamlabs Setup', description: 'Learn how to set up Streamlabs for your stream', url: 'creator-tools.html#streamlabs' },
    { title: 'OBS Studio Guide', description: 'Complete guide to using OBS Studio for streaming', url: 'creator-tools.html#obs' },
    { title: 'Streaming Equipment', description: 'Essential equipment guide for streamers', url: 'peripherals.html' },
    { title: 'Lighting Setup', description: 'Professional lighting setup guide for streamers', url: 'lighting-equipment.html' },
    { title: 'Camera Setup', description: 'Camera setup and optimization guide', url: 'camera-gear.html' },
    { title: 'Alert Connections', description: 'Connect and configure stream alerts', url: 'alert-connections.html' },
    { title: 'Stream Music', description: 'Copyright-safe music for your stream', url: 'music.html' }
];

// Search functionality
if (searchInput && searchResults) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length > 0) {
            const filteredResults = searchData.filter(item =>
                item.title.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );

            if (filteredResults.length > 0) {
                searchResults.innerHTML = filteredResults.map(item => `
                    <a href="${item.url}" class="search-result-item">
                        <h4>${item.title}</h4>
                        <p>${item.description}</p>
                    </a>
                `).join('');
                searchResults.classList.add('active');
            } else {
                searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
                searchResults.classList.add('active');
            }
        } else {
            searchResults.classList.remove('active');
        }
    });
}

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    const searchResults = document.querySelector('.search-results');
    if (searchResults && !e.target.closest('.search-container')) {
        searchResults.classList.remove('active');
    }
});





// Toggle additional tools visibility
function toggleAdditionalTools(button) {
    const toolCategory = button.closest('.tool-category');
    const additionalTools = toolCategory.querySelector('.additional-tools');
    const isHidden = additionalTools.style.display === 'none';
    
    additionalTools.style.display = isHidden ? 'block' : 'none';
    button.textContent = isHidden ? 'Show Less' : 'Learn More';
    
    // Smooth scroll to the additional tools if showing
    if (isHidden) {
        additionalTools.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Toast notification functionality
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
    const checklistButton = document.getElementById('bookmarkButton');
    if (!checklistButton) return;
    
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
            showToast('Removed from bookmarks', 'success');
        }
    } else {
        bookmarkedPages.push(currentPage);
        showToast('Saved to bookmarks', 'success');
    }

    localStorage.setItem('bookmarkedPages', JSON.stringify(bookmarkedPages));
    isBookmarked = !isBookmarked;
    updateChecklistButton();
}

// Initialize bookmark functionality
let isBookmarked = false;
const checklistButton = document.getElementById('bookmarkButton');

if (checklistButton) {
    // Handle checklist button click
    checklistButton.addEventListener('click', () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (!isLoggedIn) {
            // Show login modal if user is not logged in
            openModal(loginModal);
            // Store the bookmark intent
            localStorage.setItem('pendingBookmark', 'true');
            showToast('Please log in to bookmark pages', 'error');
        } else {
            toggleBookmark();
        }
    });

    // Check bookmark status on page load
    checkBookmarkStatus();
}

// Add toast styles
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    .toast {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%) translateY(100%);
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1100;
        opacity: 0;
        transition: all 0.3s ease;
        font-family: 'Nunito', sans-serif;
        font-weight: 600;
    }

    .toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }

    .toast.error {
        background: #ef4444;
    }

    .toast.success {
        background: #10B981;
    }
`;
document.head.appendChild(toastStyle);

// Add scroll progress indicator
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (window.scrollY / windowHeight) * 100;
    progressBar.style.transform = `scaleX(${progress / 100})`;
});

// Add smooth scroll to anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Add intersection observer for fade-in animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.guide-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease-out';
    observer.observe(section);
});

// Progress tracking functionality
function initializeProgressTracking() {
    const progressItems = document.querySelectorAll('.progress-list li');
    const guideCards = document.querySelectorAll('.guide-card');
    const backToTop = document.querySelector('.back-to-top');

    console.log('Progress tracking initialization:', {
        progressItems: progressItems.length,
        guideCards: guideCards.length,
        progressItemIds: Array.from(progressItems).map(item => item.dataset.section),
        guideCardIds: Array.from(guideCards).map(card => card.id)
    });

    if (!progressItems.length || !guideCards.length) {
        console.log('Progress tracking: Missing elements');
        return;
    }

    // Track which sections have been viewed
    const viewedSections = new Set();
    let currentActiveSection = null;

    // Function to check which section is currently in view
    function checkCurrentSection() {
        const scrollPosition = window.scrollY + window.innerHeight / 2; // Check middle of viewport
        let newActiveSection = null;

        guideCards.forEach(card => {
            const cardTop = card.offsetTop;
            const cardBottom = cardTop + card.offsetHeight;
            
            if (scrollPosition >= cardTop && scrollPosition <= cardBottom) {
                newActiveSection = card.id;
                if (!viewedSections.has(card.id)) {
                    viewedSections.add(card.id);
                    console.log('Marked section as viewed:', card.id);
                }
            }
        });

        // Update active section
        if (newActiveSection !== currentActiveSection) {
            currentActiveSection = newActiveSection;
            console.log('Active section changed to:', currentActiveSection);
            
            // Update progress items and guide cards
            progressItems.forEach(item => {
                item.classList.remove('active');
                if (item.dataset.section === currentActiveSection) {
                    item.classList.add('active');
                    console.log('Set active progress item:', item.dataset.section);
                }
                if (viewedSections.has(item.dataset.section)) {
                    item.classList.add('completed');
                }
            });

            // Update guide cards
            guideCards.forEach(card => {
                card.classList.remove('active');
                if (card.id === currentActiveSection) {
                    card.classList.add('active');
                    console.log('Set active guide card:', card.id);
                }
            });
            
            // Update progress percentage
            updateProgressPercentage();
        }
    }

    // Progress list click navigation with smooth scrolling
    progressItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            const section = document.getElementById(sectionId);
            
            if (section) {
                // Remove active class from all progress items
                progressItems.forEach(pi => pi.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                // Smooth scroll to section with offset for header
                const headerHeight = document.querySelector('header').offsetHeight;
                const sectionTop = section.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: sectionTop,
                    behavior: 'smooth'
                });
                
                // Mark as completed
                item.classList.add('completed');
                viewedSections.add(sectionId);
                
                // Update progress percentage
                updateProgressPercentage();
            }
        });
    });

    // Add scroll event listener for real-time tracking
    window.addEventListener('scroll', () => {
        console.log('Scroll event detected'); // Debug log
        // Throttle the scroll event for better performance
        if (!window.scrollTimeout) {
            window.scrollTimeout = setTimeout(() => {
                console.log('Executing checkCurrentSection from scroll...'); // Debug log
                checkCurrentSection();
                window.scrollTimeout = null;
            }, 100); // Check every 100ms
        }
    });

    // Also check on page load and resize
    window.addEventListener('load', checkCurrentSection);
    window.addEventListener('resize', checkCurrentSection);

    // Update progress percentage
    function updateProgressPercentage() {
        const totalSections = progressItems.length;
        const completedSections = viewedSections.size;
        const percentage = Math.round((completedSections / totalSections) * 100);
        
        console.log('Updating progress:', {
            totalSections,
            completedSections,
            percentage,
            viewedSections: Array.from(viewedSections)
        });
        
        // Update progress bar if it exists
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            console.log('Updated progress bar width to:', percentage + '%');
        } else {
            console.log('Progress bar element not found');
        }
        
        // Update progress text if it exists
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${completedSections}/${totalSections} sections completed`;
            console.log('Updated progress text to:', progressText.textContent);
        } else {
            console.log('Progress text element not found');
        }
        
        // Update progress indicator if it exists
        const progressIndicator = document.querySelector('.progress-indicator');
        if (progressIndicator) {
            progressIndicator.textContent = `${percentage}%`;
            console.log('Updated progress indicator to:', percentage + '%');
        } else {
            console.log('Progress indicator element not found');
        }
        
        // Force a repaint to ensure the progress bar updates visually
        if (progressBar) {
            progressBar.offsetHeight; // Trigger reflow
        }
    }

    // Back to top button functionality
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Initialize progress on page load
    updateProgressPercentage();
    
    // Initial check after a short delay to ensure DOM is ready
    setTimeout(checkCurrentSection, 500);
    
    // Test manual progress update
    setTimeout(() => {
        console.log('Testing manual progress update...');
        viewedSections.add('brand');
        viewedSections.add('overlay');
        updateProgressPercentage();
        console.log('Manual progress update completed');
    }, 1000);
}

// Bookmark functionality
function initializeBookmarkButton() {
    const bookmarkButton = document.getElementById('bookmarkButton');
    if (!bookmarkButton) return;

    // Save page as bookmarked
    function saveBookmarkedPage() {
        if (!isUserLoggedIn()) {
            // Show login modal with a message
            const loginForm = document.querySelector('.login-form');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'auth-message';
            messageDiv.innerHTML = '<p>Please log in or sign up to bookmark pages and track your progress.</p>';
            
            // Remove any existing message
            const existingMessage = loginForm.querySelector('.auth-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            // Add the message at the top of the form
            loginForm.insertBefore(messageDiv, loginForm.firstChild);
            
            // Show login modal
            openModal(loginModal);
            return;
        }

        const currentPage = {
            title: document.title,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };
        
        // Get existing bookmarks
        let bookmarks = JSON.parse(localStorage.getItem('bookmarkedPages') || '[]');
        
        // Check if page is already bookmarked
        const existingIndex = bookmarks.findIndex(bookmark => bookmark.url === currentPage.url);
        
        // Create or get tooltip
        let tooltip = document.querySelector('.tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            document.body.appendChild(tooltip);
        }
        
        if (existingIndex === -1) {
            // Add new bookmark
            bookmarks.push(currentPage);
            localStorage.setItem('bookmarkedPages', JSON.stringify(bookmarks));
            
            // Update button appearance
            bookmarkButton.classList.add('bookmarked');
            bookmarkButton.setAttribute('title', 'Page Bookmarked');

            // Show success tooltip
            tooltip.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Saved to bookmarks
            `;
        } else {
            // Remove bookmark
            bookmarks.splice(existingIndex, 1);
            localStorage.setItem('bookmarkedPages', JSON.stringify(bookmarks));
            
            // Update button appearance
            bookmarkButton.classList.remove('bookmarked');
            bookmarkButton.setAttribute('title', 'Bookmark Page');

            // Show removed tooltip
            tooltip.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Removed from bookmarks
            `;
        }

        // Show tooltip
        tooltip.classList.add('show');

        // Hide tooltip after 2 seconds
        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 2000);
    }

    // Check if page is bookmarked on load
    function checkIfPageIsBookmarked() {
        if (!isUserLoggedIn()) return;
        
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedPages') || '[]');
        const isBookmarked = bookmarks.some(bookmark => bookmark.url === window.location.href);
        
        if (isBookmarked) {
            bookmarkButton.classList.add('bookmarked');
            bookmarkButton.setAttribute('title', 'Page Bookmarked');
        } else {
            bookmarkButton.classList.remove('bookmarked');
            bookmarkButton.setAttribute('title', 'Bookmark Page');
        }
    }

    // Toggle bookmark
    bookmarkButton.addEventListener('click', saveBookmarkedPage);

    // Check bookmark status on page load
    checkIfPageIsBookmarked();
}



// Toggle profile menu
function toggleProfileMenu() {
    const menu = document.querySelector('.profile-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// Close profile menu when clicking outside
document.addEventListener('click', (event) => {
    const profileButton = document.querySelector('.profile-button');
    const profileMenu = document.querySelector('.profile-menu');
    if (profileButton && profileMenu && !profileButton.contains(event.target) && !profileMenu.contains(event.target)) {
        profileMenu.classList.remove('active');
    }
}); 

function updateUserStatus() {
    const userStatus = document.getElementById('user-status');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (userStatus) {
        if (isLoggedIn && user) {
            if (user.username) {
                userStatus.textContent = `You are signed in as: @${user.username}`;
            } else if (user.email) {
                userStatus.textContent = `You are signed in as: ${user.email}`;
            } else {
                userStatus.textContent = '';
            }
        } else {
            userStatus.textContent = '';
        }
    }
}

// Global Authentication State Management
function checkAuthState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const logoutButton = document.querySelector('.logout');
    const authButtons = document.querySelectorAll('.auth-button');
    const profileButton = document.querySelector('.profile-button');
    
    if (isLoggedIn && user) {
        // User is logged in - show logout, hide auth buttons, show profile
        if (logoutButton) logoutButton.style.display = 'block';
        authButtons.forEach(btn => btn.style.display = 'none');
        if (profileButton) profileButton.style.display = 'flex';
    } else {
        // User is not logged in - hide logout, show auth buttons, hide profile
        if (logoutButton) logoutButton.style.display = 'none';
        authButtons.forEach(btn => btn.style.display = 'block');
        if (profileButton) profileButton.style.display = 'none';
    }
    updateUserStatus();
}

// Global Theme Management
function setTheme(mode) {
  if (mode === 'light') {
    document.body.classList.add('light-mode');
    updateThemeToggleText('light');
  } else {
    document.body.classList.remove('light-mode');
    updateThemeToggleText('dark');
  }
  localStorage.setItem('theme', mode);
}

function updateThemeToggleText(mode) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const newText = mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
        themeToggle.textContent = newText;
    }
}

function loadTheme() {
  const saved = localStorage.getItem('theme');
  setTheme(saved === 'light' ? 'light' : 'dark');
}

function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        // Remove any existing event listeners
        themeToggle.removeEventListener('click', handleThemeToggle);
        
        // Add new event listener
        themeToggle.addEventListener('click', handleThemeToggle);
        
        // Set correct text on load based on current theme
        const currentTheme = localStorage.getItem('theme') || 'dark';
        updateThemeToggleText(currentTheme);
    }
}

function handleThemeToggle() {
    const isLight = document.body.classList.contains('light-mode');
    const newTheme = isLight ? 'dark' : 'light';
    setTheme(newTheme);
}

// Global function for inline onclick
function toggleTheme() {
    const isLight = document.body.classList.contains('light-mode');
    const newTheme = isLight ? 'dark' : 'light';
    setTheme(newTheme);
}

// Global Logout Handler
function initializeLogoutHandler() {
    const logoutButton = document.querySelector('.logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
            checkAuthState();
            
            // Close settings menu if it exists
            const settingsMenu = document.querySelector('.settings-menu');
            if (settingsMenu) settingsMenu.style.display = 'none';
        });
    }
}

// Global Settings Menu Handler
function initializeSettingsMenu() {
    const settingsTrigger = document.querySelector('.settings-trigger');
    const settingsMenu = document.querySelector('.settings-menu');
    
    if (settingsTrigger && settingsMenu) {
        settingsTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isVisible = settingsMenu.style.display === 'block';
            settingsMenu.style.display = isVisible ? 'none' : 'block';
        });
        
        // Close settings menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.settings-dropdown')) {
                settingsMenu.style.display = 'none';
            }
        });
    }
}

// Initialize all global functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize existing features
    initializeProgressTracking();
    initializeBookmarkButton();
    
    // Initialize global features
    checkAuthState();
    loadTheme();
    initializeThemeToggle();
    initializeLogoutHandler();
    initializeSettingsMenu();
    
    // Add smooth scroll behavior to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Additional theme toggle initialization with delay
    setTimeout(() => {
        initializeThemeToggle();
    }, 500);
});

// Also run on window load to ensure all elements are available
window.addEventListener('load', () => {
    checkAuthState();
    loadTheme(); 
    initializeThemeToggle();
    initializeLogoutHandler();
    initializeSettingsMenu();
    
    // Final theme toggle check
    setTimeout(() => {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle && !themeToggle.textContent) {
            const currentTheme = localStorage.getItem('theme') || 'dark';
            updateThemeToggleText(currentTheme);
        }
    }, 1000);
});

// Additional initialization with a small delay to ensure DOM is ready
setTimeout(() => {
    initializeThemeToggle();
    
    // Force update theme toggle text if it's empty
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle && !themeToggle.textContent.trim()) {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        updateThemeToggleText(currentTheme);
    }
}, 100); 