document.addEventListener('DOMContentLoaded', async () => {
    const loginPage = document.getElementById('login-page');
    const mainApp = document.getElementById('main-app');

    console.log('Starting initialization...');
    showLoader(); // Show loader as soon as app starts
    loginPage.style.display = 'none';
    mainApp.style.display = 'none';
    
    // --- Supabase Client Initialization ---
    const supabaseUrl = "https://eiqrmxgyyjbndznnbaqv.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcXJteGd5eWpibmR6bm5iYXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1ODk0ODYsImV4cCI6MjA1NjE2NTQ4Nn0.L10Z83pobbfeAId8bCQwxDi83ac37jYum9geSU-htTY";
    const { createClient } = supabase;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // --- Session and State ---
    let currentUser = JSON.parse(sessionStorage.getItem('mealsync_currentUser')) || null;
    let appState = {
        members: [],
        deposits: [],
        meals: [],
        expenses: [],
        notifications: [],
        users: [],
        meal_plans: [],
        messages: [],
        lastUpdated: null,
        user_settings: [],
        announcements: [],
        user_announcement_views: [],
        hasShownNegativeBalanceWarning: false,
        hasShownThresholdWarning: {},
        isAnnouncementPopupOpen: false // New flag
    };


    // --- DOM Elements ---
    const elements = {
        loginPage: document.getElementById('login-page'),
        loginNotification: document.getElementById('login-notification'),
        loginFormContainer: document.getElementById('login-form-container'),
        signupFormContainer: document.getElementById('signup-form-container'),
        toggleSignupBtn: document.getElementById('toggle-signup'),
        mainApp: document.getElementById('main-app'),
        currentDate: document.getElementById('current-date'),
        notification: document.getElementById('notification'),
        toggleThemeBtn: document.getElementById('toggle-theme'),
        

        mealPlannerSection: document.getElementById('meal-planner-section'),
    mealPlannerTableBody: document.querySelector('#meal-planner-table tbody'),
    todayMealCard: document.getElementById('today-meal-card'), // New or update existing
        
    chatToggleBtn: document.getElementById('chat-toggle-btn'),
    chatPopup: document.getElementById('chat-popup'),
    chatCloseBtn: document.getElementById('chat-close-btn'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendMessageBtn: document.getElementById('send-message-btn'),
    resetMessagesBtn: document.getElementById('reset-messages-btn'),


        menuToggle: document.querySelector('.menu-toggle'),
        headerNav: document.querySelector('.header-nav'),
        userStatus: document.getElementById('user-status'),
        userRole: document.getElementById('user-role'),
        logoutBtn: document.getElementById('logout-btn'),
        notificationLogBtn: document.getElementById('notification-log-btn'),
        adminControls: document.getElementById('admin-controls'),
        editAccessControls: document.getElementById('edit-access-controls'),
        passwordControls: document.getElementById('password-controls'),
        resetMonthBtn: document.getElementById('reset-month-btn'),
        exportDataBtn: document.getElementById('export-data-btn'),
        exportFormat: document.getElementById('export-format'),
        totalDeposits: document.getElementById('total-deposits'),
        totalExpenditure: document.getElementById('total-expenditure'),
        currentBalance: document.getElementById('current-balance'),
        todayDayCount: document.getElementById('today-day-count'),
        todayNightCount: document.getElementById('today-night-count'),
        totalMeals: document.getElementById('total-meals'),
        mealRate: document.getElementById('meal-rate'),
        statsTab: document.getElementById('stats-tab'),
        statsContent: document.getElementById('stats-content'),
        userName: document.getElementById('user-name'),
        userDeposit: document.getElementById('user-deposit'),
        userBalance: document.getElementById('user-balance'),
        userMeals: document.getElementById('user-meals'),
        depositHistoryList: document.getElementById('deposit-history-list'),
        userPassword: document.getElementById('user-password'),
        updatePasswordBtn: document.getElementById('update-password-btn'),
        membersList: document.getElementById('members-list'),
        addMemberBtn: document.getElementById('add-member-btn'),
        summarySection: document.getElementById('summary-section'),
        summaryTableBody: document.querySelector('#summary-table tbody'),
        cycleDates: document.getElementById('cycle-dates'),
        mealTableBody: document.querySelector('#meal-table tbody'),
        expensesTableBody: document.querySelector('#expenses-table tbody'),
        addExpenseBtn: document.getElementById('add-expense-btn'),
        addMemberModal: document.getElementById('add-member-modal'),
        addMemberForm: document.getElementById('add-member-form'),
        closeAddMemberModal: document.getElementById('close-add-member-modal'),
        depositFields: document.getElementById('deposit-fields'),
        addDepositBtn: document.getElementById('add-deposit-btn'),
        editMemberModal: document.getElementById('edit-member-modal'),
        editMemberForm: document.getElementById('edit-member-form'),
        closeEditMemberModal: document.getElementById('close-edit-member-modal'),
        editDepositFields: document.getElementById('edit-deposit-fields'),
        editAddDepositBtn: document.getElementById('edit-add-deposit-btn'),
        expenseModal: document.getElementById('expense-modal'),
        expenseForm: document.getElementById('expense-form'),
        closeExpenseModal: document.getElementById('close-expense-modal'),
        expenseMemberSelect: document.getElementById('expense-member'),
        notificationLogModal: document.getElementById('notification-log-modal'),
        closeNotificationLogModal: document.getElementById('close-notification-log-modal'),
        notificationLogList: document.getElementById('notification-log-list'),
        memberSelectContainer: document.getElementById('member-select-container'),
        memberSelect: document.getElementById('member-select'),
        userSelectContainer: document.getElementById('user-select-container'),
        userSelect: document.getElementById('user-select'),
        clearAllNotificationsBtn: document.getElementById('clear-all-notifications-btn'),

            // ... (Keep existing elements, BUT UPDATE THESE) ...
    toggleThemeBtn: document.getElementById('sidebar-toggle-theme'), // Updated ID
    logoutBtn: document.getElementById('sidebar-logout-btn'),    // Updated ID
    notificationLogBtn: document.getElementById('sidebar-notification-log-btn'), // Updated ID
    sidebar: document.getElementById('sidebar'), // New
    sidebarOverlay: document.getElementById('sidebar-overlay'), // New
    closeSidebarBtn: document.getElementById('close-sidebar'), // New
    sidebarUserInfo: document.getElementById('sidebar-user-info'), // New
    // ... (Remove mobileUserInfo if it's no longer used) ...
     menuToggle: document.querySelector('.menu-toggle'),
     headerNav: document.querySelector('.header-nav'), // Keep this for now
     createAnnouncementBtn: document.getElementById('create-announcement-btn'),
     announcementPopup: document.getElementById('announcement-popup'),
     announcementMessages: document.getElementById('announcement-messages'),
     closeAnnouncementPopup: document.getElementById('close-announcement-popup'),
     createAnnouncementModal: document.getElementById('create-announcement-modal'),
     createAnnouncementForm: document.getElementById('create-announcement-form'),
     closeCreateAnnouncementModal: document.getElementById('close-create-announcement-modal'),
     viewAnnouncementsBtn: document.getElementById('view-announcements-btn'),
    announcementsViewPopup: document.getElementById('announcements-view-popup'),
    announcementsViewList: document.getElementById('announcements-view-list'),
    closeAnnouncementsView: document.getElementById('close-announcements-view'),
    mealToggleCard: document.getElementById('meal-toggle-card'),
userDayToggle: document.getElementById('user-day-toggle'),
userNightToggle: document.getElementById('user-night-toggle'),
todayDayCount: document.getElementById('today-day-count'),
    todayNightCount: document.getElementById('today-night-count'),
    totalDeposits: document.getElementById('total-deposits'), // Example, adjust as needed
    totalExpenditure: document.getElementById('total-expenditure'),
    currentBalance: document.getElementById('current-balance'),
    totalMeals: document.getElementById('total-meals'),
    mealRate: document.getElementById('meal-rate')
    // Add other elements as needed
};

        

    let editingMemberId = null;
    let editingExpenseId = null;
    const depositLabels = ['1st', '2nd', '3rd', '4th', '5th'];
    let expensesChart = null;
    let mealsChart = null;

// --- Sidebar Toggle Function ---
function toggleSidebar() {
    elements.sidebar.classList.toggle('sidebar-open');
    elements.sidebarOverlay.classList.toggle('sidebar-open');
}

// --- Collapsible Sections ---
const collapsibleHeaders = document.querySelectorAll('.collapsible-header');

collapsibleHeaders.forEach(header => {
    const content = header.nextElementSibling;

    // Set initial state for header and icon
    if (content.style.display === 'none') {
        header.classList.add('collapsed');
        content.classList.remove('expanded');
        content.style.display = ''; // Remove inline style to let CSS handle it

        // Set icon to "right" (collapsed state)
        const icon = header.querySelector('.toggle-icon i');
        if (icon) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
        }
    } else {
        header.classList.remove('collapsed');
        content.classList.add('expanded');
        content.style.display = '';

        // Set icon to "down" (expanded state)
        const icon = header.querySelector('.toggle-icon i');
        if (icon) {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
        }
    }

    // Click event listener
    header.addEventListener('click', function() {
        this.classList.toggle('collapsed');
        content.classList.toggle('expanded');

        // Explicitly set icon based on state
        const icon = this.querySelector('.toggle-icon i');
        if (icon) {
            if (this.classList.contains('collapsed')) {
                // Collapsed: Show right arrow
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-right');
            } else {
                // Expanded: Show down arrow
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-down');
            }
        }
    });
});

    // --- Utility Functions ---
    function showNotification(message, type = 'success', isLogin = false, details = {}) {
        const target = isLogin ? elements.loginNotification : elements.notification;
        const timestamp = new Date().toLocaleString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
        const editorName = details.editor || (currentUser?.username || 'System'); // Use details.editor if provided
        const fullMessage = `${message} on ${timestamp} by Editor: ${editorName}`;
    
        target.textContent = fullMessage;
        target.className = `notification ${type}`;
        target.style.display = 'block';
        setTimeout(() => target.classList.add('show'), 10);
        setTimeout(() => {
            target.classList.remove('show');
            setTimeout(() => target.style.display = 'none', 300);
        }, 3000);
    
        const importantTypes = [
            'deposit_added', 'deposit_edited', 'deposit_deleted',
            'expense_added', 'expense_edited', 'expense_deleted',
            'manager_access_granted', 'manager_access_revoked',
            'meal_day_on', 'meal_day_off', 'meal_night_on', 'meal_night_off'
        ];
    
        if (!isLogin && importantTypes.includes(details.type)) {
            const notificationData = { 
                message: fullMessage, 
                type, 
                timestamp: new Date().toISOString(),
                related_user: details.userName || null,
                amount: details.amount || null,
                action_type: details.type || null
            };
            console.log('Attempting to insert notification:', notificationData);
            supabaseClient.from('notifications')
                .insert([notificationData])
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Failed to insert notification:', error.message);
                    } else {
                        console.log('Notification inserted successfully:', data);
                        renderNotificationLog(); // Update log immediately
                    }
                })
                .catch(error => console.error('Unexpected error inserting notification:', error));
        }
    }


    function showLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.remove('hidden');
        }
    }
    
    function hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }


    function formatCurrency(amount, isMealRate = false) {
        return isMealRate ? `৳${amount.toFixed(2)}` : `৳${Math.round(amount)}`;
    }


    function formatDateOnly(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            day: 'numeric',       // "2"
            month: 'short',       // "Mar"
            year: 'numeric'       // "2025"
        }).replace(/(\d+) (\w+) (\d+)/, '$1 $2, $3'); // Ensure "2 Mar, 2025"
    }


    function formatDate(dateString) {
        const date = new Date(dateString);
        // Optionally log for debugging
        console.log('Raw UTC:', dateString);
        
        // Adjust to your local timezone (UTC+6)
        const localDate = new Date(date.getTime() + (6 * 60 * 60 * 1000)); // Add 6 hours
        
        return localDate.toLocaleString('en-US', {
            day: 'numeric',       // "2"
            month: 'short',       // "Mar"
            year: 'numeric',      // "2025"
            hour: 'numeric',      // "1"
            minute: '2-digit',    // "28"
            hour12: true          // "AM/PM"
        }).replace(/(\d+) (\w+) (\d+) (\d+:\d+ .M)/, '$1 $2, $3, $4'); // "2 Mar, 2025, 1:28 AM"
    }


    function isToggleTimeAllowed() {
        const now = new Date();
        const hours = now.getHours();
        return hours >= 20 || hours < 18; // 8 PM to 6 PM (for users only)
    }

    function debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
    const debouncedUpdateAllViews = debounce(updateAllViews, 300); // Debounce full UI updates

    function getLocalTime() {
        return new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    }

    function getCycleDates() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return `Current Cycle: ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    // --- Authentication Forms ---
    async function createAuthForms() {
        const { data: users, error } = await supabaseClient.from('users').select('username');
        if (error) {
            showNotification('Failed to load users.', 'error', true);
            return;
        }
        const userOptions = users.map(u => `<option value="${u.username}">${u.username}</option>`).join('');

        elements.loginFormContainer.innerHTML = `
            <form id="login-form" class="modal-form">
                <div class="form-group">
                    <label for="login-username">Username:</label>
                    <select id="login-username" class="select-input" required>${userOptions}</select>
                </div>
                <div class="form-group">
                    <label for="login-password">Password:</label>
                    <input type="password" id="login-password" class="input-field" required>
                </div>
                <div class="form-group">
                    <label><input type="checkbox" id="remember-me"> Remember Me</label>
                </div>
                <button type="submit" class="btn primary-btn"><i class="fas fa-sign-in-alt"></i> Login</button>
            </form>
        `;
        elements.loginFormContainer.querySelector('#login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            login();
        });

        elements.signupFormContainer.innerHTML = `
            <form id="signup-form" class="modal-form">
                <div class="form-group">
                    <label for="signup-username">Username:</label>
                    <input type="text" id="signup-username" class="input-field" required>
                </div>
                <div class="form-group">
                    <label for="signup-password">Password:</label>
                    <input type="password" id="signup-password" class="input-field" required>
                </div>
                <button type="submit" class="btn primary-btn"><i class="fas fa-user-plus"></i> Sign Up</button>
            </form>
        `;
        elements.signupFormContainer.querySelector('#signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            signup();
        });

        elements.toggleSignupBtn.addEventListener('click', () => {
            elements.loginFormContainer.classList.toggle('hidden');
            elements.signupFormContainer.classList.toggle('hidden');
            elements.toggleSignupBtn.textContent = elements.loginFormContainer.classList.contains('hidden') ? 'Back to Login' : 'Need an account? Sign Up';
        });
    }

    // --- Authentication Functions ---
    async function login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
    
        showLoader(); // Show loader when login starts
    
        const { data, error } = await supabaseClient.from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();
    
        if (error || !data) {
            showNotification('Invalid credentials.', 'error', true);
            hideLoader();
            return;
        }
    
        currentUser = data;
        sessionStorage.setItem('mealsync_currentUser', JSON.stringify(currentUser));
        if (rememberMe) {
            await supabaseClient.from('user_settings')
                .update({ auto_login: true })
                .eq('user_id', currentUser.id);
            localStorage.setItem('mealsync_auto_login', btoa(`${username}:${password}`));
        }
        showNotification(`Welcome, ${username}!`, 'success', true);
    
        elements.loginPage.style.display = 'none';
        elements.loginPage.classList.remove('hidden');
        elements.mainApp.style.display = 'block';
        await new Promise(resolve => setTimeout(resolve, 0)); // Ensure DOM updates
    
        await fetchAllData();
        updateUIForRole();
        updateSidebarUserInfo();
        await updateAllViews();
    
        // Trigger the announcement popup right after login
        await showAnnouncementPopup();
    
        const today = new Date().toISOString().split('T')[0];
        const hasViewedToday = appState.user_announcement_views.some(v => 
            v.user_id === currentUser.id && 
            new Date(v.viewed_at).toISOString().split('T')[0] === today
        );
        if (!hasViewedToday) await showAnnouncementPopup();
    
        hideLoader(); // Hide loader once everything is fully loaded
    }
    async function signup() {
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;

        const { data: existingUser } = await supabaseClient.from('users')
            .select('id')
            .eq('username', username)
            .single();
        if (existingUser) {
            showNotification('Username already exists.', 'error', true);
            return;
        }

        const { data: user, error } = await supabaseClient.from('users')
            .insert([{ username, password, role: 'user' }])
            .select()
            .single();
        if (error) {
            showNotification('Signup failed: ' + error.message, 'error', true);
            return;
        }

        await supabaseClient.from('user_settings')
            .insert([{ user_id: user.id, theme: 'light', auto_login: false }]);
        showNotification('Account created! Please log in.', 'success', true);
        elements.signupFormContainer.classList.add('hidden');
        elements.loginFormContainer.classList.remove('hidden');
        elements.toggleSignupBtn.textContent = 'Need an account? Sign Up';
        await createAuthForms();
    }

    async function logout() {
        // Clean up real-time subscriptions
        if (window.realtimeChannels) {
            window.realtimeChannels.forEach(channel => channel.unsubscribe());
        }
        if (window.chatChannel) {
            window.chatChannel.unsubscribe();
        }
        supabaseClient.removeAllChannels(); // Additional safety
    
        localStorage.removeItem('mealsync_auto_login');
        sessionStorage.removeItem('mealsync_currentUser');
        currentUser = null;
        appState = {
            members: [],
            expenses: [],
            deposits: [],
            meals: [],
            messages: [],
            notifications: [],
            user_settings: [],
            users: [],
            user_announcement_views: [],
            hasShownNegativeBalanceWarning: false,
            lastNotificationKey: null
        };
        elements.loginPage.style.display = 'flex';
        elements.mainApp.style.display = 'none';
        await createAuthForms();
        updateSidebarUserInfo();
        showNotification('Logged out successfully.', 'success');
    }


    // --- Update updateMobileUserInfo (Now updateSidebarUserInfo) ---
function updateSidebarUserInfo() { // Renamed function
    if (currentUser) {
        const role = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
        elements.sidebarUserInfo.textContent = `${currentUser.username} (${role})`; // Updated element
    } else {
        elements.sidebarUserInfo.textContent = 'Guest';
    }
}

    // --- Auto-Login Check ---
    async function checkAutoLogin() {
        const autoLoginData = localStorage.getItem('mealsync_auto_login');
        if (autoLoginData) {
            showLoader(); // Show loader during auto-login
            const [username, password] = atob(autoLoginData).split(':');
            const { data: user } = await supabaseClient.from('users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();
            if (user) {
                currentUser = user;
                sessionStorage.setItem('mealsync_currentUser', JSON.stringify(currentUser));
                elements.loginPage.classList.add('hidden');
                elements.mainApp.style.display = 'block';
                await fetchAllData();
                updateUIForRole();
                updateSidebarUserInfo();
                await updateAllViews();
                const today = new Date().toISOString().split('T')[0];
                const hasViewedToday = appState.user_announcement_views.some(v => 
                    v.user_id === currentUser.id && 
                    new Date(v.viewed_at).toISOString().split('T')[0] === today
                );
                if (!hasViewedToday) await showAnnouncementPopup();
            }
            hideLoader(); // Hide loader after auto-login completes
        }
    }


    // --- Theme Toggle ---
    elements.toggleThemeBtn.addEventListener('click', async () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        elements.toggleThemeBtn.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
        localStorage.setItem('mealsync_theme', isDark ? 'dark' : 'light');
        if (currentUser) {
          await supabaseClient.from('user_settings')
            .update({ theme: isDark ? 'dark' : 'light' })
            .eq('user_id', currentUser.id);
        }
      });


    if (localStorage.getItem('mealsync_theme') === 'dark') {
        document.body.classList.add('dark-mode');
        elements.toggleThemeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // --- Initial Setup ---
elements.currentDate.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});
elements.cycleDates.textContent = getCycleDates();


function updateUIForRole() {
    console.log('Updating UI for role:', currentUser ? currentUser.role : 'No user');
    elements.userStatus.textContent = currentUser ? `Logged in as: ${currentUser.username}` : '';
    elements.userRole.textContent = currentUser ? `Role: ${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}` : '';
    const isAdmin = currentUser?.role === 'admin';
    const isManager = currentUser?.role === 'manager';
    const canEdit = isAdmin || isManager;

    elements.addMemberBtn.classList.toggle('hidden', !isAdmin);
    elements.addExpenseBtn.classList.toggle('hidden', !canEdit);
    elements.adminControls.classList.toggle('hidden', !isAdmin);
    elements.summarySection.classList.toggle('hidden', !canEdit);
    document.getElementById('user-overview').classList.toggle('hidden', isAdmin); // Add this line

    elements.memberSelectContainer.classList.toggle('hidden', !(isAdmin || isManager));
    if (isAdmin || isManager) {
        if (appState.members && appState.members.length > 0) {
            populateMemberSelect(isAdmin || isManager);
        } else {
            console.warn('No members available in appState for dropdown');
            elements.memberSelectContainer.classList.add('hidden');
        }
    }

    elements.userSelectContainer.classList.toggle('hidden', !isAdmin);
    if (isAdmin) {
        if (appState.users && appState.users.length > 0) {
            populateUserSelect();
        } else {
            console.warn('No users available in appState for dropdown');
            elements.userSelectContainer.classList.add('hidden');
        }
    }

    document.querySelectorAll('.member-card .actions').forEach(actions => {
        const memberId = actions.closest('.member-card').dataset.id;
        if (isAdmin) {
            actions.innerHTML = `
                <button class="btn primary-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn danger-btn delete-btn"><i class="fas fa-trash"></i> Delete</button>
            `;
        } else if (isManager) {
            actions.innerHTML = `
                <button class="btn primary-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
            `;
        } else {
            actions.innerHTML = '';
        }
    });
    
    // --- Button Visibility Logic ---
    elements.addMemberBtn.style.display = isAdmin ? 'block' : 'none'; // Add Member
    elements.addExpenseBtn.style.display = canEdit ? 'block' : 'none';  // Add Expense
    elements.clearAllNotificationsBtn.style.display = isAdmin ? 'block' : 'none'; // Clear All Notifications


    updateSidebarUserInfo();
}
async function populateMemberSelect(isAdmin, isManager) {
    console.log('Populating member select:', appState.members);
    if (!appState.members || appState.members.length === 0) {
        elements.memberSelect.innerHTML = '<option value="">No members available</option>';
        return;
    }

    const members = appState.members;
    elements.memberSelect.innerHTML = members.map(m => `
        <option value="${m.id}">${m.name}</option>
    `).join('');

    // Set default selection
    if (isAdmin) {
        elements.memberSelect.value = members[0]?.id || '';
    } else if (isManager) {
        elements.memberSelect.value = currentUser.member_id || '';
    }

    // Remove existing event listener to prevent duplicates
    elements.memberSelect.removeEventListener('change', handleMemberSelectChange);
    // Add event listener to update member card on selection change
    elements.memberSelect.addEventListener('change', handleMemberSelectChange);
}

    async function populateUserSelect() {
        console.log('Populating user select:', appState.users);
        if (!appState.users || appState.users.length === 0) {
            elements.userSelect.innerHTML = '<option value="">No users available</option>';
            return;
        }

        const users = appState.users;
        elements.userSelect.innerHTML = users.map(u => `
            <option value="${u.id}">${u.username}</option>
        `).join('');

        // Set default selection to the first user for admins
        elements.userSelect.value = users[0]?.id || '';

        // Remove existing event listener to prevent duplicates
        elements.userSelect.removeEventListener('change', handleUserSelectChange);
        // Add event listener to update password card on selection change
        elements.userSelect.addEventListener('change', handleUserSelectChange);
    }

    // New handler functions for dropdown changes
    async function handleMemberSelectChange() {
        console.log('Member select changed to:', elements.memberSelect.value);
        await renderMembers(); // Re-render to show only the selected member
    }

    async function handleUserSelectChange() {
        console.log('User select changed to:', elements.userSelect.value);
        await renderAdminControls(); // Re-render to show only the selected user's password card
    }

// --- Event Listeners ---
    elements.addMemberBtn.addEventListener('click', () => openModal(elements.addMemberModal));
    elements.closeAddMemberModal.addEventListener('click', () => closeModal(elements.addMemberModal));

    //   - Add listeners for overlay and close button
elements.menuToggle.addEventListener('click', toggleSidebar);
elements.sidebarOverlay.addEventListener('click', toggleSidebar);
elements.closeSidebarBtn.addEventListener('click', toggleSidebar);



    // NEW: Event Delegation for Sidebar Links and Buttons
    // Sidebar Link Click Handler (Modified)
    elements.sidebar.addEventListener('click', (event) => {
        const target = event.target.closest('.sidebar-link');
        if (target) {
            if (target.id === 'view-announcements-btn') {
                showAnnouncementsViewPopup();
                toggleSidebar(); // Explicitly collapse sidebar
            } else {
                const targetSectionId = target.dataset.section;
                const targetSection = document.getElementById(targetSectionId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    const collapsibleHeader = targetSection.querySelector('.collapsible-header');
                    if (collapsibleHeader && collapsibleHeader.classList.contains('collapsed')) {
                        collapsibleHeader.click();
                    }
                }
                toggleSidebar();
            }
        }
        if (event.target.closest('.sidebar-actions button') || event.target.id === 'create-announcement-btn') {
            toggleSidebar();
        }
    });


    elements.addMemberForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addMember();
    });
    elements.addDepositBtn.addEventListener('click', () => addDepositField(elements.depositFields));
    elements.editAddDepositBtn.addEventListener('click', () => addDepositField(elements.editDepositFields));
    elements.closeEditMemberModal.addEventListener('click', () => closeModal(elements.editMemberModal));
    elements.editMemberForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateMember();
    });
    elements.addExpenseBtn.addEventListener('click', () => openModal(elements.expenseModal));
    elements.closeExpenseModal.addEventListener('click', () => closeModal(elements.expenseModal));
    elements.expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        editingExpenseId ? await updateExpense() : await addExpense();
    });
    elements.updatePasswordBtn.addEventListener('click', async () => {
        const newPassword = elements.userPassword.value.trim();
        if (!newPassword) {
            showNotification('Please enter a new password.', 'error');
            return;
        }
        const { error } = await supabaseClient.from('users')
            .update({ password: newPassword })
            .eq('id', currentUser.id);
        if (error) {
            showNotification('Failed to update password: ' + error.message, 'error');
            return;
        }
        currentUser.password = newPassword;
        sessionStorage.setItem('mealsync_currentUser', JSON.stringify(currentUser));
        elements.userPassword.value = '';
        showNotification('Password updated successfully!', 'success');
    });
    elements.notificationLogBtn.addEventListener('click', () => openModal(elements.notificationLogModal));
    elements.closeNotificationLogModal.addEventListener('click', () => closeModal(elements.notificationLogModal));
    elements.logoutBtn.addEventListener('click', logout); // Added here

    elements.statsTab.addEventListener('click', () => {
        elements.statsTab.classList.add('active');
        elements.statsContent.classList.remove('hidden');
    });
    elements.exportDataBtn.addEventListener('click', exportData);
    elements.resetMonthBtn.addEventListener('click', resetMonth);

    // --- Modal Functions ---
    function openModal(modal) {
        modal.style.display = 'block';
        elements.headerNav.classList.remove('active');
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        if (modal === elements.addMemberModal) {
            elements.addMemberForm.reset();
            elements.depositFields.innerHTML = '';
        }
        if (modal === elements.expenseModal) elements.expenseForm.reset();
    }

    function addDepositField(container) {
        const existingFields = container.querySelectorAll('.form-group').length; // Count existing fields
        if (existingFields >= 5) {
            showNotification('Maximum of 5 deposit fields allowed.', 'error');
            return;
        }
    
        const existingLabels = Array.from(container.querySelectorAll('input')).map(input => input.dataset.label);
        const nextLabel = depositLabels.find(label => !existingLabels.includes(label));
        if (!nextLabel) {
            showNotification('No more deposit fields available.', 'error');
            return;
        }
    
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label for="deposit-${nextLabel}">${nextLabel}:</label>
            <input type="number" id="deposit-${nextLabel}" class="input-field" value="0" step="1" data-label="${nextLabel}">
        `;
        container.appendChild(div);
    }
    // --- Data Fetching ---
    async function fetchAllData() {
        const tables = {
            'members': 'created_at',
            'deposits': 'created_at',
            'meals': 'created_at',
            'expenses': 'created_at',
            'notifications': 'created_at',
            'users': 'created_at',
            'meal_plans': 'created_at',
            'messages': 'created_at',
            'announcements': 'created_at',
            'user_announcement_views': 'viewed_at'
        };
    
        for (const [table, sortColumn] of Object.entries(tables)) {
            const { data, error } = await supabaseClient
                .from(table)
                .select('*')
                .order(sortColumn, { ascending: false });
            if (error) {
                console.error(`Error fetching ${table}:`, error.message);
                showNotification(`Error fetching ${table}: ${error.message}`, 'error');
                continue;
            }
            appState[table] = data;
        }
        appState.lastUpdated = Date.now();
        localStorage.setItem('mealsync_cache', JSON.stringify(appState));
    }



    // --- announcements ---
    async function showAnnouncementPopup() {
        const today = new Date().toISOString().split('T')[0];
        const unseenAnnouncements = appState.announcements.filter(a => {
            const viewed = appState.user_announcement_views.find(v => 
                v.user_id === currentUser.id && 
                v.announcement_id === a.id && 
                new Date(v.viewed_at).toISOString().split('T')[0] === today
            );
            return !viewed;
        });
    
        if (unseenAnnouncements.length === 0) return;
    
        // Mark as viewed first
        const viewEntries = unseenAnnouncements.map(a => ({
            user_id: currentUser.id,
            announcement_id: a.id,
            viewed_at: new Date().toISOString()
        }));
        const { data, error } = await supabaseClient
        .from('user_announcement_views')
        .upsert(viewEntries, { onConflict: ['user_id', 'announcement_id'] }) // Prevent duplicate errors
        .select();
    
        if (error) {
            console.error('Error marking announcements as viewed:', error.message);
            showNotification('Failed to record announcement view.', 'error');
            return;
        }
        appState.user_announcement_views.push(...data);
    
        // Then show popup
        elements.announcementMessages.innerHTML = unseenAnnouncements.map(a => {
            const announcer = appState.users.find(u => u.id === a.announcer_id)?.username || 'Unknown';
            return `
                <div class="announcement-item">
                    <p><strong>${announcer}:</strong> ${a.message}</p>
                    <div class="date">${formatDate(a.created_at)}</div>
                </div>
            `;
        }).join('');
    
        appState.isAnnouncementPopupOpen = true;
        elements.announcementPopup.style.display = 'block';
    
        const closeOnClickOutside = (e) => {
            if (!elements.announcementPopup.querySelector('.modal-content').contains(e.target)) {
                elements.announcementPopup.style.display = 'none';
                appState.isAnnouncementPopupOpen = false;
                document.removeEventListener('click', closeOnClickOutside);
                if (currentUser.role === 'user') {
                    updateUserOverview();
                }
            }
        };
        setTimeout(() => document.addEventListener('click', closeOnClickOutside), 0);
    }

