// Profile Management System
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.profileData = null;
        this.isInitialized = false;
        this.isUpdating = false; // Prevent redundant updates
        this.lastSyncTime = 0; // Track last sync to prevent rapid updates
    }

    async init() {
        if (this.isInitialized) {
            console.log('ProfileManager already initialized, skipping...');
            return;
        }
        
        console.log('ProfileManager initializing...');
        this.debugAuthState();
        await this.checkAuthState();
        this.setupEventListeners();
        
        // Delay app sync to prevent conflicts with initial load
        setTimeout(() => {
            this.syncWithAppData();
        }, 1000);
        
        this.isInitialized = true;
        console.log('ProfileManager initialization complete');
    }

    debugAuthState() {
        console.log('=== DEBUG AUTH STATE ===');
        console.log('isLoggedIn:', localStorage.getItem('isLoggedIn'));
        console.log('user:', localStorage.getItem('user'));
        console.log('userProfile:', localStorage.getItem('userProfile'));
        console.log('=======================');
        
        // Update debug display
        const debugAuth = document.getElementById('debug-auth');
        const debugUser = document.getElementById('debug-user');
        
        if (debugAuth) {
            debugAuth.textContent = `Logged In: ${localStorage.getItem('isLoggedIn')}`;
        }
        
        if (debugUser) {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            debugUser.textContent = `User: ${user ? (user.name || user.username || user.email) : 'None'}`;
        }
    }

    async checkAuthState() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        console.log('Auth check - isLoggedIn:', isLoggedIn, 'user:', user);
        
        if (!isLoggedIn || !user) {
            // Redirect to login if not authenticated
            console.log('User not logged in, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('User is logged in:', user);
        this.currentUser = user;
        await this.loadUserProfile();
    }

    async loadUserProfile() {
        // First, check if the current user data matches the stored profile data
        const currentUserId = this.currentUser?.email || this.currentUser?.username || 'technqs';
        const profileData = JSON.parse(localStorage.getItem('userProfile') || 'null');
        
        console.log('Current user ID:', currentUserId);
        console.log('Stored profile data:', profileData);
        
        // If profile data exists but doesn't match current user, clear it
        if (profileData && profileData.username !== currentUserId && profileData.name !== currentUserId) {
            console.log('Profile data mismatch - clearing old data');
            localStorage.removeItem('userProfile');
            localStorage.removeItem('websiteProfileSync');
        }
        
        // Try to load from PHP API first
        try {
            const apiResponse = await fetch(`api/get-sync-data.php?userId=${encodeURIComponent(currentUserId)}`);
            if (apiResponse.ok) {
                const syncData = await apiResponse.json();
                if (syncData.status !== 'not_found' && syncData.profileData) {
                    console.log('Found fresh app sync data from PHP API:', syncData);
                    this.profileData = {
                        ...this.profileData,
                        ...syncData.profileData
                    };
                    this.saveProfileData();
                    console.log('Profile data loaded from PHP API sync:', this.profileData);
                    this.updateProfileDisplay();
                    return;
                }
            }
        } catch (error) {
            console.log('PHP API not available, trying JavaScript API:', error.message);
        }
        
        // Try JavaScript API as fallback
        try {
            const jsApiResponse = await fetch(`api/sync-avatar.js?method=GET&userId=${encodeURIComponent(currentUserId)}`);
            if (jsApiResponse.ok) {
                const syncData = await jsApiResponse.json();
                if (syncData.status !== 'not_found' && syncData.profileData) {
                    console.log('Found fresh app sync data from JS API:', syncData);
                    this.profileData = {
                        ...this.profileData,
                        ...syncData.profileData
                    };
                    this.saveProfileData();
                    console.log('Profile data loaded from JS API sync:', this.profileData);
                    this.updateProfileDisplay();
                    return;
                }
            }
        } catch (error) {
            console.log('JS API not available, trying localStorage:', error.message);
        }
        
        // Try to load from localStorage as fallback
        try {
            const appSyncData = localStorage.getItem('websiteProfileSync');
            if (appSyncData) {
                const syncData = JSON.parse(appSyncData);
                const userId = this.currentUser?.email || this.currentUser?.username || 'technqs';
                
                if (syncData.userId === userId) {
                    console.log('Found fresh app sync data from localStorage:', syncData);
                    this.profileData = {
                        ...this.profileData,
                        ...syncData.profileData
                    };
                    this.saveProfileData();
                    console.log('Profile data loaded from localStorage sync:', this.profileData);
                    this.updateProfileDisplay();
                    return;
                }
            }
        } catch (error) {
            console.error('Error loading app sync data:', error);
        }

        // Get profile data from localStorage or use defaults
        const updatedProfileData = JSON.parse(localStorage.getItem('userProfile') || 'null');
        
        console.log('Loading profile data from localStorage:', updatedProfileData);
        
        if (updatedProfileData) {
            this.profileData = updatedProfileData;
        } else {
            // Create default profile data based on current user
            console.log('Creating default profile for user:', this.currentUser);
            this.profileData = {
                name: this.currentUser.name || this.currentUser.username || this.currentUser.email?.split('@')[0] || 'User',
                username: this.currentUser.username || this.currentUser.email?.split('@')[0] || 'user',
                bio: 'Passionate streamer and content creator. Love gaming and connecting with my community!',
                avatar: null,
                socialLink: '',
                stats: {
                    posts: 0,
                    followers: 0,
                    following: 0
                },
                network: {
                    followers: [],
                    following: [],
                    collaborations: []
                },
                analytics: {
                    totalViews: 0,
                    watchTime: 0,
                    engagement: 0,
                    growth: 0
                },
                bookmarks: [],
                calendar: [],
                messages: []
            };
            
            // Save default profile
            this.saveProfileData();
        }
        
        console.log('Profile data loaded:', this.profileData);
        this.updateProfileDisplay();
    }

    updateProfileDisplay() {
        // Prevent redundant updates
        if (this.isUpdating) {
            console.log('Profile update already in progress, skipping...');
            return;
        }
        
        this.isUpdating = true;
        console.log('Updating profile display with data:', this.profileData);
        
        // Safety check for profileData
        if (!this.profileData) {
            console.error('Profile data is not initialized');
            this.isUpdating = false;
            return;
        }
        
        // Update profile header
        const profileAvatar = document.querySelector('.profile-avatar');
        const profileName = document.querySelector('.profile-name');
        const profileUsername = document.querySelector('.profile-username');
        const profileBio = document.querySelector('.profile-bio');

        // Avatar
        if (profileAvatar) {
            if (this.profileData.avatar) {
                profileAvatar.style.backgroundImage = `url('${this.profileData.avatar}')`;
                const avatarSpan = profileAvatar.querySelector('span');
                if (avatarSpan) avatarSpan.textContent = '';
            } else {
                profileAvatar.style.backgroundImage = '';
                const avatarSpan = profileAvatar.querySelector('span');
                if (avatarSpan && this.profileData.name) {
                    avatarSpan.textContent = this.profileData.name.charAt(0).toUpperCase();
                }
            }
        }

        // Name and username
        if (profileName && this.profileData.name) profileName.textContent = this.profileData.name;
        if (profileUsername && this.profileData.username) profileUsername.textContent = `@${this.profileData.username}`;
        if (profileBio && this.profileData.bio) profileBio.textContent = this.profileData.bio;

        // Stats - Update to match app format: Posts | Followers | Following
        const postsCount = document.getElementById('posts-count');
        const followersCount = document.getElementById('followers-count');
        const followingCount = document.getElementById('following-count');
        
        // Ensure stats object exists
        if (!this.profileData.stats) {
            this.profileData.stats = { posts: 0, followers: 0, following: 0 };
        }
        
        if (postsCount) postsCount.textContent = this.formatNumber(this.profileData.stats.posts);
        if (followersCount) followersCount.textContent = this.formatNumber(this.profileData.stats.followers);
        if (followingCount) followingCount.textContent = this.formatNumber(this.profileData.stats.following);

        // Pre-fill edit form
        this.populateEditForm();
        
        console.log('Profile display updated successfully');
        
        // Reset update flag
        this.isUpdating = false;
        
        // Show edit profile section by default
        console.log('Showing edit-profile section by default');
        this.showSection('edit-profile');
    }

    populateEditForm() {
        // Safety check for profileData
        if (!this.profileData) {
            console.error('Profile data is not initialized for form population');
            return;
        }
        
        const nameInput = document.getElementById('name');
        const usernameInput = document.getElementById('username');
        const bioInput = document.getElementById('bio');
        const socialLinkInput = document.getElementById('social-link');
        const charCount = document.querySelector('.char-count');

        console.log('Populating form fields with profile data:', {
            name: this.profileData.name,
            username: this.profileData.username,
            bio: this.profileData.bio,
            socialLink: this.profileData.socialLink
        });

        if (nameInput && this.profileData.name) {
            nameInput.value = this.profileData.name;
            console.log('Set name input to:', this.profileData.name);
        }
        if (usernameInput && this.profileData.username) {
            usernameInput.value = this.profileData.username;
            console.log('Set username input to:', this.profileData.username);
        }
        if (bioInput && this.profileData.bio) {
            bioInput.value = this.profileData.bio;
            if (charCount) charCount.textContent = `${this.profileData.bio.length}/80`;
            console.log('Set bio input to:', this.profileData.bio);
        }
        if (socialLinkInput && this.profileData.socialLink) {
            socialLinkInput.value = this.profileData.socialLink;
            console.log('Set social link input to:', this.profileData.socialLink);
        }

        // Handle profile photo state
        console.log('Checking avatar state:', {
            hasAvatar: this.profileData.hasAvatar,
            avatarLength: this.profileData.avatar ? this.profileData.avatar.length : 0,
            avatarPreview: this.profileData.avatar ? this.profileData.avatar.substring(0, 50) + '...' : 'none'
        });

        if (this.profileData.avatar && this.profileData.hasAvatar) {
            console.log('Applying avatar to profile elements...');
            this.updateMainProfileAvatar(this.profileData.avatar);
            
            const profilePhotoPreview = document.getElementById('profilePhotoPreview');
            const removePhotoBtn = document.getElementById('removePhotoBtn');
            const profileInitial = profilePhotoPreview?.querySelector('.profile-initial');
            const photoOverlay = profilePhotoPreview?.querySelector('.photo-overlay');

            if (profilePhotoPreview) {
                console.log('Setting background image on profile photo preview');
                profilePhotoPreview.style.backgroundImage = `url('${this.profileData.avatar}')`;
                profilePhotoPreview.style.backgroundSize = 'cover';
                profilePhotoPreview.style.backgroundPosition = 'center';
                profilePhotoPreview.style.backgroundRepeat = 'no-repeat';

                if (profileInitial) profileInitial.style.display = 'none';
                if (photoOverlay) photoOverlay.style.display = 'none';
            }

            if (removePhotoBtn) removePhotoBtn.style.display = 'flex';
        } else {
            console.log('No avatar to apply or hasAvatar is false');
        }
    }

    // Manual refresh function - can be called from browser console
    refreshProfile() {
        console.log('Manual profile refresh triggered');
        this.debugAuthState();
        this.checkAuthState();
    }

    // Create test user for debugging
    createTestUser() {
        const testUser = {
            name: 'Test User',
            username: 'testuser',
            email: 'test@example.com'
        };
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(testUser));
        
        console.log('Test user created:', testUser);
        this.refreshProfile();
    }

    // Reset profile to correct technqs data
    resetToTechnqsProfile() {
        console.log('Resetting profile to technqs data...');
        
        // Update user data
        const technqsUser = {
            email: 'technqs',
            name: 'technqs',
            username: 'technqs'
        };
        
        // Preserve existing avatar if it exists
        const currentAvatar = this.profileData?.avatar;
        const hasCurrentAvatar = this.profileData?.hasAvatar;
        
        // Update profile data
        const technqsProfile = {
            name: 'technqs',
            username: 'technqs',
            bio: 'Founder of StreamersTip He/him',
            avatar: currentAvatar || null,
            socialLink: '',
            stats: {
                posts: 0,
                followers: 0,
                following: 0
            },
            network: {
                followers: [],
                following: [],
                collaborations: []
            },
            analytics: {
                totalViews: 0,
                watchTime: 0,
                engagement: 0,
                growth: 0
            },
            bookmarks: [],
            calendar: [],
            messages: [],
            hasAvatar: hasCurrentAvatar || false
        };
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(technqsUser));
        localStorage.setItem('userProfile', JSON.stringify(technqsProfile));
        
        // Update current data
        this.currentUser = technqsUser;
        this.profileData = technqsProfile;
        
        // Update display
        this.updateProfileDisplay();
        
        console.log('Profile reset to technqs data (preserving avatar):', technqsProfile);
        this.showNotification('Profile reset to technqs data', 'success');
    }

    setupEventListeners() {
        // Profile link navigation
        const profileLinks = document.querySelectorAll('.profile-link[data-section]');
        console.log('Found profile links:', profileLinks.length);
        
        profileLinks.forEach(link => {
            console.log('Setting up event listener for:', link.dataset.section, link.textContent.trim());
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                console.log('Profile link clicked:', section);
                this.showSection(section);
            });
        });

        // Edit profile form
        const editForm = document.querySelector('.edit-profile-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfileChanges();
            });
        }

        // Bio character counter
        const bioTextarea = document.getElementById('bio');
        const charCount = document.querySelector('.char-count');
        if (bioTextarea && charCount) {
            bioTextarea.addEventListener('input', () => {
                const remaining = bioTextarea.value.length;
                charCount.textContent = `${remaining}/80`;
            });
        }

        // Profile photo upload
        const profilePhotoInput = document.getElementById('profile-photo');
        const profilePhotoPreview = document.getElementById('profilePhotoPreview');
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        
        if (profilePhotoInput) {
            profilePhotoInput.addEventListener('change', (e) => {
                this.handleAvatarUpload(e);
            });
        }

        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', () => {
                this.removeProfilePhoto();
            });
        }

        // Click on preview to trigger file input
        if (profilePhotoPreview) {
            profilePhotoPreview.addEventListener('click', () => {
                profilePhotoInput.click();
            });
        }

        // Sync app button
        const syncAppBtn = document.getElementById('syncAppBtn');
        if (syncAppBtn) {
            syncAppBtn.addEventListener('click', () => {
                this.triggerAppSync();
            });
        }

        // Settings dropdown
        const settingsTrigger = document.querySelector('.settings-trigger');
        const settingsDropdown = document.querySelector('.settings-dropdown');
        const logoutBtn = document.querySelector('.settings-item.logout');
        
        if (settingsTrigger && settingsDropdown) {
            settingsTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                settingsDropdown.classList.toggle('active');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!settingsDropdown.contains(e.target)) {
                    settingsDropdown.classList.remove('active');
                }
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Network tabs
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchNetworkTab(e.target.dataset.tab);
            });
        });

        // Message actions
        document.querySelectorAll('.message-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (btn.classList.contains('delete-btn')) {
                    this.deleteMessage(btn.closest('.message-thread').dataset.messageId);
                }
            });
        });

        // Message thread clicks
        document.querySelectorAll('.message-thread').forEach(thread => {
            thread.addEventListener('click', (e) => {
                if (!e.target.closest('.message-action-btn')) {
                    this.showMessageDetail(thread.dataset.messageId);
                }
            });
        });
    }

    showSection(sectionName) {
        console.log('showSection called with:', sectionName);
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
            console.log('Removed active from section:', section.id);
        });

        // Remove active class from all links
        document.querySelectorAll('.profile-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log('Added active to section:', targetSection.id);
        } else {
            console.error('Target section not found:', `${sectionName}-section`);
        }

        // Add active class to clicked link
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            console.log('Added active to link:', activeLink.textContent.trim());
        } else {
            console.error('Active link not found for section:', sectionName);
        }

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'network':
                this.loadNetworkData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
            case 'messages':
                this.loadMessagesData();
                break;
            case 'bookmarks':
                this.loadBookmarksData();
                break;
            case 'calendar':
                this.loadCalendarData();
                break;
        }
    }

    loadNetworkData() {
        // Load network stats
        const networkStats = document.querySelectorAll('.stat-card .stat-value');
        if (networkStats.length >= 3) {
            networkStats[0].textContent = this.formatNumber(this.profileData.stats.followers);
            networkStats[1].textContent = this.formatNumber(this.profileData.stats.following);
            networkStats[2].textContent = this.formatNumber(this.profileData.network.followers.filter(f => 
                this.profileData.network.following.includes(f)
            ).length);
        }
    }

    loadAnalyticsData() {
        // Initialize analytics with real-time updates
        if (!this.analyticsManager) {
            this.analyticsManager = new AnalyticsManager();
        }
    }

    loadMessagesData() {
        // Load messages from profile data
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer && this.profileData.messages) {
            // Messages are already in the HTML, just update status if needed
        }
    }

    loadBookmarksData() {
        // Load bookmarks from localStorage
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedPages') || '[]');
        const bookmarksGrid = document.getElementById('bookmarksGrid');
        
        if (bookmarksGrid) {
            if (bookmarks.length === 0) {
                bookmarksGrid.innerHTML = '<p class="no-bookmarks">No bookmarks yet. Start bookmarking pages to see them here!</p>';
            } else {
                bookmarksGrid.innerHTML = bookmarks.map((bookmark, index) => `
                    <div class="bookmark-card">
                        <div class="bookmark-content">
                            <a href="${bookmark.url}" class="bookmark-link">
                                <h4>${bookmark.title}</h4>
                                <p>Bookmarked on ${new Date(bookmark.timestamp).toLocaleDateString()}</p>
                            </a>
                        </div>
                        <button class="delete-bookmark-btn" data-index="${index}" title="Delete bookmark">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                `).join('');
                
                // Add event listeners for delete buttons
                this.setupBookmarkDeleteListeners();
            }
        }
    }

    setupBookmarkDeleteListeners() {
        const deleteButtons = document.querySelectorAll('.delete-bookmark-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const index = parseInt(button.dataset.index);
                this.deleteBookmark(index);
            });
        });
    }

    deleteBookmark(index) {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedPages') || '[]');
        
        if (index >= 0 && index < bookmarks.length) {
            const deletedBookmark = bookmarks[index];
            
            // Remove the bookmark from the array
            bookmarks.splice(index, 1);
            
            // Update localStorage
            localStorage.setItem('bookmarkedPages', JSON.stringify(bookmarks));
            
            // Reload the bookmarks display
            this.loadBookmarksData();
            
            // Show notification
            this.showNotification(`"${deletedBookmark.title}" removed from bookmarks`, 'success');
            
            console.log('Bookmark deleted:', deletedBookmark.title);
        }
    }

    loadCalendarData() {
        // Calendar data is already in HTML, just initialize if needed
        if (!this.calendarInitialized) {
            this.initializeCalendar();
            this.calendarInitialized = true;
        }
    }

    switchNetworkTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.network-list').forEach(list => {
            list.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            this.showNotification('Please select a valid image file (JPG, PNG, GIF)', 'error');
            return;
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            this.showNotification('File size must be less than 5MB', 'error');
            return;
        }

        // Set uploading flag to prevent conflicts
        this.isUploading = true;

        const reader = new FileReader();
        reader.onload = (e) => {
            const profilePhotoPreview = document.getElementById('profilePhotoPreview');
            const removePhotoBtn = document.getElementById('removePhotoBtn');
            const profileInitial = profilePhotoPreview.querySelector('.profile-initial');
            const photoOverlay = profilePhotoPreview.querySelector('.photo-overlay');

            // Set background image
            profilePhotoPreview.style.backgroundImage = `url('${e.target.result}')`;
            profilePhotoPreview.style.backgroundSize = 'cover';
            profilePhotoPreview.style.backgroundPosition = 'center';
            profilePhotoPreview.style.backgroundRepeat = 'no-repeat';

            // Hide initial and overlay
            if (profileInitial) profileInitial.style.display = 'none';
            if (photoOverlay) photoOverlay.style.display = 'none';

            // Show remove button
            if (removePhotoBtn) removePhotoBtn.style.display = 'flex';

            // Store the image data
            this.profileData.avatar = e.target.result;
            this.profileData.hasAvatar = true;

            // Save to localStorage and sync to Firebase
            this.saveProfileData();
            this.syncProfileToBackend();

            // Update main profile avatar
            this.updateMainProfileAvatar(e.target.result);

            this.showNotification('Profile photo updated successfully!', 'success');
            
            // Clear uploading flag after a delay
            setTimeout(() => {
                this.isUploading = false;
            }, 2000);
        };

        reader.onerror = () => {
            this.showNotification('Error reading file. Please try again.', 'error');
            this.isUploading = false;
        };

        reader.readAsDataURL(file);
    }

    removeProfilePhoto() {
        const profilePhotoPreview = document.getElementById('profilePhotoPreview');
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        const profileInitial = profilePhotoPreview.querySelector('.profile-initial');
        const photoOverlay = profilePhotoPreview.querySelector('.photo-overlay');
        const profilePhotoInput = document.getElementById('profile-photo');

        // Reset preview
        profilePhotoPreview.style.backgroundImage = 'none';
        profilePhotoPreview.style.backgroundSize = 'auto';
        profilePhotoPreview.style.backgroundPosition = 'auto';
        profilePhotoPreview.style.backgroundRepeat = 'auto';

        // Show initial and overlay
        if (profileInitial) profileInitial.style.display = 'flex';
        if (photoOverlay) photoOverlay.style.display = 'flex';

        // Hide remove button
        if (removePhotoBtn) removePhotoBtn.style.display = 'none';

        // Clear file input
        if (profilePhotoInput) profilePhotoInput.value = '';

        // Clear profile data
        this.profileData.avatar = null;
        this.profileData.hasAvatar = false;

        // Save to localStorage and sync to Firebase
        this.saveProfileData();
        this.syncProfileToBackend();

        // Reset main profile avatar
        this.updateMainProfileAvatar(null);

        this.showNotification('Profile photo removed', 'success');
    }

    updateMainProfileAvatar(imageData) {
        const mainProfileAvatar = document.querySelector('.profile-avatar');
        if (mainProfileAvatar) {
            if (imageData) {
                mainProfileAvatar.style.backgroundImage = `url('${imageData}')`;
                mainProfileAvatar.style.backgroundSize = 'cover';
                mainProfileAvatar.style.backgroundPosition = 'center';
                mainProfileAvatar.style.backgroundRepeat = 'no-repeat';
                mainProfileAvatar.textContent = '';
            } else {
                mainProfileAvatar.style.backgroundImage = 'none';
                mainProfileAvatar.style.backgroundSize = 'auto';
                mainProfileAvatar.style.backgroundPosition = 'auto';
                mainProfileAvatar.style.backgroundRepeat = 'auto';
                mainProfileAvatar.textContent = 'J';
            }
        }
    }

    async saveProfileChanges() {
        try {
            // Get form data
            const name = document.getElementById('name').value.trim();
            const username = document.getElementById('username').value.trim();
            const bio = document.getElementById('bio').value.trim();
            const socialLink = document.getElementById('social-link').value.trim();

            // Validation
            if (!name || !username) {
                this.showNotification('Name and username are required', 'error');
                return;
            }

            if (username.length < 3) {
                this.showNotification('Username must be at least 3 characters', 'error');
                return;
            }

            if (bio.length > 80) {
                this.showNotification('Bio must be 80 characters or less', 'error');
                return;
            }

            // Update profile data
            this.profileData.name = name;
            this.profileData.username = username;
            this.profileData.bio = bio;
            this.profileData.socialLink = socialLink;

            // Save to localStorage
            this.saveProfileData();

            // Update display
            this.updateProfileDisplay();

            // Update user data in localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.name = name;
            user.username = username;
            localStorage.setItem('user', JSON.stringify(user));

            // Simulate API call to update both website and app
            await this.syncProfileToBackend();

            this.showNotification('Profile updated successfully!', 'success');

        } catch (error) {
            console.error('Error saving profile:', error);
            this.showNotification('Error saving profile. Please try again.', 'error');
        }
    }

    async syncProfileToBackend() {
        try {
            // Sync to Firebase
            await this.syncToFirebase();
            
            // Also sync to localStorage for local persistence
            this.saveProfileData();
            
            console.log('Profile synced to Firebase and localStorage:', this.profileData);
            return true;
        } catch (error) {
            console.error('Error syncing to backend:', error);
            // Fallback to localStorage only
            this.saveProfileData();
            return false;
        }
    }

    async syncToFirebase() {
        // Firebase sync implementation
        // This should match your app's Firebase structure
        try {
            const userId = this.currentUser?.email || this.currentUser?.username || 'technqs';
            
            // Prepare profile data for Firebase
            const firebaseProfileData = {
                name: this.profileData.name,
                username: this.profileData.username,
                bio: this.profileData.bio,
                avatar: this.profileData.avatar,
                hasAvatar: this.profileData.hasAvatar,
                socialLink: this.profileData.socialLink,
                stats: this.profileData.stats,
                lastUpdated: new Date().toISOString(),
                source: 'website'
            };

            // If you have Firebase SDK initialized, use this:
            // await firebase.firestore().collection('users').doc(userId).set(firebaseProfileData);
            
            // For now, we'll use a custom event that your app can listen to
            this.triggerFirebaseSync(firebaseProfileData);
            
            console.log('Firebase sync triggered for user:', userId);
            return true;
        } catch (error) {
            console.error('Firebase sync error:', error);
            throw error;
        }
    }

    triggerFirebaseSync(profileData) {
        // Create a custom event that your app can listen to
        const syncEvent = new CustomEvent('profileSync', {
            detail: {
                userId: this.currentUser?.email || this.currentUser?.username || 'technqs',
                profileData: profileData,
                timestamp: new Date().toISOString()
            }
        });
        
        // Dispatch the event
        window.dispatchEvent(syncEvent);
        
        // Store in localStorage for app to pick up
        localStorage.setItem('websiteProfileSync', JSON.stringify({
            userId: this.currentUser?.email || this.currentUser?.username || 'technqs',
            profileData: profileData,
            timestamp: new Date().toISOString()
        }));
        
        // Also store individual items for easier app access
        localStorage.setItem('websiteAvatar', profileData.avatar || '');
        localStorage.setItem('websiteProfile', JSON.stringify({
            name: profileData.name,
            username: profileData.username,
            bio: profileData.bio,
            socialLink: profileData.socialLink,
            avatar: profileData.avatar
        }));
        
        console.log('Website sync data stored for app:', {
            avatar: profileData.avatar ? 'Present' : 'None',
            profile: profileData.name,
            timestamp: new Date().toISOString()
        });
    }

    saveProfileData() {
        localStorage.setItem('userProfile', JSON.stringify(this.profileData));
    }

    loadProfileData() {
        const savedData = localStorage.getItem('userProfile');
        if (savedData) {
            this.profileData = JSON.parse(savedData);
        }
    }

    deleteMessage(messageId) {
        if (confirm('Are you sure you want to delete this message?')) {
            // Remove message from DOM
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                messageElement.remove();
            }

            // Remove from profile data
            this.profileData.messages = this.profileData.messages.filter(
                msg => msg.id !== messageId
            );
            this.saveProfileData();

            this.showNotification('Message deleted', 'success');
        }
    }

    showMessageDetail(messageId) {
        // Implementation for showing message detail view
        console.log('Show message detail:', messageId);
    }

    initializeCalendar() {
        // Calendar initialization code (already in HTML)
        console.log('Calendar initialized');
    }

    formatNumber(num) {
        // Handle null, undefined, or non-numeric values
        if (num === null || num === undefined || isNaN(num)) {
            return '0';
        }
        
        // Convert to number if it's a string
        const number = Number(num);
        
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
        }
        if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        }
        return number.toString();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#45A29E'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-family: 'Nunito', sans-serif;
            font-weight: 600;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // App Sync Methods
    syncWithAppData() {
        console.log('Syncing with app data...');
        
        // Check for app data in localStorage (simulating app sync)
        const appData = this.getAppData();
        if (appData) {
            this.updateStatsFromApp(appData);
        }
        
        // Listen for app events
        this.setupAppEventListeners();
        
        // Set up periodic sync check
        this.startPeriodicSync();
    }

    startPeriodicSync() {
        // Check for app updates every 5 seconds (less frequent to avoid conflicts)
        this.syncInterval = setInterval(() => {
            this.checkForAppUpdates();
        }, 5000);
    }

    checkForAppUpdates() {
        // Don't check if we're currently uploading
        if (this.isUploading) {
            return;
        }
        
        // Check for new app data
        const appAvatar = localStorage.getItem('appAvatar');
        const appProfile = localStorage.getItem('appProfile');
        
        if (appAvatar && appAvatar !== this.profileData.avatar) {
            console.log('App avatar updated, syncing to website...');
            this.syncAvatarFromApp(appAvatar);
        }
        
        if (appProfile) {
            const profileData = JSON.parse(appProfile);
            if (profileData.name !== this.profileData.name || 
                profileData.username !== this.profileData.username ||
                profileData.bio !== this.profileData.bio) {
                console.log('App profile updated, syncing to website...');
                this.syncProfileFromApp(profileData);
            }
        }
    }

    stopPeriodicSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    syncAvatarFromApp(avatarData) {
        // Prevent rapid successive updates
        const now = Date.now();
        if (now - this.lastSyncTime < 1000) { // 1 second cooldown
            console.log('Avatar sync too recent, skipping update');
            return false;
        }
        
        console.log('Syncing avatar from app:', avatarData);
        
        if (avatarData) {
            this.profileData.avatar = avatarData;
            this.profileData.hasAvatar = true;
            this.saveProfileData();
            this.updateProfileDisplay();
            this.lastSyncTime = now;
            this.showNotification('Avatar synced from app!', 'success');
            console.log('Avatar updated from app:', avatarData);
            return true;
        }
        
        return false;
    }

    syncProfileFromApp(profileData) {
        // Prevent rapid successive updates
        const now = Date.now();
        if (now - this.lastSyncTime < 1000) { // 1 second cooldown
            console.log('Profile sync too recent, skipping update');
            return false;
        }
        
        console.log('Syncing profile from app:', profileData);
        
        if (profileData) {
            // Update profile data
            this.profileData.name = profileData.name || this.profileData.name;
            this.profileData.username = profileData.username || this.profileData.username;
            this.profileData.bio = profileData.bio || this.profileData.bio;
            this.profileData.socialLink = profileData.socialLink || this.profileData.socialLink;
            
            // Update avatar if provided
            if (profileData.avatar) {
                this.profileData.avatar = profileData.avatar;
                this.profileData.hasAvatar = true;
            }
            
            this.saveProfileData();
            this.updateProfileDisplay();
            this.lastSyncTime = now;
            this.showNotification('Profile synced from app!', 'success');
            console.log('Profile updated from app:', profileData);
            return true;
        }
        
        return false;
    }

    getAppData() {
        // Simulate getting data from app storage
        const appStats = localStorage.getItem('appStats');
        const appPosts = localStorage.getItem('appPosts');
        const appProfile = localStorage.getItem('appProfile');
        const appAvatar = localStorage.getItem('appAvatar');
        
        const hasData = appStats || appPosts || appProfile || appAvatar;
        
        if (hasData) {
            return {
                stats: appStats ? JSON.parse(appStats) : null,
                posts: appPosts ? JSON.parse(appPosts) : null,
                profile: appProfile ? JSON.parse(appProfile) : null,
                avatar: appAvatar || null
            };
        }
        
        return null;
    }

    updateStatsFromApp(appData) {
        // Prevent rapid successive updates
        const now = Date.now();
        if (now - this.lastSyncTime < 1000) { // 1 second cooldown
            console.log('Sync too recent, skipping update');
            return;
        }
        
        console.log('Updating profile data from app:', appData);
        
        let hasUpdates = false;
        
        // Update stats from app
        if (appData.stats) {
            this.profileData.stats = {
                ...this.profileData.stats,
                ...appData.stats
            };
            hasUpdates = true;
        }
        
        if (appData.posts) {
            // Update posts count from app
            this.profileData.stats.posts = appData.posts.length || 0;
            hasUpdates = true;
        }
        
        // Update profile information from app
        if (appData.profile) {
            const profileUpdates = {};
            
            if (appData.profile.name && appData.profile.name !== this.profileData.name) {
                profileUpdates.name = appData.profile.name;
                hasUpdates = true;
            }
            
            if (appData.profile.username && appData.profile.username !== this.profileData.username) {
                profileUpdates.username = appData.profile.username;
                hasUpdates = true;
            }
            
            if (appData.profile.bio && appData.profile.bio !== this.profileData.bio) {
                profileUpdates.bio = appData.profile.bio;
                hasUpdates = true;
            }
            
            if (appData.profile.socialLink && appData.profile.socialLink !== this.profileData.socialLink) {
                profileUpdates.socialLink = appData.profile.socialLink;
                hasUpdates = true;
            }
            
            // Apply profile updates
            Object.assign(this.profileData, profileUpdates);
        }
        
        // Update avatar from app
        if (appData.avatar && appData.avatar !== this.profileData.avatar) {
            this.profileData.avatar = appData.avatar;
            this.profileData.hasAvatar = true;
            hasUpdates = true;
            console.log('Avatar updated from app');
        }
        
        // Save updated profile data if there were changes
        if (hasUpdates) {
            this.saveProfileData();
            this.updateProfileDisplay();
            this.lastSyncTime = now;
            console.log('Profile data updated from app:', this.profileData);
        }
    }

    setupAppEventListeners() {
        // Listen for storage changes (app updates)
        window.addEventListener('storage', (e) => {
            if (e.key === 'appStats' || e.key === 'appPosts' || e.key === 'appProfile' || e.key === 'appAvatar') {
                console.log('App data changed:', e.key, e.newValue);
                const appData = this.getAppData();
                if (appData) {
                    this.updateStatsFromApp(appData);
                }
            }
        });

        // Listen for custom app events
        document.addEventListener('appDataUpdated', (e) => {
            console.log('App data updated event received:', e.detail);
            this.updateStatsFromApp(e.detail);
        });

        // Listen for profile photo updates from app
        document.addEventListener('appAvatarUpdated', (e) => {
            console.log('App avatar updated event received:', e.detail);
            if (e.detail.avatar) {
                this.profileData.avatar = e.detail.avatar;
                this.profileData.hasAvatar = true;
                this.saveProfileData();
                this.updateProfileDisplay();
                this.showNotification('Profile photo synced from app!', 'success');
            }
        });

        // Listen for profile updates from app
        document.addEventListener('appProfileUpdated', (e) => {
            console.log('App profile updated event received:', e.detail);
            if (e.detail.profile) {
                Object.assign(this.profileData, e.detail.profile);
                this.saveProfileData();
                this.updateProfileDisplay();
                this.showNotification('Profile synced from app!', 'success');
            }
        });

        // Listen for post creation events
        document.addEventListener('postCreated', (e) => {
            console.log('Post created event received:', e.detail);
            this.incrementPostsCount();
        });

        // Listen for follower changes
        document.addEventListener('followersChanged', (e) => {
            console.log('Followers changed event received:', e.detail);
            this.updateFollowersCount(e.detail.count);
        });

        // Listen for following changes
        document.addEventListener('followingChanged', (e) => {
            console.log('Following changed event received:', e.detail);
            this.updateFollowingCount(e.detail.count);
        });
    }

    incrementPostsCount() {
        this.profileData.stats.posts++;
        this.saveProfileData();
        this.updateProfileDisplay();
        console.log('Posts count incremented:', this.profileData.stats.posts);
    }

    updateFollowersCount(count) {
        this.profileData.stats.followers = count;
        this.saveProfileData();
        this.updateProfileDisplay();
        console.log('Followers count updated:', count);
    }

    updateFollowingCount(count) {
        this.profileData.stats.following = count;
        this.saveProfileData();
        this.updateProfileDisplay();
        console.log('Following count updated:', count);
    }

    // Simulate app data for testing
    simulateAppData() {
        console.log('Simulating app data...');
        
        // Simulate posts
        const mockPosts = [
            { id: 1, title: 'Gaming Stream', timestamp: Date.now() - 86400000 },
            { id: 2, title: 'Valorant Highlights', timestamp: Date.now() - 172800000 },
            { id: 3, title: 'Community Q&A', timestamp: Date.now() - 259200000 }
        ];
        
        // Simulate stats
        const mockStats = {
            posts: mockPosts.length,
            followers: 1250,
            following: 480
        };
        
        // Simulate profile data
        const mockProfile = {
            name: 'John Doe',
            username: 'johndoe',
            bio: 'Professional streamer and content creator. Love gaming and connecting with my community!',
            socialLink: 'https://twitch.tv/johndoe'
        };
        
        // Simulate avatar (base64 encoded image or URL)
        const mockAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMjAwIiB5Mj0iMjAwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM5MjQ4ZDI7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNzc2OGRmO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxNjcwZGU7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeD0iNTAiIHk9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZmlsbD0ibm9uZSI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzAiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTAgMTIwQzEwIDkwIDMwIDcwIDUwIDcwQzcwIDcwIDkwIDkwIDkwIDEyMEgxMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K';
        
        // Store in localStorage (simulating app storage)
        localStorage.setItem('appPosts', JSON.stringify(mockPosts));
        localStorage.setItem('appStats', JSON.stringify(mockStats));
        localStorage.setItem('appProfile', JSON.stringify(mockProfile));
        localStorage.setItem('appAvatar', mockAvatar);
        
        // Trigger update
        this.updateStatsFromApp({ 
            stats: mockStats, 
            posts: mockPosts, 
            profile: mockProfile, 
            avatar: mockAvatar 
        });
        
        console.log('App data simulated:', { 
            stats: mockStats, 
            posts: mockPosts, 
            profile: mockProfile, 
            hasAvatar: !!mockAvatar 
        });
    }

    // Debug methods for testing
    addTestPost() {
        this.incrementPostsCount();
        this.showNotification('Test post added!', 'success');
    }

    addTestFollower() {
        this.updateFollowersCount(this.profileData.stats.followers + 1);
        this.showNotification('Test follower added!', 'success');
    }

    addTestFollowing() {
        this.updateFollowingCount(this.profileData.stats.following + 1);
        this.showNotification('Test following added!', 'success');
    }

    // Manual app sync trigger
    triggerAppSync() {
        console.log('Manually triggering app sync...');
        const appData = this.getAppData();
        if (appData) {
            this.updateStatsFromApp(appData);
            this.showNotification('App data synced successfully!', 'success');
        } else {
            this.showNotification('No app data found to sync', 'info');
        }
    }

    // Sync avatar from EditProfileView
    syncAvatarFromEditProfileView(avatarData) {
        console.log('Syncing avatar from EditProfileView:', avatarData);
        
        if (avatarData) {
            // Handle different avatar data formats
            let avatarUrl = null;
            
            if (typeof avatarData === 'string') {
                // Direct URL or base64 string
                avatarUrl = avatarData;
            } else if (avatarData.url) {
                // Object with url property
                avatarUrl = avatarData.url;
            } else if (avatarData.uri) {
                // React Native image uri
                avatarUrl = avatarData.uri;
            } else if (avatarData.base64) {
                // Base64 encoded image
                avatarUrl = `data:image/jpeg;base64,${avatarData.base64}`;
            }
            
            if (avatarUrl) {
                this.profileData.avatar = avatarUrl;
                this.profileData.hasAvatar = true;
                this.saveProfileData();
                this.updateProfileDisplay();
                this.showNotification('Avatar synced from EditProfileView!', 'success');
                console.log('Avatar updated from EditProfileView:', avatarUrl);
                return true;
            }
        }
        
        this.showNotification('Invalid avatar data from EditProfileView', 'error');
        return false;
    }

    // Test method to simulate EditProfileView avatar sync
    testEditProfileViewSync() {
        // Simulate avatar data from EditProfileView
        const mockEditProfileViewAvatar = {
            // You can test different formats:
            // url: 'https://example.com/avatar.jpg',
            // uri: 'file:///path/to/avatar.jpg',
            base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        };
        
        this.syncAvatarFromEditProfileView(mockEditProfileViewAvatar);
    }

    // Test function to verify avatar display with a visible image
    testAvatarDisplay() {
        console.log('Testing avatar display with a visible test image...');
        
        // Create a visible test image (100x100 red square)
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
        
        // Add some text to make it more visible
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TEST', 50, 50);
        
        const testImageData = canvas.toDataURL('image/png');
        
        // Update profile data
        this.profileData.avatar = testImageData;
        this.profileData.hasAvatar = true;
        
        // Save to localStorage
        this.saveProfileData();
        
        // Update display
        this.updateProfileDisplay();
        
        console.log('Test avatar applied. You should now see a red square with "TEST" text.');
    }

    // Test function to simulate app sending avatar data
    testAppAvatarSync() {
        console.log('Simulating app sending avatar data...');
        
        // Create a test avatar (blue square with "APP" text)
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0066ff';
        ctx.fillRect(0, 0, 100, 100);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('APP', 50, 50);
        
        const appAvatarData = canvas.toDataURL('image/png');
        
        // Store in localStorage as if app sent it
        localStorage.setItem('appAvatar', appAvatarData);
        
        // Also store profile data
        const appProfileData = {
            name: 'technqs',
            username: 'technqs',
            bio: 'Founder of StreamersTip He/him - Updated from App!',
            avatar: appAvatarData,
            socialLink: 'https://twitch.tv/technqs'
        };
        localStorage.setItem('appProfile', JSON.stringify(appProfileData));
        
        console.log('App data stored. Website should sync automatically in 2 seconds...');
        this.showNotification('App data stored - watch for sync!', 'info');
    }

    // Clear app data for testing
    clearAppData() {
        localStorage.removeItem('appStats');
        localStorage.removeItem('appPosts');
        localStorage.removeItem('appProfile');
        localStorage.removeItem('appAvatar');
        this.showNotification('App data cleared', 'info');
    }

    // Clear all test data and ensure clean user data
    clearAllTestData() {
        console.log('Clearing all test data...');
        
        // Clear test-related localStorage items
        localStorage.removeItem('appStats');
        localStorage.removeItem('appPosts');
        localStorage.removeItem('appProfile');
        localStorage.removeItem('appAvatar');
        localStorage.removeItem('websiteProfileSync');
        
        // Clear userProfile if it contains test data
        const profileData = JSON.parse(localStorage.getItem('userProfile') || 'null');
        if (profileData && (profileData.name === 'John Doe' || profileData.username === 'johndoe')) {
            localStorage.removeItem('userProfile');
            console.log('Cleared test profile data');
        }
        
        // Ensure user data is correct
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user && (user.name === 'John Doe' || user.username === 'johndoe')) {
            const correctUser = {
                email: 'technqs',
                name: 'technqs',
                username: 'technqs'
            };
            localStorage.setItem('user', JSON.stringify(correctUser));
            console.log('Corrected user data to technqs');
        }
        
        this.showNotification('All test data cleared', 'success');
        
        // Refresh the profile
        setTimeout(() => {
            this.refreshProfile();
        }, 500);
    }

    // Handle logout
    handleLogout() {
        // Clear all user data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('appStats');
        localStorage.removeItem('appPosts');
        localStorage.removeItem('appProfile');
        localStorage.removeItem('appAvatar');
        
        // Show logout notification
        this.showNotification('Logged out successfully', 'success');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }

    // Debug function to check section states
    debugSections() {
        console.log('=== DEBUG SECTIONS ===');
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            console.log(`Section ${section.id}:`, {
                display: window.getComputedStyle(section).display,
                hasActive: section.classList.contains('active'),
                visible: section.offsetParent !== null
            });
        });
        
        const links = document.querySelectorAll('.profile-link');
        links.forEach(link => {
            console.log(`Link ${link.dataset.section}:`, {
                hasActive: link.classList.contains('active'),
                text: link.textContent.trim()
            });
        });
        console.log('=====================');
    }
}

