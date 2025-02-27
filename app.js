document.addEventListener('DOMContentLoaded', async () => {
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
        lastUpdated: null
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
        chartsTab: document.getElementById('charts-tab'),
        statsContent: document.getElementById('stats-content'),
        chartsContent: document.getElementById('charts-content'),
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
        notificationLogList: document.getElementById('notification-log-list')
    };

    let editingMemberId = null;
    let editingExpenseId = null;
    const depositLabels = ['1st', '2nd', '3rd', '4th', '5th', 'Total Bazar'];
    let expensesChart = null;
    let mealsChart = null;

    // --- Utility Functions ---
    function showNotification(message, type = 'success', isLogin = false) {
        const target = isLogin ? elements.loginNotification : elements.notification;
        target.textContent = message;
        target.className = `notification ${type}`;
        target.style.display = 'block';
        setTimeout(() => target.classList.add('show'), 10);
        setTimeout(() => {
            target.classList.remove('show');
            setTimeout(() => target.style.display = 'none', 300);
        }, 3000);

        if (!isLogin) {
            supabaseClient.from('notifications').insert([{ message, type, timestamp: new Date().toISOString() }])
                .then(() => renderNotificationLog())
                .catch(error => console.error('Error logging notification:', error.message));
        }
    }

    function formatCurrency(amount, isMealRate = false) {
        return isMealRate ? `৳${amount.toFixed(2)}` : `৳${Math.round(amount)}`;
    }

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function isToggleTimeAllowed() {
        const now = new Date();
        const hours = now.getHours();
        return hours >= 20 || hours < 18; // 8 PM to 6 PM (for users only)
    }

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

        const { data, error } = await supabaseClient.from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (error || !data) {
            showNotification('Invalid credentials.', 'error', true);
            return;
        }

        currentUser = data;
        sessionStorage.setItem('mealsync_currentUser', JSON.stringify(currentUser));
        if (rememberMe) {
            await supabaseClient.from('user_settings')
                .update({ auto_login: true })
                .eq('user_id', currentUser.id);
            localStorage.setItem('mealsync_auto_login', btoa(`${username}:${password}`)); // Basic encoding
        }
        showNotification(`Welcome, ${username}!`, 'success', true);
        elements.loginPage.classList.add('hidden');
        elements.mainApp.style.display = 'block';
        updateUIForRole();
        await fetchAllData();
        await updateAllViews();
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

    function logout() {
        currentUser = null;
        sessionStorage.removeItem('mealsync_currentUser');
        localStorage.removeItem('mealsync_auto_login');
        elements.headerNav.classList.remove('active');
        elements.mainApp.style.display = 'none';
        elements.loginPage.classList.remove('hidden');
        elements.signupFormContainer.classList.add('hidden');
        elements.loginFormContainer.classList.remove('hidden');
        elements.toggleSignupBtn.textContent = 'Need an account? Sign Up';
    }

    // --- Auto-Login Check ---
    async function checkAutoLogin() {
        const autoLoginData = localStorage.getItem('mealsync_auto_login');
        if (autoLoginData) {
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
                updateUIForRole();
                await fetchAllData();
                await updateAllViews();
            }
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
        updateCharts();
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

    elements.menuToggle.addEventListener('click', () => {
        elements.headerNav.classList.toggle('active');
        elements.menuToggle.innerHTML = `<i class="fas fa-${elements.headerNav.classList.contains('active') ? 'times' : 'bars'}"></i>`;
    });

    elements.logoutBtn.addEventListener('click', logout);

    function updateUIForRole() {
        elements.userStatus.textContent = currentUser ? `Logged in as: ${currentUser.username}` : '';
        elements.userRole.textContent = currentUser ? `Role: ${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}` : '';
        const isAdmin = currentUser?.role === 'admin';
        const isManager = currentUser?.role === 'manager';
        const canEdit = isAdmin || isManager; // Managers have same access as admins except admin controls and deletes

        elements.addMemberBtn.classList.toggle('hidden', !isAdmin); // Only admin can add members
        elements.addExpenseBtn.classList.toggle('hidden', !canEdit); // Managers and admins can add expenses
        elements.adminControls.classList.toggle('hidden', !isAdmin); // Only admin sees admin controls
        elements.summarySection.classList.toggle('hidden', !canEdit); // Managers and admins see summary

        // Adjust member card actions for managers (full edit, no delete)
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
                actions.innerHTML = ''; // No actions for regular users
            }
        });
    }

    // --- Event Listeners ---
    elements.addMemberBtn.addEventListener('click', () => openModal(elements.addMemberModal));
    elements.closeAddMemberModal.addEventListener('click', () => closeModal(elements.addMemberModal));
    elements.addMemberForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addMember();
    });

    elements.addDepositBtn.addEventListener('click', () => addDepositField(elements.depositFields));
    elements.editAddDepositBtn.addEventListener('click', () => addDepositField(elements.editDepositFields));

    elements.closeEditMemberModal.addEventListener('click', () => closeModal(elements.editMemberModal));
    elements.editMemberForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission
        await updateMember(); // Call the update function
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

    elements.statsTab.addEventListener('click', () => {
        elements.statsTab.classList.add('active');
        elements.chartsTab.classList.remove('active');
        elements.statsContent.classList.remove('hidden');
        elements.chartsContent.classList.add('hidden');
    });

    elements.chartsTab.addEventListener('click', () => {
        elements.statsTab.classList.remove('active');
        elements.chartsTab.classList.add('active');
        elements.statsContent.classList.add('hidden');
        elements.chartsContent.classList.remove('hidden');
        updateCharts();
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
        const existingLabels = Array.from(container.querySelectorAll('input')).map(input => input.dataset.label);
        const nextLabel = depositLabels.find(label => !existingLabels.includes(label));
        if (!nextLabel) {
            showNotification('Maximum deposit fields reached.', 'error');
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
        const tables = ['members', 'deposits', 'meals', 'expenses', 'notifications', 'users'];
        for (const table of tables) {
            const { data, error } = await supabaseClient.from(table).select('*').order('created_at', { ascending: false });
            if (error) {
                showNotification(`Error fetching ${table}: ${error.message}`, 'error');
                continue;
            }
            appState[table] = data;
        }
        appState.lastUpdated = Date.now();
        localStorage.setItem('mealsync_cache', JSON.stringify(appState));
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
        }

        await fetchAllData();
        await updateAllViews();
        showNotification(`${name} added successfully!`, 'success');
        closeModal(elements.addMemberModal);
        await createAuthForms();
    }

    async function updateMember() {
        if (currentUser?.role !== 'admin' && currentUser?.role !== 'manager') return;

        const member = appState.members.find(m => m.id === editingMemberId);
        const user = appState.users.find(u => u.member_id === editingMemberId);

        const name = document.getElementById('edit-member-name').value.trim();
        const username = document.getElementById('edit-member-username').value.trim();
        const preMonthBalance = parseFloat(document.getElementById('edit-pre-month-balance').value) || 0;

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
        if (currentUser.role === 'admin') { // Only admins can change passwords
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
        }

        await fetchAllData();
        await updateAllViews();
        showNotification(`${name} updated successfully!`, 'success');
        closeModal(elements.editMemberModal);
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
        if (currentUser.role !== 'admin') return; // Managers cannot delete
        if (!confirm('Are you sure you want to delete this member and associated user?')) return;

        const member = appState.members.find(m => m.id === id);
        const user = appState.users.find(u => u.member_id === id);

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

    function isToggleTimeAllowed() {
        const now = new Date();
        const hours = now.getHours();
        return hours >= 20 || hours < 18; // 8 PM (20:00) to 6 PM (18:00)
    }

async function renderMembers() {
    elements.membersList.innerHTML = '';
    const visibleMembers = currentUser.role === 'admin' || currentUser.role === 'manager'
        ? appState.members
        : appState.members.filter(m => m.id === currentUser.member_id);

    const isToggleAllowed = isToggleTimeAllowed(); // Check time once for initial render

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

        // Determine toggle state for users dynamically
        const isOwnCard = currentUser.role === 'user' && member.id === currentUser.member_id;
        const toggleClass = isOwnCard ? `user-toggle ${isToggleAllowed ? '' : 'disabled'}` : '';

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

        elements.membersList.appendChild(card);
    }
    await populateExpenseSelect();
    updateUserToggleButtons(); // Ensure buttons are updated after initial render
}

    
async function toggleMealStatus(member, type) {
    if (currentUser.role === 'user' && !isToggleTimeAllowed()) {
        showNotification('Meal toggling is only allowed between 8 PM and 6 PM.', 'error');
        return;
    }

    const statusKey = type === 'day' ? 'day_status' : 'night_status';
    const newStatus = !member[statusKey];
    await supabaseClient.from('members')
        .update({ [statusKey]: newStatus })
        .eq('id', member.id);

    if (currentUser.member_id === member.id) {
        currentUser[statusKey] = newStatus;
        sessionStorage.setItem('mealsync_currentUser', JSON.stringify(currentUser));
    }

    await fetchAllData();
    await updateMemberCard(member.id); // Update the specific card
    await updateDashboard();
    if (currentUser.member_id === member.id) {
        await updateUserOverview();
    }
    updateUserToggleButtons(); // Sync button appearance after toggle
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

        await supabaseClient.from('expenses')
            .insert([{ member_id: memberId, date, amount }]);

        await fetchAllData();
        await updateAllViews();
        showNotification('Expense added successfully!', 'success');
        closeModal(elements.expenseModal);
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

        await fetchAllData();
        await renderExpenses(); // Update only expenses section
        await updateDashboard();
        showNotification('Expense updated successfully!', 'success');
        closeModal(elements.expenseModal);
    }

    async function deleteExpense(id) {
        if (!currentUser.can_edit && currentUser.role !== 'admin' && currentUser.role !== 'manager') return;
        if (!confirm('Are you sure you want to delete this expense?')) return;

        await supabaseClient.from('expenses').delete().eq('id', id);
        await fetchAllData();
        await renderExpenses();
        await updateDashboard();
        showNotification('Expense deleted successfully!', 'success');
    }

    async function renderExpenses() {
        elements.expensesTableBody.innerHTML = '';
        for (const expense of appState.expenses) {
            const member = appState.members.find(m => m.id === expense.member_id);
            const row = document.createElement('tr');
            row.dataset.id = expense.id;
            row.innerHTML = `
                <td>${formatDate(expense.date)}</td>
                <td>${member ? member.name : 'Unknown'}</td>
                <td>${formatCurrency(expense.amount)}</td>
                <td>${(currentUser.can_edit || currentUser.role === 'admin' || currentUser.role === 'manager') ? `
                    <button class="btn primary-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn danger-btn delete-btn"><i class="fas fa-trash"></i> Delete</button>` : ''}</td>
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

    async function automateMealTracker() {
        const now = new Date(getLocalTime());
        if (now.getHours() === 19 && now.getMinutes() === 0) {
            const today = now.getDate();
            for (const member of appState.members) {
                const mealCount = (member.day_status ? 1 : 0) + (member.night_status ? 1 : 0);
                const existingMeal = appState.meals.find(m => m.member_id === member.id && m.day === today);
                if (existingMeal) {
                    await supabaseClient.from('meals')
                        .update({ count: mealCount })
                        .eq('id', existingMeal.id);
                } else {
                    await supabaseClient.from('meals')
                        .insert([{ member_id: member.id, day: today, count: mealCount }]);
                }
            }
            await fetchAllData();
            await updateAllViews();
            showNotification('Meal tracker updated for today at 7 PM.', 'success');
        }
    }

    setInterval(automateMealTracker, 60000);

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

        elements.editAccessControls.innerHTML = '<h3>Grant Editing Access</h3>' + appState.users
            .filter(u => u.role !== 'admin')
            .map(user => `
                <div class="user-toggle">
                    <label>${user.username}</label>
                    <input type="checkbox" ${user.can_edit ? 'checked' : ''} data-user-id="${user.id}">
                </div>
            `).join('');

        elements.passwordControls.innerHTML = '<h3>Change Passwords</h3>' + appState.users
            .map(user => `
                <div class="password-input">
                    <label>${user.username}</label>
                    <input type="password" data-user-id="${user.id}" placeholder="New password">
                    <button class="btn primary-btn update-password">Update</button>
                    ${user.role !== 'admin' ? `<button class="btn danger-btn delete-user" data-user-id="${user.id}">Delete</button>` : ''}
                </div>
            `).join('');

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

        elements.totalDeposits.textContent = formatCurrency(totalDeposits);
        elements.totalExpenditure.textContent = formatCurrency(totalExpenses);
        elements.currentBalance.textContent = formatCurrency(totalDeposits - totalExpenses);
        elements.todayDayCount.textContent = appState.members.filter(m => m.day_status).length;
        elements.todayNightCount.textContent = appState.members.filter(m => m.night_status).length;
        elements.totalMeals.textContent = totalMealsCount;
        elements.mealRate.textContent = formatCurrency(mealRate, true);
    }

    async function updateCharts() {
        const isDark = document.body.classList.contains('dark-mode');
        const expenseData = appState.members.map(member => ({
            label: member.name,
            value: appState.expenses.filter(e => e.member_id === member.id).reduce((sum, e) => sum + e.amount, 0)
        }));

        const mealData = await Promise.all(appState.members.map(async member => ({
            label: member.name,
            value: await calculateTotalMeals(member.id)
        })));

        if (expensesChart) expensesChart.destroy();
        if (mealsChart) mealsChart.destroy();

        expensesChart = new Chart(document.getElementById('expenses-chart'), {
            type: 'pie',
            data: {
                labels: expenseData.map(d => d.label),
                datasets: [{
                    data: expenseData.map(d => d.value),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: isDark ? '#e2e8f0' : '#2d3748' } },
                    tooltip: { enabled: true }
                }
            }
        });

        mealsChart = new Chart(document.getElementById('meals-chart'), {
            type: 'bar',
            data: {
                labels: mealData.map(d => d.label),
                datasets: [{
                    label: 'Total Meals',
                    data: mealData.map(d => d.value),
                    backgroundColor: '#36A2EB'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, ticks: { color: isDark ? '#e2e8f0' : '#2d3748' } },
                    x: { ticks: { color: isDark ? '#e2e8f0' : '#2d3748' } }
                },
                plugins: {
                    legend: { labels: { color: isDark ? '#e2e8f0' : '#2d3748' } },
                    tooltip: { enabled: true }
                }
            }
        });
    }

    // --- User Overview ---
    async function updateUserOverview() {
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

        if (balance < 0 && currentUser.role === 'user') {
            showNotification('Warning: Your balance is negative!', 'error');
        }
    }

    // --- Summary ---
    async function renderSummary() {
        elements.summaryTableBody.innerHTML = '';
        if (!currentUser.can_edit && currentUser.role !== 'admin' && currentUser.role !== 'manager') return;

        for (const member of appState.members) {
            const totalMeals = await calculateTotalMeals(member.id);
            const totalDeposit = await calculateTotalDeposit(member.id);
            const totalCost = await calculateTotalCost(member.id);
            const balance = totalDeposit - totalCost;
            const balanceClass = balance >= 0 ? 'positive' : 'negative';
            const totalBazar = await calculateTotalBazar(member.id);
            const memberDeposits = appState.deposits.filter(d => d.member_id === member.id);
            const depositMap = Object.fromEntries(memberDeposits.map(d => [d.label, d.amount]));

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.name}</td>
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
    }

    // --- Populate Expense Select ---
    async function populateExpenseSelect() {
        if (!currentUser.can_edit && currentUser.role !== 'admin' && currentUser.role !== 'manager') return;
        elements.expenseMemberSelect.innerHTML = appState.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    }

    // --- Notification Log ---
    async function renderNotificationLog() {
        elements.notificationLogList.innerHTML = appState.notifications.map(n => `
            <div class="log-entry ${n.type}">
                <span>${n.message} (${new Date(n.timestamp).toLocaleString()})</span>
                <button class="btn danger-btn" data-id="${n.id}">Dismiss</button>
            </div>
        `).join('');

        elements.notificationLogList.querySelectorAll('.danger-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.dataset.id);
                await supabaseClient.from('notifications').delete().eq('id', id);
                await fetchAllData();
                await renderNotificationLog();
            });
        });
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
        if (!confirm('Are you sure you want to export and reset all data except members and users?')) return;

        await exportData(); // Export before reset
        await supabaseClient.from('deposits').delete().neq('id', 0); // Clear all
        await supabaseClient.from('meals').delete().neq('id', 0);
        await supabaseClient.from('expenses').delete().neq('id', 0);
        await supabaseClient.from('members').update({ pre_month_balance: 0 }).neq('id', 0);
        await fetchAllData();
        await updateAllViews();
        showNotification('Month reset successfully!', 'success');
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
    }

    // --- Initial Render ---
    await createAuthForms();
    await checkAutoLogin();
    if (currentUser) {
        elements.loginPage.classList.add('hidden');
        elements.mainApp.style.display = 'block';
        updateUIForRole();
        await fetchAllData();
        await updateAllViews();
    }
});