// Update existing close button listener
elements.closeAnnouncementPopup.addEventListener('click', () => {
    elements.announcementPopup.style.display = 'none';
    appState.isAnnouncementPopupOpen = false;

    // Now trigger balance warning if needed
    if (appState.showBalanceWarningAfterPopup) {
        setTimeout(() => {
            showNotification('Warning: Your balance is negative!', 'error');
            appState.hasShownNegativeBalanceWarning = true;
            appState.showBalanceWarningAfterPopup = false;
        }, 500); // Add slight delay for smoother transition
    }
});

document.getElementById('clear-all-announcements-btn').addEventListener('click', clearAllAnnouncements);


    elements.createAnnouncementBtn.addEventListener('click', () => {
        elements.createAnnouncementModal.style.display = 'block';
    });
    
    elements.closeCreateAnnouncementModal.addEventListener('click', () => {
        elements.createAnnouncementModal.style.display = 'none';
        elements.createAnnouncementForm.reset();
    });
    
    elements.createAnnouncementForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = document.getElementById('announcement-message').value.trim();
        if (!message) {
            showNotification('Please enter an announcement message.', 'error');
            return;
        }
    
        const { data, error } = await supabaseClient.from('announcements')
            .insert([{ message, announcer_id: currentUser.id }])
            .select()
            .single();
        if (error) {
            showNotification('Failed to create announcement: ' + error.message, 'error');
            return;
        }
    
        appState.announcements.unshift(data);
        showNotification('Announcement created successfully!', 'success');
        elements.createAnnouncementModal.style.display = 'none';
        elements.createAnnouncementForm.reset();
    });

    
    async function showAnnouncementsViewPopup() {
        const canEdit = currentUser.role === 'admin' || currentUser.role === 'manager';
        elements.announcementsViewList.innerHTML = appState.announcements.map(a => {
            const announcer = appState.users.find(u => u.id === a.announcer_id)?.username || 'Unknown';
            const isEditable = canEdit || a.announcer_id === currentUser.id;
            return `
                <div class="announcement-item" data-id="${a.id}">
                    <p><strong>${announcer}:</strong> </p>
                    <div><span class="message">${a.message}</span></div>
                    <div class="date">${formatDate(a.created_at)}</div>
                    ${isEditable ? `
                    <div class="actions">
                        <button class="btn primary-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn danger-btn delete-btn"><i class="fas fa-trash"></i> Delete</button>
                    </div>` : ''}
                </div>
            `;
        }).join('');
    
        elements.announcementsViewPopup.style.display = 'block';

        

    
        // Add close button listener
        elements.closeAnnouncementsView.addEventListener('click', () => {
            elements.announcementsViewPopup.style.display = 'none';
        }, { once: true }); // Use once to avoid duplicate listeners


            // Show "Clear All" button only if the user is admin or manager
    const clearAllBtn = document.getElementById('clear-all-announcements-btn');
    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
        clearAllBtn.classList.remove('hidden'); // Show the button
    } else {
        clearAllBtn.classList.add('hidden'); // Hide the button
    }

    // Ensure event listener is added only once
    clearAllBtn.removeEventListener('click', clearAllAnnouncements);
    clearAllBtn.addEventListener('click', clearAllAnnouncements);
    
        // Add click-outside listener
        const closeOnClickOutside = (e) => {
            if (!elements.announcementsViewPopup.querySelector('.modal-content').contains(e.target)) {
                elements.announcementsViewPopup.style.display = 'none';
                document.removeEventListener('click', closeOnClickOutside);
            }
        };


        setTimeout(() => document.addEventListener('click', closeOnClickOutside), 0);
    
        // Add edit/delete listeners
        elements.announcementsViewList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.closest('.announcement-item').dataset.id);
                editAnnouncement(id);
            });
        });
        elements.announcementsViewList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.closest('.announcement-item').dataset.id);
                deleteAnnouncement(id);
            });
        });
    }
    
    async function editAnnouncement(id) {
        const announcement = appState.announcements.find(a => a.id === id);
        const item = elements.announcementsViewList.querySelector(`.announcement-item[data-id="${id}"]`);
        item.innerHTML = `
            <div class="form-group">
                <label>Message:</label>
                <textarea class="input-field" rows="3">${announcement.message}</textarea>
            </div>
            <div class="actions">
                <button class="btn primary-btn save-btn"><i class="fas fa-save"></i> Save</button>
                <button class="btn secondary-btn cancel-btn"><i class="fas fa-times"></i> Cancel</button>
            </div>
        `;
    
        item.querySelector('.save-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            const newMessage = item.querySelector('textarea').value.trim();
            if (!newMessage) {
                showNotification('Message cannot be empty.', 'error');
                return;
            }
            await supabaseClient.from('announcements')
                .update({ message: newMessage, updated_at: new Date().toISOString() })
                .eq('id', id);
            announcement.message = newMessage;
            showNotification('Announcement updated successfully!', 'success');
            showAnnouncementsViewPopup();
        });
    
        item.querySelector('.cancel-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showAnnouncementsViewPopup();
        });
    }
    
    async function deleteAnnouncement(id) {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        await supabaseClient.from('announcements').delete().eq('id', id);
        await supabaseClient.from('user_announcement_views').delete().eq('announcement_id', id);
        appState.announcements = appState.announcements.filter(a => a.id !== id);
        await fetchAllData();
        showNotification('Announcement deleted successfully!', 'success');
        showAnnouncementsViewPopup();
    }


    async function clearAllAnnouncements() {
        if (!confirm("Are you sure you want to delete all announcements?")) return;
    
        try {
            // Check user role
            if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
                showNotification('Only admins or managers can clear announcements.', 'error');
                return;
            }
    
            // Step 1: Delete all user_announcement_views first (dependent table)
            const { error: viewError } = await supabaseClient
                .from('user_announcement_views')
                .delete()
                .neq('id', 0); // Match all rows
    
            if (viewError) {
                throw new Error(`Failed to delete announcement views: ${viewError.message}`);
            }
    
            // Step 2: Delete all announcements (now safe to do)
            const { error: announceError } = await supabaseClient
                .from('announcements')
                .delete()
                .neq('id', 0); // Match all rows
    
            if (announceError) {
                throw new Error(`Failed to delete announcements: ${announceError.message}`);
            }
    
            // Update appState
            appState.user_announcement_views = [];
            appState.announcements = [];
    
            // Refresh UI
            await fetchAllData(); // Ensure full sync with database
            showAnnouncementsViewPopup();
            showNotification('All announcements cleared successfully!', 'success');
        } catch (error) {
            console.error('Clear announcements error:', error.message);
            showNotification(`Failed to clear announcements: ${error.message}`, 'error');
        }
    }



    // --- Member Functions ---
    async function addMember() {
        if (currentUser?.role !== 'admin') return;
        const name = document.getElementById('member-name').value.trim();
        const username = document.getElementById('member-username').value.trim();
        const password = document.getElementById('member-password').value;
        const preMonthBalance = parseFloat(document.getElementById('pre-month-balance').value) || 0;
    
        if (!name || !username || !password) {
            showNotification('Please fill all required fields.', 'error');
            return;
        }
    
        // Immediate UI feedback
        closeModal(elements.addMemberModal); // Close modal instantly
        showNotification(`${name} added successfully!`, 'success'); // Show success immediately
    
        // Async operations in the background
        const { data: existingMember } = await supabaseClient.from('members')
            .select('id')
            .eq('name', name)
            .single();
        if (existingMember) {
            showNotification('Member name already exists.', 'error');
            return;
        }
    
        const { data: existingUser } = await supabaseClient.from('users')
            .select('id')
            .eq('username', username)
            .single();
        if (existingUser) {
            showNotification('Username already exists.', 'error');
            return;
        }
    
        const { data: member } = await supabaseClient.from('members')
            .insert([{ name, pre_month_balance: preMonthBalance, day_status: true, night_status: true }])
            .select()
            .single();
    
        const { data: user } = await supabaseClient.from('users')
            .insert([{ username, password, role: 'user', member_id: member.id }])
            .select()
            .single();
    
        await supabaseClient.from('user_settings')
            .insert([{ user_id: user.id, theme: 'light', auto_login: false }]);
    
        const deposits = {};
        elements.depositFields.querySelectorAll('input').forEach(input => {
            deposits[input.dataset.label] = parseFloat(input.value) || 0;
        });
        const depositEntries = Object.entries(deposits).map(([label, amount]) => ({
            member_id: member.id,
            label,
            amount
        }));
    
        if (depositEntries.length > 0) {
            await supabaseClient.from('deposits').insert(depositEntries);
            depositEntries.forEach(entry => {
                showNotification(`${name} deposits BDT ${entry.amount} added`, 'success', false, {
                    userName: name,
                    amount: entry.amount,
                    type: 'deposit_added'
                });
            });
            appState.hasShownNegativeBalanceWarning = false;
        }
    
        // Update appState locally
        appState.members.push(member);
        appState.users.push(user);
        appState.deposits.push(...depositEntries);
    
        // Targeted UI update
        await renderMembers();
        await createAuthForms(); // Refresh login/signup dropdowns
    }


    async function updateMember() {
        if (currentUser?.role !== 'admin' && currentUser?.role !== 'manager') return;
    
        const member = appState.members.find(m => m.id === editingMemberId);
        const user = appState.users.find(u => u.member_id === editingMemberId);
    
        const name = document.getElementById('edit-member-name').value.trim();
        const username = document.getElementById('edit-member-username').value.trim();
        const preMonthBalance = parseFloat(document.getElementById('edit-pre-month-balance').value) || 0;
    
        // Immediate UI feedback
        closeModal(elements.editMemberModal); // Close modal instantly
        showNotification(`${name} updated successfully!`, 'success');
    
        // Async operations in the background
        if (name !== member.name) {
            const { data: existingMember } = await supabaseClient.from('members')
                .select('id')
                .eq('name', name)
                .single();
            if (existingMember) {
                showNotification('Member name already exists.', 'error');
                return;
            }
        }
    
        if (username !== user.username) {
            const { data: existingUser } = await supabaseClient.from('users')
                .select('id')
                .eq('username', username)
                .single();
            if (existingUser) {
                showNotification('Username already exists.', 'error');
                return;
            }
        }
    
        const memberUpdate = { name, pre_month_balance: preMonthBalance };
        await supabaseClient.from('members')
            .update(memberUpdate)
            .eq('id', editingMemberId);
    
        const userUpdate = { username };
        if (currentUser.role === 'admin') {
            const password = document.getElementById('edit-member-password').value || undefined;
            if (password) userUpdate.password = password;
        }
        await supabaseClient.from('users')
            .update(userUpdate)
            .eq('id', user.id);
    
        const deposits = {};
        elements.editDepositFields.querySelectorAll('input').forEach(input => {
            deposits[input.dataset.label] = parseFloat(input.value) || 0;
        });
        await supabaseClient.from('deposits').delete().eq('member_id', editingMemberId);
        const depositEntries = Object.entries(deposits).map(([label, amount]) => ({
            member_id: editingMemberId,
            label,
            amount
        }));
        if (depositEntries.length > 0) {
            await supabaseClient.from('deposits').insert(depositEntries);
            depositEntries.forEach(entry => {
                showNotification(`${name} deposits BDT ${entry.amount} edited`, 'success', false, {
                    userName: name,
                    amount: entry.amount,
                    type: 'deposit_edited'
                });
            });
        }
    
        // Update appState locally
        Object.assign(member, memberUpdate);
        Object.assign(user, userUpdate);
        appState.deposits = appState.deposits.filter(d => d.member_id !== editingMemberId).concat(depositEntries);
    
        // Targeted UI update
        await renderMembers();
        await updateDashboard();
        await createAuthForms();
    }

    async function editMember(id) {
        if (currentUser?.role !== 'admin' && currentUser?.role !== 'manager') return;
        const member = appState.members.find(m => m.id === id);
        const user = appState.users.find(u => u.member_id === id);

        editingMemberId = id;
        document.getElementById('edit-member-name').value = member.name;
        document.getElementById('edit-member-username').value = user.username;
        document.getElementById('edit-pre-month-balance').value = member.pre_month_balance;

        // Optionally restrict password editing for managers
        if (currentUser.role === 'manager') {
            document.getElementById('edit-member-password').disabled = true;
        } else {
            document.getElementById('edit-member-password').value = ''; // Allow password edit for admins
            document.getElementById('edit-member-password').disabled = false;
        }

        elements.editDepositFields.innerHTML = '';
        const memberDeposits = appState.deposits.filter(d => d.member_id === id);
        memberDeposits.forEach(dep => {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `
                <label for="edit-deposit-${dep.label}">${dep.label}:</label>
                <input type="number" id="edit-deposit-${dep.label}" class="input-field" value="${dep.amount}" step="1" data-label="${dep.label}">
            `;
            elements.editDepositFields.appendChild(div);
        });

        openModal(elements.editMemberModal);
    }

    async function deleteMember(id) {
        if (currentUser.role !== 'admin') return;
        if (!confirm('Are you sure you want to delete this member and associated user?')) return;
    
        const member = appState.members.find(m => m.id === id);
        const user = appState.users.find(u => u.member_id === id);
        const deletedDeposits = appState.deposits.filter(d => d.member_id === id);
    
        await supabaseClient.from('deposits').delete().eq('member_id', id);
        await supabaseClient.from('meals').delete().eq('member_id', id);
        await supabaseClient.from('expenses').delete().eq('member_id', id);
        await supabaseClient.from('members').delete().eq('id', id);
        if (user) {
            await supabaseClient.from('user_settings').delete().eq('user_id', user.id);
            await supabaseClient.from('users').delete().eq('id', user.id);
        }
    
        await fetchAllData();
        await updateAllViews();
        deletedDeposits.forEach(dep => {
            showNotification(`${member.name} deposits BDT ${dep.amount} deleted`, 'success', false, {
                userName: member.name,
                amount: dep.amount,
                type: 'deposit_deleted'
            });
        });
        showNotification(`${member.name} deleted successfully!`, 'success');
    }

    function updateUserToggleButtons() {
        if (currentUser.role !== 'user') return;
        const isAllowed = isToggleTimeAllowed();
        document.querySelectorAll('.user-toggle').forEach(btn => {
            if (isAllowed) {
                btn.classList.remove('disabled');
                btn.removeAttribute('disabled');
                btn.style.cursor = 'pointer'; // Explicitly set cursor
                btn.style.opacity = '1'; // Ensure full opacity
            } else {
                btn.classList.add('disabled');
                btn.setAttribute('disabled', 'disabled');
                btn.style.cursor = 'not-allowed'; // Explicitly set cursor
                btn.style.opacity = '0.7'; // Dimmed appearance
            }
        });
    }

    async function renderMembers() {
        elements.membersList.innerHTML = '';
        const isAdmin = currentUser?.role === 'admin';
        const isManager = currentUser?.role === 'manager';
    
        let visibleMembers;
        if (isAdmin || isManager) {
            const selectedMemberId = parseInt(elements.memberSelect?.value) || (isManager ? currentUser.member_id : appState.members[0]?.id);
            visibleMembers = appState.members.filter(m => m.id === selectedMemberId);
        } else {
            visibleMembers = appState.members.filter(m => m.id === currentUser.member_id);
        }
    
        const isToggleAllowed = isToggleTimeAllowed();
    
        for (const member of visibleMembers) {
            const totalMeals = await calculateTotalMeals(member.id);
            const totalDeposit = await calculateTotalDeposit(member.id);
            const totalCost = await calculateTotalCost(member.id);
            const balance = totalDeposit - totalCost;
            const balanceClass = balance >= 0 ? 'positive' : 'negative';
            const totalBazar = await calculateTotalBazar(member.id);
    
            const card = document.createElement('div');
            card.className = 'member-card';
            card.dataset.id = member.id;
    
            const isOwnCard = currentUser.role === 'user' && member.id === currentUser.member_id;
            const toggleClass = isOwnCard ? `user-toggle ${isToggleAllowed ? '' : 'disabled'}` : '';
    
            card.innerHTML = `
                <h3>${member.name}</h3>
                <div class="card-details">
                <div>Deposit <span class="total-deposit"> ${formatCurrency(totalDeposit)}</span></div>
                <div>Balance <span class="balance-text ${balanceClass}">${formatCurrency(balance)}</span></div>
                <div>Meals <span class="total-meals">${totalMeals}</span></div>
                <div>Bazar<span class="total-bazar"> ${totalBazar}</span></div>
                </div>
                <div class="toggles">
                    <button class="toggle-btn ${member.day_status ? 'on' : 'off'} ${toggleClass}" data-type="day">Day ${member.day_status ? '' : '(Off)'}</button>
                    <button class="toggle-btn ${member.night_status ? 'on' : 'off'} ${toggleClass}" data-type="night">Night ${member.night_status ? '' : '(Off)'}</button>
                </div>
                ${(isAdmin || isManager) ? `
                <div class="actions">
                    ${isAdmin ? `
                        <button class="btn primary-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn danger-btn delete-btn"><i class="fas fa-trash"></i> Delete</button>
                    ` : `
                        <button class="btn primary-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
                    `}
                </div>` : ''}
            `;
    
            // Show negative balance warning only if not already shown
            if (balance < 0 && currentUser.role === 'user' && !appState.hasShownNegativeBalanceWarning && !appState.isAnnouncementPopupOpen) {
                showNotification('Warning: Your balance is negative!', 'error');
                appState.hasShownNegativeBalanceWarning = true;
            }
    
            const toggleButtons = card.querySelectorAll('.toggle-btn');
            toggleButtons.forEach(btn => {
                btn.addEventListener('click', () => toggleMealStatus(member, btn.dataset.type));
            });
    
            if (isAdmin) {
                card.querySelector('.edit-btn').addEventListener('click', () => editMember(member.id));
                card.querySelector('.delete-btn').addEventListener('click', () => deleteMember(member.id));
            } else if (isManager) {
                card.querySelector('.edit-btn').addEventListener('click', () => editMember(member.id));
            }
    
            elements.membersList.appendChild(card);
        }
        await populateExpenseSelect();
        updateUserToggleButtons();
    }



    async function toggleMealStatus(member, type) {
        const statusKey = type === 'day' ? 'day_status' : 'night_status';
        const newStatus = !member[statusKey];
    
        if (currentUser.role === 'user' && !isToggleTimeAllowed()) {
            showNotification('Meal toggling is only allowed between 8 PM and 6 PM.', 'error');
            return;
        }
    
        await supabaseClient.from('members')
            .update({ [statusKey]: newStatus })
            .eq('id', member.id);
    
        if (currentUser.member_id === member.id) {
            currentUser[statusKey] = newStatus;
            sessionStorage.setItem('mealsync_currentUser', JSON.stringify(currentUser));
        }
    
        const memberIndex = appState.members.findIndex(m => m.id === member.id);
        appState.members[memberIndex][statusKey] = newStatus;
    
        const mealType = type === 'day' ? 'Day Meal' : 'Night Meal';
        const action = newStatus ? 'turned ON' : 'turned OFF';
        showNotification(`${mealType} ${action} for ${member.name}`, 'success', false, {
            userName: member.name,
            type: `meal_${type}_${newStatus ? 'on' : 'off'}`,
            editor: currentUser.username
        });
    
        // Update UI immediately
        await renderMembers();
        await renderSummary();
        await updateDashboard(); // Ensure dashboard updates
        await updateMealToggleCard(); // Sync toggle card
    }


    // --- Expense Functions ---
    async function openExpenseModal(expenseId = null) {
        if (!currentUser.can_edit && currentUser.role !== 'admin' && currentUser.role !== 'manager') return;
        editingExpenseId = expenseId;
        const title = expenseId ? 'Edit Expense' : 'Add Expense';
        elements.expenseModal.querySelector('h2').textContent = `<i class="fas fa-receipt"></i> ${title}`;

        if (expenseId) {
            const expense = appState.expenses.find(e => e.id === expenseId);
            document.getElementById('expense-date').value = expense.date;
            document.getElementById('expense-member').value = expense.member_id;
            document.getElementById('expense-amount').value = expense.amount;
        } else {
            elements.expenseForm.reset();
        }

        await populateExpenseSelect();
        openModal(elements.expenseModal);
    }

    async function addExpense() {
        if (!currentUser.can_edit && currentUser.role !== 'admin' && currentUser.role !== 'manager') return;
        const date = document.getElementById('expense-date').value;
        const memberId = parseInt(document.getElementById('expense-member').value);
        const amount = parseFloat(document.getElementById('expense-amount').value);
    
        if (!date || isNaN(memberId) || isNaN(amount)) {
            showNotification('Please fill all fields.', 'error');
            return;
        }
    
        // Immediate UI feedback
        closeModal(elements.expenseModal); // Close modal instantly
        const member = appState.members.find(m => m.id === memberId);
        showNotification(`${member.name} made an expense of BDT ${amount}`, 'success', false, {
            userName: member.name,
            amount,
            type: 'expense_added'
        });
    
        // Async operation in the background
        const { data: expense } = await supabaseClient.from('expenses')
            .insert([{ member_id: memberId, date, amount }])
            .select()
            .single();
    
        // Update appState locally
        appState.expenses.push(expense);
        appState.hasShownNegativeBalanceWarning = false;
    
        // Targeted UI update
        await renderExpenses();
        await updateDashboard(); // Update totals
    }