// Analytics Manager Class
class AnalyticsManager {
    constructor() {
        this.metrics = {
            totalViews: { value: 0, trend: 0 },
            watchTime: { value: 0, trend: 0 },
            engagement: { value: 0, trend: 0 },
            growth: { value: 0, trend: 0 }
        };
        this.updateInterval = 5000;
        this.initializeMetrics();
        this.startUpdates();
    }

    initializeMetrics() {
        this.fetchMetrics();
    }

    async fetchMetrics() {
        try {
            const response = await this.simulateApiCall();
            this.updateMetrics(response);
        } catch (error) {
            console.error('Error fetching metrics:', error);
        }
    }

    updateMetrics(data) {
        Object.keys(this.metrics).forEach(metric => {
            const element = document.getElementById(metric);
            const trendElement = document.getElementById(`${metric}Trend`);
            const indicator = element?.closest('.analytics-card')?.querySelector('.update-indicator');

            if (element && trendElement) {
                this.metrics[metric] = data[metric];
                element.innerHTML = this.formatValue(metric, data[metric].value);
                
                const trend = data[metric].trend;
                trendElement.textContent = `${trend > 0 ? '+' : ''}${trend}%`;
                trendElement.className = `trend-value ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : ''}`;

                if (indicator) {
                    indicator.classList.add('updating');
                    setTimeout(() => indicator.classList.remove('updating'), 1000);
                }
            }
        });
    }

