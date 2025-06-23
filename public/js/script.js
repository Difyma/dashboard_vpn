document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();

    document.querySelector('.refresh-btn').addEventListener('click', function() {
        loadDashboardData();
    });
});

async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard-data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        updateStatistics(data.statistics);
        updateActiveUsersTable(data.activeUsers);
        updateExpiredUsersTable(data.expiredUsers);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
    }
}

function updateStatistics(statistics) {
    document.getElementById('active-subscriptions').textContent = statistics.activeSubscriptions || 0;
    document.getElementById('renewed-subscriptions').textContent = statistics.renewedSubscriptions || 0;
    document.getElementById('expired-subscriptions').textContent = statistics.expiredSubscriptions || 0;
}

function updateActiveUsersTable(users = []) {
    const tbody = document.querySelector('#active-users-table tbody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.uid}</td>
            <td>${user.username}</td>
            <td>${formatDate(user.activationDate)}</td>
            <td>${formatDate(user.expirationDate)}</td>
        `;
        tbody.appendChild(row);
    });

    if (users.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center">Нет активных подписок</td>';
        tbody.appendChild(row);
    }
}

function updateExpiredUsersTable(users = []) {
    const tbody = document.querySelector('#expired-users-table tbody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.uid}</td>
            <td>${user.username}</td>
            <td>${formatDate(user.expirationDate)}</td>
            <td>${calculateDaysSinceExpiration(user.expirationDate)}</td>
        `;
        tbody.appendChild(row);
    });

    if (users.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center">Нет истекших подписок</td>';
        tbody.appendChild(row);
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function calculateDaysSinceExpiration(expirationDate) {
    if (!expirationDate) return '-';
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = Math.abs(today - expDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
} 