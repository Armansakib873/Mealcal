// MealSync Application with Supabase Integration
document.addEventListener('DOMContentLoaded', async () => {
    // --- Supabase Client Initialization ---
    const supabaseUrl = 'https://wywwpnofgxkdrqxywaaa.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5d3dwbm9mZ3hrZHJxeHl3YWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDM4MzYsImV4cCI6MjA1NjA3OTgzNn0.7v0OIKtQb6RajAbEqFv2HcEwiZzVL0RpFZXSeprptWg';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- Session ---
    let currentUser = JSON.parse(sessionStorage.getItem('mealsync_currentUser')) || null;
    let selectedMonth = localStorage.getItem('mealsync_selectedMonth') || new Date().toISOString().slice(0, 7); // Current month

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
        logoutBtn: document.getElementById('logout-btn'),
        notificationLogBtn: document.getElementById('notification-log-btn'),
        adminControls: document.getElementById('admin-controls'),
        editAccessControls: document.getElementById('edit-access-controls'),
        passwordControls: document.getElementById('password-controls'),
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
        monthSelect: document.getElementById('month-select'),
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
            supabase.from('notifications').insert([{ message, type, timestamp: new Date().toISOString() }])
                .then(() => renderNotificationLog())
                .catch(error => console.error('Error logging notification:', error));
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
        return hours >= 20 || hours < 18; // 8 PM to 6 PM
    }

    function getLocalTime() {
        return new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    }

    // --- Authentication Forms ---
    async function createAuthForms() {
        const { data: members, error } = await supabase.from('members').select('name');
        if (error) {
            console.error('Error fetching members:', error);
            return;
        }
        const memberOptions = members.map(m => `<option value="${m.name}">${m.name}</option>`).join('') + '<option value="admin">admin</option>';

        elements.loginFormContainer.innerHTML = `
            <form id="login-form" class="modal-form">
                <div class="form-group">
                    <label for="login-username">Username:</label>
                    <select id="login-username" class="select-input" required>${memberOptions}</select>
                </div>
                <div class="form-group">
                    <label for="login-password">Password:</label>
                    <input type="password" id="login-password" class="input-field" required>
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
                    <select id="signup-username" class="select-input" required>${memberOptions}<option value="new">New Member</option></select>
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
        const { data, error } = await supabase.from('users')
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
        showNotification(`Welcome, ${username}!`, 'success', true);
        elements.loginPage.classList.add('hidden');
        elements.mainApp.style.display = 'block';
        updateUIForRole();
        await updateAllViews();
    }

    async function signup() {
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;

        const { data: existingUser, error: userError } = await supabase.from('users')
            .select('id')
            .eq('username', username)
            .single();
        if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows
            console.error('Error checking user:', userError);
            return;
        }
        if (existingUser) {
            showNotification('Username already exists.', 'error', true);
            return;
        }

        const { data: user, error: insertError } = await supabase.from('users')
            .insert([{ username, password, role: username === 'admin' ? 'admin' : 'user' }])
            .select()
            .single();
        if (insertError) {
            console.error('Error inserting user:', insertError);
            return;
        }

        if (username !== 'admin' && username !== 'new') {
            const { error: memberError } = await supabase.from('members')
                .insert([{ name: username }]);
            if (memberError) {
                console.error('Error inserting member:', memberError);
            } else {
                showNotification(`New member "${username}" created along with user account.`, 'success', true);
            }
        }

        showNotification('Account created! Please log in.', 'success', true);
        elements.signupFormContainer.classList.add('hidden');
        elements.loginFormContainer.classList.remove('hidden');
        elements.toggleSignupBtn.textContent = 'Need an account? Sign Up';
        await createAuthForms();
    }

    function logout() {
        currentUser = null;
        sessionStorage.removeItem('mealsync_currentUser');
        elements.headerNav.classList.remove('active');
        elements.mainApp.style.display = 'none';
        elements.loginPage.classList.remove('hidden');
        elements.signupFormContainer.classList.add('hidden');
        elements.loginFormContainer.classList.remove('hidden');
        elements.toggleSignupBtn.textContent = 'Need an account? Sign Up';
    }

    // --- Theme Toggle ---
    elements.toggleThemeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        elements.toggleThemeBtn.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
        localStorage.setItem('mealsync_theme', isDark ? 'dark' : 'light');
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

    // --- Mobile Menu Toggle ---
    elements.menuToggle.addEventListener('click', () => {
        elements.headerNav.classList.toggle('active');
        elements.menuToggle.innerHTML = `<i class="fas fa-${elements.headerNav.classList.contains('active') ? 'times' : 'bars'}"></i>`;
    });

    // --- UI Updates ---
    elements.logoutBtn.addEventListener('click', logout);

    function updateUIForRole() {
        elements.userStatus.textContent = currentUser ? `Logged in as: ${currentUser.username}` : '';
        const isAdminOrCanEdit = currentUser?.username === 'admin' || currentUser?.canEdit;
        elements.addMemberBtn.classList.toggle('hidden', !isAdminOrCanEdit);
        elements.addExpenseBtn.classList.toggle('hidden', !isAdminOrCanEdit);
        elements.adminControls.classList.toggle('hidden', currentUser?.username !== 'admin');
        elements.summarySection.classList.toggle('hidden', !isAdminOrCanEdit);
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
        const { error } = await supabase.from('users')
            .update({ password: newPassword })
            .eq('id', currentUser.id);
        if (error) {
            console.error('Error updating password:', error);
            showNotification('Failed to update password.', 'error');
            return;
        }
        currentUser.password = newPassword;
        sessionStorage.setItem('mealsync_currentUser', JSON.stringify(currentUser));
        elements.userPassword.value = '';
        showNotification('Password updated successfully!', 'success');
    });

    elements.notificationLogBtn.addEventListener('click', () => openModal(elements.notificationLogModal));
    elements.closeNotificationLogModal.addEventListener('click', () => closeModal(elements.notificationLogModal));

    elements.monthSelect.addEventListener('change', async () => {
        selectedMonth = elements.monthSelect.value;
        localStorage.setItem('mealsync_selectedMonth', selectedMonth);
        await updateAllViews();
    });

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

    // --- Member Functions ---
    async function addMember() {
        if (!currentUser || !(currentUser.username === 'admin' || currentUser.canEdit)) return;
        const name = document.getElementById('member-name').value.trim();
        const preMonthBalance = parseFloat(document.getElementById('pre-month-balance').value) || 0;
        if (!name) {
            showNotification('Please enter a member name.', 'error');
            return;
        }

        const { data: existingMember, error: memberCheckError } = await supabase.from('members')
            .select('id')
            .eq('name', name)
            .single();
        if (memberCheckError && memberCheckError.code !== 'PGRST116') {
            console.error('Error checking member:', memberCheckError);
            return;
        }
        if (existingMember) {
            showNotification('Member name already exists.', 'error');
            return;
        }

        const { data: member, error: memberError } = await supabase.from('members')
            .insert([{ name, pre_month_balance: preMonthBalance }])
            .select()
            .single();
        if (memberError) {
            console.error('Error adding member:', memberError);
            return;
        }

        const deposits = {};
        elements.depositFields.querySelectorAll('input').forEach(input => {
            deposits[input.dataset.label] = parseFloat(input.value) || 0;
        });
        const depositEntries = Object.entries(deposits).map(([label, amount]) => ({
            member_id: member.id,
            month: selectedMonth,
            label,
            amount
        }));
        if (depositEntries.length > 0) {
            const { error: depositError } = await supabase.from('deposits').insert(depositEntries);
            if (depositError) console.error('Error adding deposits:', depositError);
        }

        const { data: existingUser, error: userCheckError } = await supabase.from('users')
            .select('id')
            .eq('username', name)
            .single();
        if (!existingUser && !userCheckError) {
            const { error: userError } = await supabase.from('users')
                .insert([{ username: name, password: '123', role: 'user' }]);
            if (userError) {
                console.error('Error adding user:', userError);
            } else {
                showNotification(`User "${name}" created with password "123".`, 'success');
            }
        }

        await renderMembers();
        await updateAllViews();
        showNotification(`${name} added successfully!`, 'success');
        closeModal(elements.addMemberModal);
        await createAuthForms();
    }

    async function updateMember() {
        if (!currentUser || !(currentUser.username === 'admin' || currentUser.canEdit)) return;
        const name = document.getElementById('edit-member-name').value.trim();
        const preMonthBalance = parseFloat(document.getElementById('edit-pre-month-balance').value) || 0;

        const { data: member, error: fetchError } = await supabase.from('members')
            .select('*')
            .eq('id', editingMemberId)
            .single();
        if (fetchError) {
            console.error('Error fetching member:', fetchError);
            return;
        }

        if (name !== member.name && (await supabase.from('members').select('id').eq('name', name).single()).data) {
            showNotification('Member name already exists.', 'error');
            return;
        }

        const oldName = member.name;
        const { error: updateError } = await supabase.from('members')
            .update({ name, pre_month_balance: preMonthBalance })
            .eq('id', editingMemberId);
        if (updateError) {
            console.error('Error updating member:', updateError);
            return;
        }

        const deposits = {};
        elements.editDepositFields.querySelectorAll('input').forEach(input => {
            deposits[input.dataset.label] = parseFloat(input.value) || 0;
        });
        const depositEntries = Object.entries(deposits).map(([label, amount]) => ({
            member_id: editingMemberId,
            month: selectedMonth,
            label,
            amount
        }));
        await supabase.from('deposits').delete().eq('member_id', editingMemberId).eq('month', selectedMonth);
        if (depositEntries.length > 0) {
            const { error: depositError } = await supabase.from('deposits').insert(depositEntries);
            if (depositError) console.error('Error updating deposits:', depositError);
        }

        const { data: user, error: userFetchError } = await supabase.from('users')
            .select('*')
            .eq('username', oldName)
            .single();
        if (user && user.username !== 'admin') {
            await supabase.from('users').update({ username: name }).eq('id', user.id);
        }

        await renderMembers();
        await updateAllViews();
        showNotification(`${name} updated successfully!`, 'success');
        closeModal(elements.editMemberModal);
        await createAuthForms();
    }

    async function editMember(id) {
        if (!currentUser || !(currentUser.username === 'admin' || currentUser.canEdit)) return;
        const { data: member, error } = await supabase.from('members')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error('Error fetching member:', error);
            return;
        }

        editingMemberId = id;
        document.getElementById('edit-member-name').value = member.name;
        document.getElementById('edit-pre-month-balance').value = member.pre_month_balance;

        const { data: deposits, error: depositError } = await supabase.from('deposits')
            .select('*')
            .eq('member_id', id)
            .eq('month', selectedMonth);
        elements.editDepositFields.innerHTML = '';
        if (!depositError && deposits) {
            deposits.forEach(dep => {
                const div = document.createElement('div');
                div.className = 'form-group';
                div.innerHTML = `
                    <label for="edit-deposit-${dep.label}">${dep.label}:</label>
                    <input type="number" id="edit-deposit-${dep.label}" class="input-field" value="${dep.amount}" step="1" data-label="${dep.label}">
                `;
                elements.editDepositFields.appendChild(div);
            });
        }

        openModal(elements.editMemberModal);
    }

    async function deleteMember(id) {
        if (!currentUser || !(currentUser.username === 'admin' || currentUser.canEdit)) return;
        if (!confirm('Are you sure you want to delete this member?')) return;

        const { data: member, error: fetchError } = await supabase.from('members')
            .select('name')
            .eq('id', id)
            .single();
        if (fetchError) {
            console.error('Error fetching member:', fetchError);
            return;
        }

        const { error: deleteError } = await supabase.from('members').delete().eq('id', id);
        if (deleteError) {
            console.error('Error deleting member:', deleteError);
            return;
        }

        await renderMembers();
        await updateAllViews();
        showNotification(`${member.name} deleted successfully!`, 'success');
    }

    async function renderMembers() {
        elements.membersList.innerHTML = '';
        const { data: members, error } = await supabase.from('members').select('*');
        if (error) {
            console.error('Error fetching members:', error);
            return;
        }

        const visibleMembers = (currentUser?.username === 'admin' || currentUser?.canEdit) 
            ? members 
            : members.filter(m => m.name.toLowerCase() === currentUser?.username.toLowerCase());
        
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

            card.innerHTML = `
                <h3>${member.name}</h3>
                <div>Total Deposit: ${formatCurrency(totalDeposit)}</div>
                <div>Balance: <span class="balance-text ${balanceClass}">${formatCurrency(balance)}</span></div>
                <div>Total Meals: <span class="total-meals">${totalMeals}</span></div>
                <div>Total Bazar: ${totalBazar}</div>
                <div class="toggles">
                    <button class="toggle-btn ${member.day_status ? 'on' : 'off'} ${currentUser?.role === 'user' && !currentUser.canEdit && !isToggleTimeAllowed() ? 'disabled' : ''}" data-type="day">Day ${member.day_status ? '' : '(Off)'}</button>
                    <button class="toggle-btn ${member.night_status ? 'on' : 'off'} ${currentUser?.role === 'user' && !currentUser.canEdit && !isToggleTimeAllowed() ? 'disabled' : ''}" data-type="night">Night ${member.night_status ? '' : '(Off)'}</button>
                </div>
                ${(currentUser?.username === 'admin' || currentUser?.canEdit) ? `
                <div class="actions">
                    <button class="btn primary-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn danger-btn delete-btn"><i class="fas fa-trash"></i> Delete</button>
                </div>` : ''}
            `;

            if (balance < 0 && currentUser?.role === 'user') {
                showNotification('Warning: Your balance is negative!', 'error');
            }

            const toggleButtons = card.querySelectorAll('.toggle-btn');
            toggleButtons.forEach(btn => {
                btn.addEventListener('click', () => toggleMealStatus(member, btn.dataset.type));
            });

            if (currentUser?.username === 'admin' || currentUser?.canEdit) {
                card.querySelector('.edit-btn').addEventListener('click', () => editMember(member.id));
                card.querySelector('.delete-btn').addEventListener('click', () => deleteMember(member.id));
            }

            elements.membersList.appendChild(card);
        }
        await populateExpenseSelect();
    }

    async function toggleMealStatus(member, type) {
        if (currentUser?.role === 'user' && !currentUser.canEdit && !isToggleTimeAllowed()) {
            showNotification('Meal toggling is only allowed between 8 PM and 6 PM.', 'error');
            return;
        }

        const statusKey = type === 'day' ? 'day_status' : 'night_status';
        const newStatus = !member[statusKey];
        const { error } = await supabase.from('members')
            .update({ [statusKey]: newStatus })
            .eq('id', member.id);
        if (error) {
            console.error('Error toggling status:', error);
            return;
        }

        await renderMembers();
        await updateDashboard();
        await updateUserOverview();
    }

    // --- Expense Functions ---
    async function openExpenseModal(expenseId = null) {
        if (!currentUser || !(currentUser.username === 'admin' || currentUser.canEdit)) return;
        editingExpenseId = expenseId;
        const title = expenseId ? 'Edit Expense' : 'Add Expense';
        elements.expenseModal.querySelector('h2').textContent = `<i class="fas fa-receipt"></i> ${title}`;

        if (expenseId) {
            const { data: expense, error } = await supabase.from('expenses')
                .select('*')
                .eq('id', expenseId)
                .single();
            if (error) {
                console.error('Error fetching expense:', error);
                return;
            }
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
        if (!currentUser || !(currentUser.username === 'admin' || currentUser.canEdit)) return;
        const date = document.getElementById('expense-date').value;
        const memberId = parseInt(document.getElementById('expense-member').value);
        const amount = parseFloat(document.getElementById('expense-amount').value);

        if (!date || isNaN(memberId) || isNaN(amount)) {
            showNotification('Please fill all fields.', 'error');
            return;
        }

        const month = date.slice(0, 7); // e.g., "2025-02" from "2025-02-15"
        const { error } = await supabase.from('expenses')
            .insert([{ member_id: memberId, month, date, amount }]);
        if (error) {
            console.error('Error adding expense:', error);
            return;
        }

        await renderExpenses();
        await updateAllViews();
        showNotification('Expense added successfully!', 'success');
        closeModal(elements.expenseModal);
    }

    async function updateExpense() {
        if (!currentUser || !(currentUser.username === 'admin' || currentUser.canEdit)) return;
        const date = document.getElementById('expense-date').value;
        const memberId = parseInt(document.getElementById('expense-member').value);
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const month = date.slice(0, 7);

        const { error } = await supabase.from('expenses')
            .update({ date, member_id: memberId, amount, month })
            .eq('id', editingExpenseId);
        if (error) {
            console.error('Error updating expense:', error);
            return;
        }

        await renderExpenses();
        await updateAllViews();
        showNotification('Expense updated successfully!', 'success');
        closeModal(elements.expenseModal);
    }

    async function deleteExpense(id) {
        if (!currentUser || !(currentUser.username === 'admin' || currentUser.canEdit)) return;
        if (!confirm('Are you sure you want to delete this expense?')) return;

        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) {
            console.error('Error deleting expense:', error);
            return;
        }

        await renderExpenses();
        await updateAllViews();
        showNotification('Expense deleted successfully!', 'success');
    }

    async function renderExpenses() {
        elements.expensesTableBody.innerHTML = '';
        const { data: expenses, error } = await supabase.from('expenses')
            .select('*')
            .eq('month', selectedMonth);
        if (error) {
            console.error('Error fetching expenses:', error);
            return;
        }

        for (const expense of expenses) {
            const { data: member, error: memberError } = await supabase.from('members')
                .select('name')
                .eq('id', expense.member_id)
                .single();
            if (memberError) console.error('Error fetching member:', memberError);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(expense.date)}</td>
                <td>${member ? member.name : 'Unknown'}</td>
                <td>${formatCurrency(expense.amount)}</td>
                <td>${(currentUser?.username === 'admin' || currentUser?.canEdit) ? `
                    <button class="btn primary-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn danger-btn delete-btn"><i class="fas fa-trash"></i> Delete</button>` : ''}</td>
            `;
            if (currentUser?.username === 'admin' || currentUser?.canEdit) {
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

        const { data: members, error } = await supabase.from('members').select('*');
        if (error) {
            console.error('Error fetching members:', error);
            return;
        }

        const visibleMembers = (currentUser?.username === 'admin' || currentUser?.canEdit) 
            ? members 
            : members.filter(m => m.name.toLowerCase() === currentUser?.username.toLowerCase());
        
        const { data: meals, error: mealsError } = await supabase.from('meals')
            .select('*')
            .eq('month', selectedMonth);
        if (mealsError) console.error('Error fetching meals:', mealsError);

        for (const member of visibleMembers) {
            const row = document.createElement('tr');
            row.dataset.memberId = member.id;
            row.innerHTML = `<td>${member.name}</td>`;
            
            const memberMeals = meals ? meals.filter(m => m.member_id === member.id) : [];
            const mealData = {};
            memberMeals.forEach(m => mealData[m.day] = m.count);

            for (let i = 1; i <= daysInMonth; i++) {
                const cell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.min = 0;
                input.value = mealData[i] || 0;
                input.disabled = !(currentUser?.username === 'admin' || currentUser?.canEdit);
                input.addEventListener('change', async () => {
                    const newCount = parseInt(input.value) || 0;
                    const { data: existingMeal } = await supabase.from('meals')
                        .select('id')
                        .eq('member_id', member.id)
                        .eq('month', selectedMonth)
                        .eq('day', i)
                        .single();

                    if (existingMeal) {
                        await supabase.from('meals')
                            .update({ count: newCount })
                            .eq('id', existingMeal.id);
                    } else {
                        await supabase.from('meals')
                            .insert([{ member_id: member.id, month: selectedMonth, day: i, count: newCount }]);
                    }
                    updateTotalMeals(row, member.id);
                    await updateAllViews();
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

    async function populateMonthSelect() {
        const currentYear = new Date().getFullYear();
        const options = [];
        for (let year = currentYear - 1; year <= currentYear + 1; year++) {
            for (let month = 0; month < 12; month++) {
                const date = new Date(year, month, 1);
                const value = date.toISOString().slice(0, 7);
                const label = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
                options.push(`<option value="${value}" ${value === selectedMonth ? 'selected' : ''}>${label}</option>`);
            }
        }
        elements.monthSelect.innerHTML = options.join('');
    }

    async function automateMealTracker() {
        const now = new Date(getLocalTime());
        if (now.getHours() === 19 && now.getMinutes() === 0) { // 7 PM local time
            const today = now.getDate();
            const currentMonth = now.toISOString().slice(0, 7);
            const { data: members, error } = await supabase.from('members').select('*');
            if (error) {
                console.error('Error fetching members:', error);
                return;
            }

            for (const member of members) {
                const mealCount = (member.day_status ? 1 : 0) + (member.night_status ? 1 : 0);
                const { data: existingMeal } = await supabase.from('meals')
                    .select('id')
                    .eq('member_id', member.id)
                    .eq('month', currentMonth)
                    .eq('day', today)
                    .single();

                if (existingMeal) {
                    await supabase.from('meals')
                        .update({ count: mealCount })
                        .eq('id', existingMeal.id);
                } else {
                    await supabase.from('meals')
                        .insert([{ member_id: member.id, month: currentMonth, day: today, count: mealCount }]);
                }
            }

            if (selectedMonth === currentMonth) {
                await renderMealTracker();
                await updateAllViews();
            }
            showNotification('Meal tracker updated for today at 7 PM.', 'success');
        }
    }

    setInterval(automateMealTracker, 60000); // Check every minute

    // --- Calculations ---
    async function calculateTotalMeals(memberId) {
        const { data: meals, error } = await supabase.from('meals')
            .select('count')
            .eq('member_id', memberId)
            .eq('month', selectedMonth);
        if (error) {
            console.error('Error calculating total meals:', error);
            return 0;
        }
        return meals.reduce((sum, m) => sum + (m.count || 0), 0);
    }

    async function calculateTotalDeposit(memberId) {
        const { data: member, error: memberError } = await supabase.from('members')
            .select('pre_month_balance')
            .eq('id', memberId)
            .single();
        if (memberError) {
            console.error('Error fetching pre_month_balance:', memberError);
            return 0;
        }

        const { data: deposits, error } = await supabase.from('deposits')
            .select('amount')
            .eq('member_id', memberId)
            .eq('month', selectedMonth);
        if (error) {
            console.error('Error calculating total deposit:', error);
            return member.pre_month_balance || 0;
        }

        return Math.round((member.pre_month_balance || 0) + deposits.reduce((sum, d) => sum + (d.amount || 0), 0));
    }

    async function calculateTotalCost(memberId) {
        const totalMeals = await calculateTotalMeals(memberId);
        const { data: expenses, error } = await supabase.from('expenses')
            .select('amount')
            .eq('month', selectedMonth);
        if (error) {
            console.error('Error calculating total expenses:', error);
            return 0;
        }

        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const { data: allMeals, error: mealsError } = await supabase.from('meals')
            .select('count')
            .eq('month', selectedMonth);
        if (mealsError) {
            console.error('Error calculating all meals:', mealsError);
            return 0;
        }

        const totalMealsCount = allMeals.reduce((sum, m) => sum + (m.count || 0), 0);
        const mealRate = totalMealsCount ? totalExpenses / totalMealsCount : 0;
        return Math.round(totalMeals * mealRate);
    }

    async function calculateTotalBazar(memberId) {
        const { data: expenses, error } = await supabase.from('expenses')
            .select('id')
            .eq('member_id', memberId)
            .eq('month', selectedMonth);
        if (error) {
            console.error('Error calculating total bazar:', error);
            return 0;
        }
        return expenses.length;
    }

    // --- Admin Controls ---
    async function renderAdminControls() {
        if (currentUser?.username !== 'admin') return;

        const { data: users, error } = await supabase.from('users').select('*');
        if (error) {
            console.error('Error fetching users:', error);
            return;
        }

        elements.editAccessControls.innerHTML = '<h3>Grant Editing Access</h3>' + users
            .filter(u => u.username !== 'admin')
            .map(user => `
                <div class="user-toggle">
                    <label>${user.username}</label>
                    <input type="checkbox" ${user.can_edit ? 'checked' : ''} data-user-id="${user.id}">
                </div>
            `).join('');

        elements.passwordControls.innerHTML = '<h3>Change Passwords</h3>' + users
            .map(user => `
                <div class="password-input">
                    <label>${user.username}</label>
                    <input type="password" data-user-id="${user.id}" placeholder="New password">
                    <button class="btn primary-btn update-password">Update</button>
                    ${user.username !== 'admin' ? `<button class="btn danger-btn delete-user" data-user-id="${user.id}">Delete</button>` : ''}
                </div>
            `).join('');

        elements.editAccessControls.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', async () => {
                const userId = parseInt(input.dataset.userId);
                const { error } = await supabase.from('users')
                    .update({ can_edit: input.checked })
                    .eq('id', userId);
                if (error) console.error('Error updating can_edit:', error);
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
                const { error } = await supabase.from('users')
                    .update({ password: newPassword })
                    .eq('id', userId);
                if (error) console.error('Error updating password:', error);
                else {
                    if (userId === currentUser.id) {
                        currentUser.password = newPassword;
                        sessionStorage.setItem('mealsync_currentUser', JSON.stringify(currentUser));
                    }
                    input.value = '';
                    showNotification(`Password updated for user ID ${userId}!`, 'success');
                }
            });
        });

        elements.passwordControls.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = parseInt(btn.dataset.userId);
                if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                    const { error } = await supabase.from('users').delete().eq('id', userId);
                    if (error) console.error('Error deleting user:', error);
                    else {
                        await renderAdminControls();
                        showNotification('User deleted successfully!', 'success');
                    }
                }
            });
        });
    }

    // --- Dashboard ---
    async function updateDashboard() {
        const { data: members, error: membersError } = await supabase.from('members').select('*');
        if (membersError) {
            console.error('Error fetching members:', membersError);
            return;
        }

        const totalDeposits = (await Promise.all(members.map(m => calculateTotalDeposit(m.id)))).reduce((sum, d) => sum + d, 0);
        const { data: expenses, error: expensesError } = await supabase.from('expenses')
            .select('amount')
            .eq('month', selectedMonth);
        const totalExpenses = expensesError ? 0 : expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalMealsCount = (await Promise.all(members.map(m => calculateTotalMeals(m.id)))).reduce((sum, m) => sum + m, 0);
        const mealRate = totalMealsCount ? totalExpenses / totalMealsCount : 0;

        elements.totalDeposits.textContent = formatCurrency(totalDeposits);
        elements.totalExpenditure.textContent = formatCurrency(totalExpenses);
        elements.currentBalance.textContent = formatCurrency(totalDeposits - totalExpenses);
        elements.todayDayCount.textContent = members.filter(m => m.day_status).length;
        elements.todayNightCount.textContent = members.filter(m => m.night_status).length;
        elements.totalMeals.textContent = totalMealsCount;
        elements.mealRate.textContent = formatCurrency(mealRate, true);
    }

    async function updateCharts() {
        const isDark = document.body.classList.contains('dark-mode');
        const { data: members, error: membersError } = await supabase.from('members').select('id, name');
        if (membersError) {
            console.error('Error fetching members:', membersError);
            return;
        }

        const { data: expenses, error: expensesError } = await supabase.from('expenses')
            .select('member_id, amount')
            .eq('month', selectedMonth);
        if (expensesError) console.error('Error fetching expenses:', expensesError);

        const expenseData = members.map(member => ({
            label: member.name,
            value: expenses ? expenses.filter(e => e.member_id === member.id).reduce((sum, e) => sum + e.amount, 0) : 0
        }));

        const mealData = await Promise.all(members.map(async member => ({
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
                plugins: { legend: { labels: { color: isDark ? '#e2e8f0' : '#2d3748' } } }
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
                plugins: { legend: { labels: { color: isDark ? '#e2e8f0' : '#2d3748' } } }
            }
        });
    }

    // --- User Overview ---
    async function updateUserOverview() {
        let member;
        if (currentUser?.username === 'admin') {
            const { data, error } = await supabase.from('members').select('*').limit(1).single();
            member = data || { name: 'N/A', pre_month_balance: 0, deposits: {}, meals: {} };
            if (error && error.code !== 'PGRST116') console.error('Error fetching admin member:', error);
        } else {
            const { data, error } = await supabase.from('members')
                .select('*')
                .eq('name', currentUser.username)
                .single();
            member = data;
            if (error && error.code !== 'PGRST116') console.error('Error fetching member:', error);
        }

        if (!member) {
            elements.userName.textContent = 'N/A';
            elements.userDeposit.textContent = formatCurrency(0);
            elements.userBalance.textContent = formatCurrency(0);
            elements.userBalance.className = 'balance-text';
            elements.userMeals.textContent = '0';
            elements.depositHistoryList.innerHTML = '';
            if (currentUser?.role === 'user') {
                showNotification('No matching member found for your username.', 'error');
            }
            return;
        }

        const totalDeposit = await calculateTotalDeposit(member.id);
        const totalCost = await calculateTotalCost(member.id);
        const balance = totalDeposit - totalCost;
        const balanceClass = balance >= 0 ? 'positive' : 'negative';

        const { data: deposits, error: depositsError } = await supabase.from('deposits')
            .select('label, amount')
            .eq('member_id', member.id)
            .eq('month', selectedMonth);
        if (depositsError) console.error('Error fetching deposits:', depositsError);

        elements.userName.textContent = member.name;
        elements.userDeposit.textContent = formatCurrency(totalDeposit);
        elements.userBalance.textContent = formatCurrency(balance);
        elements.userBalance.className = `balance-text ${balanceClass}`;
        elements.userMeals.textContent = await calculateTotalMeals(member.id);

        elements.depositHistoryList.innerHTML = `
            <li>Pre-Month: ${formatCurrency(member.pre_month_balance)}</li>
            ${deposits ? deposits.map(d => `<li>${d.label}: ${formatCurrency(d.amount)}</li>`).join('') : ''}
        `;

        if (balance < 0 && currentUser?.role === 'user') {
            showNotification('Warning: Your balance is negative!', 'error');
        }
    }

    // --- Summary ---
    async function renderSummary() {
        elements.summaryTableBody.innerHTML = '';
        if (!(currentUser?.username === 'admin' || currentUser?.canEdit)) return;

        const { data: members, error } = await supabase.from('members').select('*');
        if (error) {
            console.error('Error fetching members:', error);
            return;
        }

        const { data: deposits, error: depositsError } = await supabase.from('deposits')
            .select('member_id, label, amount')
            .eq('month', selectedMonth);
        if (depositsError) console.error('Error fetching deposits:', depositsError);

        for (const member of members) {
            const totalMeals = await calculateTotalMeals(member.id);
            const totalDeposit = await calculateTotalDeposit(member.id);
            const totalCost = await calculateTotalCost(member.id);
            const balance = totalDeposit - totalCost;
            const balanceClass = balance >= 0 ? 'positive' : 'negative';
            const totalBazar = await calculateTotalBazar(member.id);
            const memberDeposits = deposits ? deposits.filter(d => d.member_id === member.id) : [];
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
        if (!(currentUser?.username === 'admin' || currentUser?.canEdit)) return;
        const { data: members, error } = await supabase.from('members').select('id, name');
        if (error) {
            console.error('Error fetching members for expense select:', error);
            return;
        }
        elements.expenseMemberSelect.innerHTML = members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    }

    // --- Notification Log ---
    async function renderNotificationLog() {
        const { data: notifications, error } = await supabase.from('notifications').select('*');
        if (error) {
            console.error('Error fetching notifications:', error);
            return;
        }

        elements.notificationLogList.innerHTML = notifications.map(n => `
            <div class="log-entry ${n.type}">
                <span>${n.message} (${new Date(n.timestamp).toLocaleString()})</span>
                <button class="btn danger-btn" data-id="${n.id}">Dismiss</button>
            </div>
        `).join('');

        elements.notificationLogList.querySelectorAll('.danger-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.dataset.id);
                const { error } = await supabase.from('notifications').delete().eq('id', id);
                if (error) console.error('Error deleting notification:', error);
                else await renderNotificationLog();
            });
        });
    }

    // --- Data Export ---
    async function exportData() {
        if (!currentUser || !(currentUser.username === 'admin' || currentUser.canEdit)) return;
        const format = elements.exportFormat.value;

        const { data: members, error: membersError } = await supabase.from('members').select('id, name, pre_month_balance');
        if (membersError) {
            console.error('Error fetching members for export:', membersError);
            return;
        }

        const { data: meals, error: mealsError } = await supabase.from('meals')
            .select('member_id, count')
            .eq('month', selectedMonth);
        if (mealsError) console.error('Error fetching meals:', mealsError);

        const { data: deposits, error: depositsError } = await supabase.from('deposits')
            .select('member_id, label, amount')
            .eq('month', selectedMonth);
        if (depositsError) console.error('Error fetching deposits:', depositsError);

        const { data: expenses, error: expensesError } = await supabase.from('expenses')
            .select('member_id, amount')
            .eq('month', selectedMonth);
        if (expensesError) console.error('Error fetching expenses:', expensesError);

        let data, mime, filename;
        if (format === 'csv') {
            const headers = 'Name,Total Meals,Total Cost,Total Deposit,Balance,Pre-Month,1st,2nd,3rd,4th,5th,Total Bazar\n';
            const rows = await Promise.all(members.map(async m => {
                const totalMeals = meals ? meals.filter(meal => meal.member_id === m.id).reduce((sum, meal) => sum + meal.count, 0) : 0;
                const totalDeposit = await calculateTotalDeposit(m.id);
                const totalCost = await calculateTotalCost(m.id);
                const balance = totalDeposit - totalCost;
                const totalBazar = expenses ? expenses.filter(e => e.member_id === m.id).length : 0;
                const memberDeposits = deposits ? deposits.filter(d => d.member_id === m.id) : [];
                const depositMap = Object.fromEntries(memberDeposits.map(d => [d.label, d.amount]));
                return `${m.name},${totalMeals},${totalCost},${totalDeposit},${balance},${m.pre_month_balance || 0},${depositMap['1st'] || 0},${depositMap['2nd'] || 0},${depositMap['3rd'] || 0},${depositMap['4th'] || 0},${depositMap['5th'] || 0},${totalBazar}`;
            }));
            data = headers + rows.join('\n');
            mime = 'data:text/csv;charset=utf-8,';
            filename = `mealsync_data_${selectedMonth}.csv`;
        } else {
            const exportData = await Promise.all(members.map(async m => {
                const totalMeals = meals ? meals.filter(meal => meal.member_id === m.id).reduce((sum, meal) => sum + meal.count, 0) : 0;
                const totalDeposit = await calculateTotalDeposit(m.id);
                const totalCost = await calculateTotalCost(m.id);
                const memberDeposits = deposits ? deposits.filter(d => d.member_id === m.id) : [];
                return {
                    name: m.name,
                    totalMeals,
                    totalCost,
                    totalDeposit,
                    balance: totalDeposit - totalCost,
                    preMonthBalance: m.pre_month_balance,
                    deposits: Object.fromEntries(memberDeposits.map(d => [d.label, d.amount])),
                    totalBazar: expenses ? expenses.filter(e => e.member_id === m.id).length : 0
                };
            }));
            data = JSON.stringify(exportData, null, 2);
            mime = 'data:application/json;charset=utf-8,';
            filename = `mealsync_data_${selectedMonth}.json`;
        }

        const link = document.createElement('a');
        link.setAttribute('href', mime + encodeURIComponent(data));
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        await populateMonthSelect();
        await renderMealTracker();
        await renderExpenses();
        await renderNotificationLog();
    }

    // --- Initial Render ---
    await createAuthForms();
    if (currentUser) {
        elements.loginPage.classList.add('hidden');
        elements.mainApp.style.display = 'block';
        selectedMonth = localStorage.getItem('mealsync_selectedMonth') || new Date().toISOString().slice(0, 7);
        updateUIForRole();
        await updateAllViews();
    }

    // --- Auto-Assign First Admin (Only if needed) ---
    const { data: users, error: usersError } = await supabase.from('users').select('id').limit(1);
    if (usersError) console.error('Error checking users:', usersError);
    if (!users || users.length === 0) {
        await supabase.from('users').insert([{ username: 'admin', password: 'admin123', role: 'admin' }]);
        showNotification('Default admin created: username "admin", password "admin123". Please log in.', 'success', true);
    }
});