async function updateExpense() {
    if (!currentUser.can_edit && currentUser.role !== 'admin' && currentUser.role !== 'manager') return;
    const date = document.getElementById('expense-date').value;
    const memberId = parseInt(document.getElementById('expense-member').value);
    const amount = parseFloat(document.getElementById('expense-amount').value);

    if (!date || isNaN(memberId) || isNaN(amount)) {
        showNotification('Please fill all fields.', 'error');
        return;
    }

    await supabaseClient.from('expenses')
        .update({ date, member_id: memberId, amount })
        .eq('id', editingExpenseId);

    const member = appState.members.find(m => m.id === memberId);
    await fetchAllData();
    await renderExpenses();
    await updateDashboard();
    showNotification(`${member.name} expense edited to BDT ${amount}`, 'success', false, {
        userName: member.name,
        amount,
        type: 'expense_edited'
    });
    closeModal(elements.expenseModal);
}

async function deleteExpense(id) {
    if (!currentUser.can_edit && currentUser.role !== 'admin' && currentUser.role !== 'manager') return;
    if (!confirm('Are you sure you want to delete this expense?')) return;

    const expense = appState.expenses.find(e => e.id === id);
    const member = appState.members.find(m => m.id === expense.member_id);

    await supabaseClient.from('expenses').delete().eq('id', id);
    await fetchAllData();
    await renderExpenses();
    await updateDashboard();
    showNotification(`${member.name} expense of BDT ${expense.amount} deleted`, 'success', false, {
        userName: member.name,
        amount: expense.amount,
        type: 'expense_deleted'
    });
}