    formatValue(metric, value) {
        switch(metric) {
            case 'watchTime':
                return this.formatWatchTime(value);
            case 'totalViews':
            case 'engagement':
            case 'growth':
                return this.formatNumber(value);
            default:
                return value;
        }
    }

    formatWatchTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    startUpdates() {
        setInterval(() => this.fetchMetrics(), this.updateInterval);
    }

    async simulateApiCall() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    totalViews: {
                        value: Math.floor(Math.random() * 1000000),
                        trend: Math.floor(Math.random() * 20) - 10
                    },
                    watchTime: {
                        value: Math.floor(Math.random() * 10000),
                        trend: Math.floor(Math.random() * 20) - 10
                    },
                    engagement: {
                        value: Math.floor(Math.random() * 10000),
                        trend: Math.floor(Math.random() * 20) - 10
                    },
                    growth: {
                        value: Math.floor(Math.random() * 1000),
                        trend: Math.floor(Math.random() * 20) - 10
                    }
                });
            }, 1000);
        });
    }
}

// Initialize Profile Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    window.profileManager = new ProfileManager();
    await window.profileManager.init();
    
    // Add global functions for debugging
    window.refreshProfile = function() {
        if (window.profileManager) {
            window.profileManager.refreshProfile();
        }
    };
    
    window.createTestUser = function() {
        if (window.profileManager) {
            window.profileManager.createTestUser();
        }
    };
    
    window.resetToTechnqsProfile = function() {
        if (window.profileManager) {
            window.profileManager.resetToTechnqsProfile();
        }
    };
    
    window.simulateAppData = function() {
        if (window.profileManager) {
            window.profileManager.simulateAppData();
        }
    };
    
    window.addTestPost = function() {
        if (window.profileManager) {
            window.profileManager.addTestPost();
        }
    };
    
    window.addTestFollower = function() {
        if (window.profileManager) {
            window.profileManager.addTestFollower();
        }
    };
    
    window.addTestFollowing = function() {
        if (window.profileManager) {
            window.profileManager.addTestFollowing();
        }
    };
    
    window.debugSections = function() {
        if (window.profileManager) {
            window.profileManager.debugSections();
        }
    };
    
    window.triggerAppSync = function() {
        if (window.profileManager) {
            window.profileManager.triggerAppSync();
        }
    };
    
    window.clearAppData = function() {
        if (window.profileManager) {
            window.profileManager.clearAppData();
        }
    };
    
    window.clearAllTestData = function() {
        if (window.profileManager) {
            window.profileManager.clearAllTestData();
        }
    };
    
    window.logout = function() {
        if (window.profileManager) {
            window.profileManager.handleLogout();
        }
    };
    
    window.syncEditProfileViewAvatar = function(avatarData) {
        if (window.profileManager) {
            return window.profileManager.syncAvatarFromEditProfileView(avatarData);
        }
    };
    
    // Global functions for app to call
    window.syncAvatarFromApp = function(avatarData) {
        if (window.profileManager) {
            return window.profileManager.syncAvatarFromApp(avatarData);
        }
    };
    
    window.syncProfileFromApp = function(profileData) {
        if (window.profileManager) {
            return window.profileManager.syncProfileFromApp(profileData);
        }
    };
    
    window.getWebsiteProfileData = function() {
        if (window.profileManager) {
            return window.profileManager.profileData;
        }
        return null;
    };
    
    window.testEditProfileViewSync = function() {
        if (window.profileManager) {
            window.profileManager.testEditProfileViewSync();
        }
    };
    
    window.testAvatarDisplay = function() {
        if (window.profileManager) {
            window.profileManager.testAvatarDisplay();
        }
    };
    
    window.testAppAvatarSync = function() {
        if (window.profileManager) {
            window.profileManager.testAppAvatarSync();
        }
    };
    
    console.log('ProfileManager initialized. Available debug functions:');
    console.log('- window.refreshProfile()');
    console.log('- window.createTestUser()');
    console.log('- window.simulateAppData()');
    console.log('- window.triggerAppSync()');
    console.log('- window.clearAppData()');
    console.log('- window.logout()');
    console.log('- window.syncEditProfileViewAvatar(avatarData)');
    console.log('- window.testEditProfileViewSync()');
    console.log('- window.addTestPost()');
    console.log('- window.addTestFollower()');
    console.log('- window.addTestFollowing()');
    console.log('- window.debugSections()');
}); 