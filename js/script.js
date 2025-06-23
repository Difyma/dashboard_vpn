document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();

    document.querySelector('.refresh-btn').addEventListener('click', function() {
        loadDashboardData();
    });
});

async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard-data');
        const data = await response.json();
        
        updateStatistics(data.statistics);
        updateActiveUsersTable(data.activeUsers);
        updateExpiredUsersTable(data.expiredUsers);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
    }
}

function updateStatistics(statistics) {
    document.getElementById('active-subscriptions').textContent = statistics.activeSubscriptions;
    document.getElementById('renewed-subscriptions').textContent = statistics.renewedSubscriptions;
    document.getElementById('expired-subscriptions').textContent = statistics.expiredSubscriptions;
}

function updateActiveUsersTable(users) {
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
}

function updateExpiredUsersTable(users) {
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
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function calculateDaysSinceExpiration(expirationDate) {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = Math.abs(today - expDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
} 