async function renderExpenses() {
    elements.expensesTableBody.innerHTML = '';
    for (const expense of appState.expenses) {
        const member = appState.members.find(m => m.id === expense.member_id);
        const row = document.createElement('tr');
        row.dataset.id = expense.id;
        row.innerHTML = `
            <td>${formatDateOnly(expense.date)}</td>
            <td>${member ? member.name : 'Unknown'}</td>
            <td>${formatCurrency(expense.amount)}</td>
            <td>${(currentUser.can_edit || currentUser.role === 'admin' || currentUser.role === 'manager') ? `
                <button class="btn primary-btn edit-btn"><i class="fas fa-edit"></i></button>
                <button class="btn danger-btn delete-btn"><i class="fas fa-trash"></i></button>` : ''}</td>
        `;
        if (currentUser.can_edit || currentUser.role === 'admin' || currentUser.role === 'manager') {
            row.querySelector('.edit-btn').addEventListener('click', () => openExpenseModal(expense.id));
            row.querySelector('.delete-btn').addEventListener('click', () => deleteExpense(expense.id));
        }
        elements.expensesTableBody.appendChild(row);
    }
}

    // --- Meal Tracker ---
    async function renderMealTracker() {
        elements.mealTableBody.innerHTML = '';
        const daysInMonth = 31;

        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Name</th>' + Array.from({ length: daysInMonth }, (_, i) => `<th>${i + 1}</th>`).join('') + '<th>Total</th>';
        elements.mealTableBody.appendChild(headerRow);

        const visibleMembers = currentUser.role === 'admin' || currentUser.role === 'manager'
            ? appState.members
            : appState.members.filter(m => m.id === currentUser.member_id);

        for (const member of visibleMembers) {
            const row = document.createElement('tr');
            row.dataset.memberId = member.id;
            row.innerHTML = `<td>${member.name}</td>`;

            const memberMeals = appState.meals.filter(m => m.member_id === member.id);
            const mealData = {};
            memberMeals.forEach(m => mealData[m.day] = m.count);

            for (let i = 1; i <= daysInMonth; i++) {
                const cell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.min = 0;
                input.value = mealData[i] || 0;
                input.disabled = currentUser.role === 'user' && !currentUser.can_edit;
                input.addEventListener('change', async () => {
                    const newCount = parseInt(input.value) || 0;
                    const existingMeal = appState.meals.find(m => m.member_id === member.id && m.day === i);
                    if (existingMeal) {
                        await supabaseClient.from('meals')
                            .update({ count: newCount })
                            .eq('id', existingMeal.id);
                    } else {
                        await supabaseClient.from('meals')
                            .insert([{ member_id: member.id, day: i, count: newCount }]);
                    }
                    await fetchAllData();
                    updateTotalMeals(row, member.id);
                    await updateDashboard();
                });
                cell.appendChild(input);
                row.appendChild(cell);
            }

            const totalCell = document.createElement('td');
            totalCell.className = 'total-meals';
            totalCell.textContent = await calculateTotalMeals(member.id);
            row.appendChild(totalCell);

            elements.mealTableBody.appendChild(row);
        }
    }

    async function updateTotalMeals(row, memberId) {
        const totalCell = row.querySelector('.total-meals');
        totalCell.textContent = await calculateTotalMeals(memberId);
    }


    // --- Calculations ---
    async function calculateTotalMeals(memberId) {
        const meals = appState.meals.filter(m => m.member_id === memberId);
        return meals.reduce((sum, m) => sum + (m.count || 0), 0);
    }

    async function calculateTotalDeposit(memberId) {
        const member = appState.members.find(m => m.id === memberId);
        const deposits = appState.deposits.filter(d => d.member_id === memberId);
        return Math.round((member.pre_month_balance || 0) + deposits.reduce((sum, d) => sum + (d.amount || 0), 0));
    }

    async function calculateTotalCost(memberId) {
        const totalMeals = await calculateTotalMeals(memberId);
        const totalExpenses = appState.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalMealsCount = appState.meals.reduce((sum, m) => sum + (m.count || 0), 0);
        const mealRate = totalMealsCount ? totalExpenses / totalMealsCount : 0;
        return Math.round(totalMeals * mealRate);
    }

    async function calculateTotalBazar(memberId) {
        return appState.expenses.filter(e => e.member_id === memberId).length;
    }

    // --- Admin Controls ---
    async function renderAdminControls() {
        if (currentUser.role !== 'admin') return;
    
        elements.editAccessControls.innerHTML = '<h3></h3>' + appState.users
            .filter(u => u.role !== 'admin')
            .map(user => `
                <div class="user-toggle">
                    <label>${user.username}</label>
                    <input type="checkbox" ${user.can_edit ? 'checked' : ''} data-user-id="${user.id}">
                </div>
            `).join('');
    
        const selectedUserId = parseInt(elements.userSelect?.value) || (appState.users[0]?.id || '');
        const selectedUser = appState.users.find(u => u.id === selectedUserId);
    
        elements.passwordControls.innerHTML = selectedUser ? `
            <div class="password-input">
                <label>${selectedUser.username}</label>
                <input type="password" data-user-id="${selectedUser.id}" placeholder="New password">
                <button class="btn primary-btn update-password">Update</button>
                ${selectedUser.role !== 'admin' ? `<button class="btn danger-btn delete-user" data-user-id="${selectedUser.id}">Delete</button>` : ''}
            </div>
        ` : '';
    
        elements.editAccessControls.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', async () => {
                const userId = parseInt(input.dataset.userId);
                const newCanEdit = input.checked;
                await supabaseClient.from('users')
                    .update({ can_edit: newCanEdit, role: newCanEdit ? 'manager' : 'user' })
                    .eq('id', userId);
                await fetchAllData();
                if (currentUser.id === userId) {
                    currentUser = appState.users.find(u => u.id === userId);
                    sessionStorage.setItem('mealsync_currentUser', JSON.stringify(currentUser));
                }
                const user = appState.users.find(u => u.id === userId);
                showNotification(`${user.username} ${newCanEdit ? 'granted' : 'revoked'} manager access`, 'success', false, {
                    userName: user.username,
                    type: newCanEdit ? 'manager_access_granted' : 'manager_access_revoked'
                });
                await updateUIForRole();
                await updateAllViews();
            });
        });

        elements.passwordControls.querySelectorAll('.update-password').forEach(btn => {
            btn.addEventListener('click', async () => {
                const input = btn.previousElementSibling;
                const userId = parseInt(input.dataset.userId);
                const newPassword = input.value.trim();
                if (!newPassword) {
                    showNotification('Please enter a new password.', 'error');
                    return;
                }
                await supabaseClient.from('users')
                    .update({ password: newPassword })
                    .eq('id', userId);
                if (userId === currentUser.id) {
                    currentUser.password = newPassword;
                    sessionStorage.setItem('mealsync_currentUser', JSON.stringify(currentUser));
                }
                input.value = '';
                await fetchAllData();
                showNotification(`Password updated for user ${userId}!`, 'success');
            });
        });

        elements.passwordControls.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = parseInt(btn.dataset.userId);
                if (confirm('Are you sure you want to delete this user and associated member?')) {
                    const user = appState.users.find(u => u.id === userId);
                    if (user.member_id) {
                        await deleteMember(user.member_id);
                    } else {
                        await supabaseClient.from('user_settings').delete().eq('user_id', userId);
                        await supabaseClient.from('users').delete().eq('id', userId);
                        await fetchAllData();
                        await renderAdminControls();
                        showNotification('User deleted successfully!', 'success');
                    }
                }
            });
        });
    }

    // --- Dashboard ---
    async function updateDashboard() {
        const totalDeposits = (await Promise.all(appState.members.map(m => calculateTotalDeposit(m.id)))).reduce((sum, d) => sum + (d || 0), 0);
        const totalExpenses = appState.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalMealsCount = appState.meals.reduce((sum, m) => sum + (m.count || 0), 0);
        const mealRate = totalMealsCount ? totalExpenses / totalMealsCount : 0;
    
        const dayCount = appState.members.filter(m => m.day_status).length;
        const nightCount = appState.members.filter(m => m.night_status).length;
    
        console.log('updateDashboard - Day Count:', dayCount, 'Night Count:', nightCount);
    
        if (elements.todayDayCount) {
            elements.todayDayCount.textContent = dayCount;
            console.log('Set today-day-count to:', elements.todayDayCount.textContent);
        } else {
            console.error('today-day-count element not found');
        }
    
        if (elements.todayNightCount) {
            elements.todayNightCount.textContent = nightCount;
            console.log('Set today-night-count to:', elements.todayNightCount.textContent);
        } else {
            console.error('today-night-count element not found');
        }
    
        elements.totalDeposits.textContent = formatCurrency(totalDeposits);
        elements.totalExpenditure.textContent = formatCurrency(totalExpenses);
        elements.currentBalance.textContent = formatCurrency(totalDeposits - totalExpenses);
        elements.totalMeals.textContent = totalMealsCount;
        elements.mealRate.textContent = formatCurrency(mealRate, true);
    
        // Enhanced force re-render
        const mealCountBox = document.querySelector('.meal-count-box');
        if (mealCountBox) {
            mealCountBox.classList.add('hidden'); // Use class toggle for smoother transition
            requestAnimationFrame(() => {
                mealCountBox.classList.remove('hidden');
            });
        }
    
        // Fallback: Direct element refresh
        if (elements.todayDayCount && elements.todayNightCount) {
            elements.todayDayCount.style.display = 'none';
            elements.todayNightCount.style.display = 'none';
            requestAnimationFrame(() => {
                elements.todayDayCount.style.display = '';
                elements.todayNightCount.style.display = '';
            });
        }
    
        await updateTodayMealCard();
    }
    // In setupRealtimeSubscriptions, update the UI update calls to use debouncing where needed


    async function updateTodayMealCard() {
        const today = new Date().toLocaleString('en-US', { weekday: 'long' }); // e.g., "Sunday"
        const plan = appState.meal_plans.find(p => p.day_name === today) || { day_meal: 'Not set', night_meal: 'Not set' };
        if (elements.todayMealCard) {
            elements.todayMealCard.innerHTML = `
                <h3>Today's Meal Plan</h3>
                <p>Day ${plan.day_meal || 'Not set'}</p>
                <p>Night ${plan.night_meal || 'Not set'}</p>
            `;
        } else {
            // Fallback to existing elements if no specific card
            elements.todayDayCount.innerHTML = `<div class="m-count">${appState.members.filter(m => m.day_status).length}</div> (${plan.day_meal || 'Not set'})`;
            elements.todayNightCount.innerHTML = `<div class="m-count">${appState.members.filter(m => m.night_status).length}</div> (${plan.night_meal || 'Not set'})`;
            
            
        }
    }


    async function updateMealToggleCard() {
        if (currentUser?.role === 'admin' || !currentUser?.member_id) {
            elements.mealToggleCard.style.display = 'none';
            return;
        }
    
        const member = appState.members.find(m => m.id === currentUser.member_id);
        if (!member) return;
    
        elements.mealToggleCard.style.display = 'block';
    
        const isAllowed = isToggleTimeAllowed();
        const dayBtn = elements.userDayToggle;
        const nightBtn = elements.userNightToggle;
    
        // Update button states
        dayBtn.classList.toggle('on', member.day_status);
        dayBtn.classList.toggle('off', !member.day_status);
        dayBtn.textContent = `Day ${member.day_status ? 'On' : 'Off'}`;
        dayBtn.classList.toggle('disabled', !isAllowed);
    
        nightBtn.classList.toggle('on', member.night_status);
        nightBtn.classList.toggle('off', !member.night_status);
        nightBtn.textContent = `Night ${member.night_status ? 'On' : 'Off'}`;
        nightBtn.classList.toggle('disabled', !isAllowed);
    
        // Remove and reattach event listeners to prevent duplicates
        const dayBtnClone = dayBtn.cloneNode(true);
        const nightBtnClone = nightBtn.cloneNode(true);
        dayBtn.parentNode.replaceChild(dayBtnClone, dayBtn);
        nightBtn.parentNode.replaceChild(nightBtnClone, nightBtn);
    
        elements.userDayToggle = dayBtnClone;
        elements.userNightToggle = nightBtnClone;
    
        if (isAllowed) {
            dayBtnClone.addEventListener('click', () => toggleMealStatus(member, 'day'));
            nightBtnClone.addEventListener('click', () => toggleMealStatus(member, 'night'));
        }
    
        // Ensure dashboard counts are in sync
        await updateDashboard(); // Add this to sync counts
    }
    // --- User Overview ---
    async function updateUserOverview() {
        if (currentUser.role === 'admin') return; // Skip for admins
    
        if (!currentUser.member_id) {
            elements.userName.textContent = currentUser.username;
            elements.userDeposit.textContent = formatCurrency(0);
            elements.userBalance.textContent = formatCurrency(0);
            elements.userBalance.className = 'balance-text';
            elements.userMeals.textContent = '0';
            elements.depositHistoryList.innerHTML = '<li>No member data</li>';
            return;
        }
    
        const member = appState.members.find(m => m.id === currentUser.member_id);
        if (!member) return;
    
        const totalDeposit = await calculateTotalDeposit(member.id);
        const totalCost = await calculateTotalCost(member.id);
        const balance = totalDeposit - totalCost;
        const balanceClass = balance >= 0 ? 'positive' : 'negative';
    
        const deposits = appState.deposits.filter(d => d.member_id === member.id);
    
        elements.userName.textContent = member.name;
        elements.userDeposit.textContent = formatCurrency(totalDeposit);
        elements.userBalance.textContent = formatCurrency(balance);
        elements.userBalance.className = `balance-text ${balanceClass}`;
        elements.userMeals.textContent = await calculateTotalMeals(member.id);
    
        elements.depositHistoryList.innerHTML = `
            <li>Pre-Month: ${formatCurrency(member.pre_month_balance)}</li>
            ${deposits.map(d => `<li>${d.label}: ${formatCurrency(d.amount)}</li>`).join('')}
        `;
    
        if (balance < 0 && currentUser.role === 'user' && !appState.hasShownNegativeBalanceWarning) {
            if (appState.isAnnouncementPopupOpen) {
                // Delay the warning until the announcement is closed
                appState.showBalanceWarningAfterPopup = true;
            } else {
                showNotification('Warning: Your balance is negative!', 'error');
                appState.hasShownNegativeBalanceWarning = true;
            }
        }
        
    }

    // --- Summary ---
    async function renderSummary() {
        elements.summaryTableBody.innerHTML = '';
        if (!currentUser.can_edit && currentUser.role !== 'admin' && currentUser.role !== 'manager') return;
    
        // Update table header if needed (assuming it’s static in HTML)
        // If dynamic, ensure thead includes: <th>Day</th><th>Night</th> after <th>Name</th>
    
        for (const member of appState.members) {
            const totalMeals = await calculateTotalMeals(member.id);
            const totalDeposit = await calculateTotalDeposit(member.id);
            const totalCost = await calculateTotalCost(member.id);
            const balance = totalDeposit - totalCost;
            const balanceClass = balance >= 0 ? 'positive' : 'negative';
            const totalBazar = await calculateTotalBazar(member.id);
            const memberDeposits = appState.deposits.filter(d => d.member_id === member.id);
            const depositMap = Object.fromEntries(memberDeposits.map(d => [d.label, d.amount]));
    
            const isAllowed = isToggleTimeAllowed() || currentUser.role !== 'user'; // Admins/managers bypass time restriction
            const toggleClass = isAllowed ? '' : 'restricted';
    
            const row = document.createElement('tr');
            row.dataset.memberId = member.id;
            row.innerHTML = `
                <td>${member.name}</td>
                <td><button class="toggle-btn day-toggle ${member.day_status ? 'on' : 'off'} ${toggleClass}" data-state="${member.day_status ? 'on' : 'off'}" data-type="day">Day ${member.day_status ? 'On' : 'Off'}</button></td>
                <td><button class="toggle-btn night-toggle ${member.night_status ? 'on' : 'off'} ${toggleClass}" data-state="${member.night_status ? 'on' : 'off'}" data-type="night">Night ${member.night_status ? 'On' : 'Off'}</button></td>
                <td>${totalMeals}</td>
                <td>${formatCurrency(totalCost)}</td>
                <td>${formatCurrency(totalDeposit)}</td>
                <td><span class="balance-text ${balanceClass}">${formatCurrency(balance)}</span></td>
                <td>${formatCurrency(member.pre_month_balance)}</td>
                <td>${formatCurrency(depositMap['1st'] || 0)}</td>
                <td>${formatCurrency(depositMap['2nd'] || 0)}</td>
                <td>${formatCurrency(depositMap['3rd'] || 0)}</td>
                <td>${formatCurrency(depositMap['4th'] || 0)}</td>
                <td>${formatCurrency(depositMap['5th'] || 0)}</td>
                <td>${totalBazar}</td>
            `;
            elements.summaryTableBody.appendChild(row);
        }
    
        // Add event listeners to toggles
        initializeToggleListeners();
    }


    function initializeToggleListeners() {
        document.querySelectorAll('#summary-table .toggle-btn').forEach(toggle => {
            toggle.addEventListener('click', () => {
                if (!toggle.classList.contains('restricted')) {
                    const memberId = parseInt(toggle.closest('tr').dataset.memberId);
                    const member = appState.members.find(m => m.id === memberId);
                    const type = toggle.dataset.type;
                    toggleMealStatus(member, type); // Reuse existing function
                }
            });
        });
    }


    function syncTogglesWithMealToggle() {
        const mealToggle = document.querySelector('#meal-toggle'); // Add this to your dashboard HTML
        if (!mealToggle) return;
    
        mealToggle.addEventListener('click', async () => {
            const isOn = mealToggle.classList.contains('on');
            const updates = appState.members.map(member => ({
                id: member.id,
                day_status: isOn,
                night_status: isOn
            }));
    
            // Update Supabase
            await supabaseClient.from('members')
                .upsert(updates, { onConflict: 'id' });
    
            // Update appState
            appState.members.forEach(member => {
                member.day_status = isOn;
                member.night_status = isOn;
            });
    
            // Notify
            showNotification(`All meals turned ${isOn ? 'ON' : 'OFF'}`, 'success', false, {
                type: `meal_all_${isOn ? 'on' : 'off'}`,
                editor: currentUser.username
            });
    
            // Refresh UI
            await renderSummary();
            await renderMembers();
            await updateDashboard();
        });
    }


    function isRestrictedPeriod() {
        return !isToggleTimeAllowed(); // Reuse your existing 8 PM to 6 PM logic
    }
    
    function updateToggleRestrictions() {
        const restricted = isRestrictedPeriod() && currentUser.role === 'user'; // Admins/managers bypass
        document.querySelectorAll('#summary-table .toggle-btn').forEach(toggle => {
            toggle.classList.toggle('restricted', restricted);
        });
    }
    
    function startRestrictionCheck() {
        updateToggleRestrictions();
        setInterval(updateToggleRestrictions, 60000); // Check every minute
    }



    async function fetchMealPlans() {
        const { data, error } = await supabaseClient
            .from('meal_plans')
            .select('*')
            .order('id', { ascending: true }); // Consistent order: Sunday to Saturday
        if (error) {
            console.error('Error fetching meal plans:', error.message);
            showNotification('Failed to load meal plans.', 'error');
            return;
        }
        appState.meal_plans = data;
        console.log('Fetched meal plans:', data);
    }

    async function renderMealPlanner() {
        const tbody = elements.mealPlannerTableBody;
        tbody.innerHTML = '';
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'manager';
    
        // Ensure all days exist in appState.meal_plans
        days.forEach(async (day) => {
            let plan = appState.meal_plans.find(p => p.day_name === day);
            if (!plan) {
                // Insert default if missing
                const { data, error } = await supabaseClient
                    .from('meal_plans')
                    .insert([{ day_name: day, day_meal: '', night_meal: '' }])
                    .select()
                    .single();
                if (!error) {
                    appState.meal_plans.push(data);
                    plan = data;
                }
            }
    
            const row = document.createElement('tr');
            row.dataset.day = day;
            row.innerHTML = `
                <td>${day}</td>
                <td><input type="text" class="day-meal" value="${plan.day_meal || ''}" ${canEdit ? '' : 'disabled'}</td>
                <td><input type="text" class="night-meal" value="${plan.night_meal || ''}" ${canEdit ? '' : 'disabled'}</td>
            `;
            tbody.appendChild(row);
    
            if (canEdit) {
                const inputs = row.querySelectorAll('input');
                inputs.forEach(input => {
                    input.addEventListener('change', async () => {
                        const field = input.classList.contains('day-meal') ? 'day_meal' : 'night_meal';
                        const newValue = input.value.trim();
                        await supabaseClient
                            .from('meal_plans')
                            .update({ [field]: newValue, updated_at: new Date().toISOString() })
                            .eq('day_name', day);
                        plan[field] = newValue;
                        showNotification(`${day} ${field.replace('_', ' ')} updated to "${newValue}"`, 'success');
                        await updateTodayMealCard();
                        await updateMealToggleCard(); // Add this line
                    });
                });
            }
        });
    }
