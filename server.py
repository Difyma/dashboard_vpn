from flask import Flask, jsonify, send_from_directory
import mysql.connector
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='.')

# Конфигурация базы данных
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'your_username'),
    'password': os.getenv('DB_PASSWORD', 'your_password'),
    'database': os.getenv('DB_NAME', 'your_database')
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/dashboard-data')
def get_dashboard_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Получаем статистику по подпискам
        cursor.execute("""
            SELECT 
                COUNT(CASE WHEN expiration_date > NOW() THEN 1 END) as active_subscriptions,
                COUNT(CASE WHEN renewed_date IS NOT NULL THEN 1 END) as renewed_subscriptions,
                COUNT(CASE WHEN expiration_date <= NOW() THEN 1 END) as expired_subscriptions
            FROM subscriptions
        """)
        statistics = cursor.fetchone()

        # Получаем активных пользователей
        cursor.execute("""
            SELECT 
                u.uid,
                u.username,
                s.activation_date,
                s.expiration_date
            FROM users u
            JOIN subscriptions s ON u.uid = s.user_id
            WHERE s.expiration_date > NOW()
            ORDER BY s.expiration_date
        """)
        active_users = cursor.fetchall()

        # Получаем пользователей с истекшими подписками
        cursor.execute("""
            SELECT 
                u.uid,
                u.username,
                s.expiration_date
            FROM users u
            JOIN subscriptions s ON u.uid = s.user_id
            WHERE s.expiration_date <= NOW()
            ORDER BY s.expiration_date DESC
        """)
        expired_users = cursor.fetchall()

        cursor.close()
        conn.close()

        # Форматируем даты для JSON
        for user in active_users:
            user['activation_date'] = user['activation_date'].isoformat()
            user['expiration_date'] = user['expiration_date'].isoformat()

        for user in expired_users:
            user['expiration_date'] = user['expiration_date'].isoformat()

        return jsonify({
            'statistics': {
                'activeSubscriptions': statistics['active_subscriptions'],
                'renewedSubscriptions': statistics['renewed_subscriptions'],
                'expiredSubscriptions': statistics['expired_subscriptions']
            },
            'activeUsers': active_users,
            'expiredUsers': expired_users
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 