//messages section

async function renderMessages() {
    if (!currentUser) return;
    elements.chatMessages.innerHTML = ''; // Clear existing messages
    
    const messages = appState.messages
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    let lastSenderId = null;
    
    messages.forEach(msg => {
        const sender = appState.users.find(u => u.id === msg.sender_id)?.username || 'Unknown';
        const isSelf = msg.sender_id === currentUser.id;
        const sameAsPrevious = msg.sender_id === lastSenderId;
        
        // Create new message container
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        if (isSelf) messageDiv.classList.add('sent');
        else messageDiv.classList.add('received');
        
        // Always include sender name, formatting depends on message type
        const contentHTML = `
            <div class="message-header">
                <span class="message-sender">${sender}</span>
            </div>
            <div class="message-body">${msg.content}</div>
             <span class="message-timestamp">${formatDate(msg.created_at)}</span>
        `;
        
        messageDiv.innerHTML = contentHTML;
        elements.chatMessages.appendChild(messageDiv);
        
        lastSenderId = msg.sender_id;
    });
    
    // Scroll to bottom
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

let isSending = false;


// Add this after the renderMessages function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Replace renderMessages calls with debounced version
const debouncedRenderMessages = debounce(renderMessages, 100); // 100ms debounce

// Update the subscription to use debouncedRenderMessages
function setupMessageSubscription() {
    const channel = supabaseClient.channel('public:messages');
    const subscribeWithRetry = (channel, event, callback, maxRetries = 3, retryDelay = 2000) => {
        let retries = 0;

        const attemptSubscribe = () => {
            channel
                .on('postgres_changes', event, callback)
                .subscribe((status, error) => {
                    console.log('Messages subscription status:', status);
                    if (error) {
                        console.error('Messages subscription error:', error);
                    }
                    if (status === 'TIMED_OUT' && retries < maxRetries) {
                        retries++;
                        console.log(`Retrying messages subscription (${retries}/${maxRetries})...`);
                        setTimeout(() => {
                            channel.unsubscribe();
                            attemptSubscribe();
                        }, retryDelay);
                    } else if (status === 'SUBSCRIBED') {
                        console.log('Subscribed to group chat');
                    }
                });
        };

        attemptSubscribe();
        return channel;
    };

    return subscribeWithRetry(
        channel,
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
            console.log('Messages table updated:', payload);
            const newMessage = payload.new;
            const sender = appState.users.find(u => u.id === newMessage.user_id);
            newMessage.sender = sender?.username || 'Unknown';
            appState.messages.push(newMessage);
            await renderMessages();
        }
    );
}


function setupRealtimeSubscriptions() {
    console.log('Setting up real-time subscriptions...');

    const subscribeWithRetry = (channel, event, callback, maxRetries = 3, retryDelay = 2000) => {
        let retries = 0;

        const attemptSubscribe = () => {
            channel
                .on('postgres_changes', event, callback)
                .subscribe((status, error) => {
                    console.log(`${channel.name} subscription status:`, status);
                    if (error) console.error(`${channel.name} subscription error:`, error);
                    if (status === 'TIMED_OUT' && retries < maxRetries) {
                        retries++;
                        console.log(`Retrying ${channel.name} subscription (${retries}/${maxRetries})...`);
                        setTimeout(() => {
                            channel.unsubscribe();
                            attemptSubscribe();
                        }, retryDelay);
                    }
                });
        };

        attemptSubscribe();
        return channel;
    };

    const membersChannel = subscribeWithRetry(
        supabaseClient.channel('public:members'),
        { event: '*', schema: 'public', table: 'members' },
        async (payload) => {
            console.log('Received payload for members:', payload);
            if (payload.eventType === 'UPDATE') {
                const updatedMember = payload.new;
                const memberIndex = appState.members.findIndex(m => m.id === updatedMember.id);
                if (memberIndex !== -1) {
                    appState.members[memberIndex] = { ...appState.members[memberIndex], ...updatedMember };
                    console.log(`Updated member ${updatedMember.id} in appState`);
                    await updateDashboard(); // Ensure this runs
                    await renderMembers();
                    await renderSummary();
                    debouncedUpdateAllViews();
                    if (currentUser?.member_id === updatedMember.id) {
                        currentUser.day_status = updatedMember.day_status;
                        currentUser.night_status = updatedMember.night_status;
                        sessionStorage.setItem('mealsync_currentUser', JSON.stringify(currentUser));
                        await updateUserOverview();
                    }
                }
            }
        }
    );

    const depositsChannel = subscribeWithRetry(
        supabaseClient.channel('public:deposits'),
        { event: '*', schema: 'public', table: 'deposits' },
        async (payload) => {
            console.log('Deposits table updated:', payload);
            if (payload.eventType === 'INSERT') {
                appState.deposits.push(payload.new);
                await updateDashboard();
                await renderMembers();
            } else if (payload.eventType === 'DELETE') {
                appState.deposits = appState.deposits.filter(d => d.id !== payload.old.id);
                await updateDashboard();
                await renderMembers();
            }
        }
    );

    const expensesChannel = subscribeWithRetry(
        supabaseClient.channel('public:expenses'),
        { event: '*', schema: 'public', table: 'expenses' },
        async (payload) => {
            console.log('Expenses table updated:', payload);
            if (payload.eventType === 'INSERT') {
                appState.expenses.push(payload.new);
                await renderExpenses();
                await updateDashboard();
            }
        }
    );

    return [membersChannel, depositsChannel, expensesChannel];
}


function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function sendMessage() {
    if (isSending || !elements.chatInput.value.trim()) {
        showNotification('Message already sending or empty.', 'error');
        return;
    }

    isSending = true;
    const content = elements.chatInput.value.trim();
    const { data, error } = await supabaseClient
        .from('messages')
        .insert([{ sender_id: currentUser.id, content }])
        .select()
        .single();
    isSending = false;

    if (error) {
        console.error('Error sending message:', error.message);
        showNotification('Failed to send message.', 'error');
        return;
    }

    appState.messages.push(data);
    elements.chatInput.value = '';
    await renderMessages();
    showNotification('Message sent!', 'success');
}
// Update the subscription to use debouncedRenderMessages
function setupMessageSubscription() {
    let channel = supabaseClient
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            console.log('New message received:', payload.new);
            if (!appState.messages.some(msg => msg.id === payload.new.id)) {
                appState.messages.push(payload.new);
                if (!elements.chatPopup.classList.contains('open')) {
                    const sender = appState.users.find(u => u.id === payload.new.sender_id)?.username || 'Unknown';
                    showNotification(`New message from ${sender}: ${payload.new.content}`, 'info');
                }
                debouncedRenderMessages(); // Use debounced version
            }
        })
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log('Subscribed to group chat');
            } else if (err) {
                console.error('Subscription error:', err);
                setTimeout(() => {
                    console.log('Reattempting subscription...');
                    channel.unsubscribe();
                    setupMessageSubscription();
                }, 1000);
            }
        });

    return channel;
}

// Update toggleChatPopup to use debouncedRenderMessages
function toggleChatPopup() {
    elements.chatPopup.classList.toggle('hidden');
    debouncedRenderMessages(); // Use debounced version
    if (!elements.chatPopup.classList.contains('hidden')) {
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
}

async function resetMessages() {
    if (currentUser?.role !== 'admin') {
        showNotification('Only admins can reset messages.', 'error');
        return;
    }

    const { error } = await supabaseClient
        .from('messages')
        .delete()
        .neq('id', 0); // Deletes all rows (Supabase requires a condition)
    if (error) {
        console.error('Error resetting messages:', error.message);
        showNotification('Failed to reset messages.', 'error');
        return;
    }

    appState.messages = [];
    await renderMessages();
    showNotification('All messages have been reset.', 'success');
}


    // --- Populate Expense Select ---
    async function populateExpenseSelect() {
        if (!currentUser.can_edit && currentUser.role !== 'admin' && currentUser.role !== 'manager') return;
        elements.expenseMemberSelect.innerHTML = appState.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    }

    // --- Notification Log ---
async function renderNotificationLog() {
    if (!appState.notifications || appState.notifications.length === 0) {
        elements.notificationLogList.innerHTML = '<div class="log-entry">No notifications available.</div>';
        console.log('No notifications in appState:', appState.notifications);
    } else {
        elements.notificationLogList.innerHTML = appState.notifications.map(n => `
            <div class="log-entry ${n.type}">
                <span>${n.message}</span>
                ${currentUser?.role === 'admin' ? `<button class="btn danger-btn" data-id="${n.id}">x</button>` : ''}
            </div>
        `).join('');
    }

    // Show "Clear All" button only for admins
    if (currentUser?.role === 'admin') {
        elements.clearAllNotificationsBtn.classList.remove('hidden');
    } else {
        elements.clearAllNotificationsBtn.classList.add('hidden');
    }

    // Individual dismiss buttons (only for admins)
    if (currentUser?.role === 'admin') {
        elements.notificationLogList.querySelectorAll('.danger-btn[data-id]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.dataset.id);
                await supabaseClient.from('notifications').delete().eq('id', id);
                await fetchAllData();
                await renderNotificationLog();
            });
        });
    }

    // Clear all notifications button (admin only)
    elements.clearAllNotificationsBtn.removeEventListener('click', clearAllNotificationsHandler); // Prevent duplicate listeners
    elements.clearAllNotificationsBtn.addEventListener('click', clearAllNotificationsHandler);
}
    async function clearAllNotificationsHandler() {
        if (currentUser?.role !== 'admin') return;
        if (!confirm('Are you sure you want to clear all notifications?')) return;
    
        await supabaseClient.from('notifications').delete().neq('id', 0); // Delete all rows
        appState.notifications = []; // Clear local state
        await fetchAllData();
        await renderNotificationLog();
        showNotification('All notifications cleared successfully!', 'success');
    }

    // --- Data Export ---
    async function exportData() {
        if (currentUser.role !== 'admin' && currentUser.role !== 'manager') return;
        const format = elements.exportFormat.value;

        let data, mime, filename;
        if (format === 'csv') {
            const headers = 'Name,Total Meals,Total Cost,Total Deposit,Balance,Pre-Month,1st,2nd,3rd,4th,5th,Total Bazar\n';
            const rows = await Promise.all(appState.members.map(async m => {
                const totalMeals = await calculateTotalMeals(m.id);
                const totalDeposit = await calculateTotalDeposit(m.id);
                const totalCost = await calculateTotalCost(m.id);
                const balance = totalDeposit - totalCost;
                const totalBazar = await calculateTotalBazar(m.id);
                const depositMap = Object.fromEntries(appState.deposits.filter(d => d.member_id === m.id).map(d => [d.label, d.amount]));
                return `${m.name},${totalMeals},${totalCost},${totalDeposit},${balance},${m.pre_month_balance || 0},${depositMap['1st'] || 0},${depositMap['2nd'] || 0},${depositMap['3rd'] || 0},${depositMap['4th'] || 0},${depositMap['5th'] || 0},${totalBazar}`;
            }));
            data = headers + rows.join('\n');
            mime = 'data:text/csv;charset=utf-8,';
            filename = `mealsync_${new Date().toISOString().slice(0, 10)}.csv`;
        } else {
            const exportData = await Promise.all(appState.members.map(async m => {
                const totalMeals = await calculateTotalMeals(m.id);
                const totalDeposit = await calculateTotalDeposit(m.id);
                const totalCost = await calculateTotalCost(m.id);
                const totalBazar = await calculateTotalBazar(m.id);
                return {
                    name: m.name,
                    totalMeals,
                    totalCost,
                    totalDeposit,
                    balance: totalDeposit - totalCost,
                    preMonthBalance: m.pre_month_balance,
                    deposits: Object.fromEntries(appState.deposits.filter(d => d.member_id === m.id).map(d => [d.label, d.amount])),
                    totalBazar
                };
            }));
            data = JSON.stringify(exportData, null, 2);
            mime = 'data:application/json;charset=utf-8,';
            filename = `mealsync_${new Date().toISOString().slice(0, 10)}.json`;
        }

        const link = document.createElement('a');
        link.setAttribute('href', mime + encodeURIComponent(data));
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Data exported successfully!', 'success');
    }

    // --- Reset Month ---
    async function resetMonth() {
        if (currentUser.role !== 'admin' && currentUser.role !== 'manager') return;
        if (!confirm('Are you sure you want to export and reset all data except members and users? This will also clear all notifications.')) return;
    
        await exportData(); // Export before reset
        await supabaseClient.from('deposits').delete().neq('id', 0);
        await supabaseClient.from('meals').delete().neq('id', 0);
        await supabaseClient.from('expenses').delete().neq('id', 0);
        await supabaseClient.from('notifications').delete().neq('id', 0); // Clear notifications
        await supabaseClient.from('members').update({ pre_month_balance: 0 }).neq('id', 0);
        await fetchAllData();
        await updateAllViews();
        showNotification('Month reset successfully! All notifications cleared.', 'success');
        appState.hasShownNegativeBalanceWarning = false; // Reset flag
    }

    // --- Targeted Updates ---
    async function updateMemberCard(memberId) {
        const card = elements.membersList.querySelector(`.member-card[data-id="${memberId}"]`);
        if (!card) return;

        const member = appState.members.find(m => m.id === memberId);
        if (!member) return;

        const [totalMeals, totalDeposit, totalCost, totalBazar] = await Promise.all([
            calculateTotalMeals(memberId),
            calculateTotalDeposit(memberId),
            calculateTotalCost(memberId),
            calculateTotalBazar(memberId)
        ]);

        const balance = totalDeposit - totalCost;
        const balanceClass = balance >= 0 ? 'positive' : 'negative';
        const isOwnCard = currentUser.role === 'user' && member.id === currentUser.member_id;
        const toggleClass = isOwnCard ? `user-toggle ${isToggleTimeAllowed() ? '' : 'disabled'}` : '';

        card.innerHTML = `
            <h3>${member.name}</h3>
            <div>Total Deposit: ${formatCurrency(totalDeposit)}</div>
            <div>Balance: <span class="balance-text ${balanceClass}">${formatCurrency(balance)}</span></div>
            <div>Total Meals: <span class="total-meals">${totalMeals}</span></div>
            <div>Total Bazar: ${totalBazar}</div>
            <div class="toggles">
                <button class="toggle-btn ${member.day_status ? 'on' : 'off'} ${toggleClass}" data-type="day">Day ${member.day_status ? '' : '(Off)'}</button>
                <button class="toggle-btn ${member.night_status ? 'on' : 'off'} ${toggleClass}" data-type="night">Night ${member.night_status ? '' : '(Off)'}</button>
            </div>
            ${(currentUser.role === 'admin' || currentUser.role === 'manager') ? `
            <div class="actions">
                ${currentUser.role === 'admin' ? `
                    <button class="btn primary-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn danger-btn delete-btn"><i class="fas fa-trash"></i> Delete</button>
                ` : `
                    <button class="btn primary-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
                `}
            </div>` : ''}
        `;

        if (balance < 0 && currentUser.role === 'user') {
            showNotification('Warning: Your balance is negative!', 'error');
        }

        const toggleButtons = card.querySelectorAll('.toggle-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => toggleMealStatus(member, btn.dataset.type));
        });

        if (currentUser.role === 'admin') {
            card.querySelector('.edit-btn').addEventListener('click', () => editMember(member.id));
            card.querySelector('.delete-btn').addEventListener('click', () => deleteMember(member.id));
        } else if (currentUser.role === 'manager') {
            card.querySelector('.edit-btn').addEventListener('click', () => editMember(member.id));
        }
    }

    // --- Update All Views ---
    async function updateAllViews() {
        if (!currentUser) {
            elements.mainApp.style.display = 'none';
            elements.loginPage.classList.remove('hidden');
            return;
        }
        await renderAdminControls();
        await updateDashboard();
        await updateUserOverview();
        await renderMembers();
        await renderSummary();
        await renderMealTracker();
        await renderExpenses();
        await renderNotificationLog();
        await renderMealPlanner();
        await updateMealToggleCard(); // Add this line
    
        const isAdmin = currentUser.role === 'admin';
        const isManager = currentUser.role === 'manager';
        if (isAdmin || isManager) {
            elements.memberSelectContainer.classList.remove('hidden');
            if (appState.members && appState.members.length > 0) {
                populateMemberSelect(isAdmin, isManager); // Pass both parameters
            }
        }
        if (isAdmin) {
            elements.userSelectContainer.classList.remove('hidden');
            if (appState.users && appState.users.length > 0) {
                populateUserSelect();
            }
        }
    }

// Move these outside the try block, right after elements are defined
elements.chatToggleBtn?.addEventListener('click', toggleChatPopup);
elements.chatCloseBtn?.addEventListener('click', toggleChatPopup);
elements.sendMessageBtn?.addEventListener('click', sendMessage);
elements.chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Replace the setupMessageSubscription call in the try block
try {
    await createAuthForms();
    await checkAutoLogin();
    if (currentUser) {
        loginPage.style.display = 'none';
        mainApp.style.display = 'block';
        await fetchAllData();
        updateUIForRole();
        updateSidebarUserInfo();
        debouncedUpdateAllViews();
        await updateMealToggleCard();
        syncTogglesWithMealToggle();
        startRestrictionCheck();
        window.chatChannel = setupMessageSubscription();
        window.realtimeChannels = setupRealtimeSubscriptions(); // Only this call remains

        elements.resetMessagesBtn?.addEventListener('click', async () => {
            if (confirm('Are you sure you want to reset all messages? This cannot be undone.')) {
                await resetMessages();
            }
        });

        await showAnnouncementPopup();
    } else {
        loginPage.style.display = 'flex';
        mainApp.style.display = 'none';
        updateSidebarUserInfo();
    }
} catch (error) {
    console.error('Initialization failed:', error);
    showNotification('Failed to load the app. Please try again.', 'error', true);
} finally {
    hideLoader();
}
});