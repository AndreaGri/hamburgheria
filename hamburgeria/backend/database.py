import pymysql
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class DatabaseWrapper:
    def __init__(self):
        self.config = {
            'host': os.getenv('DB_HOST'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME'),
            'ssl': {'ca': os.getenv('DB_SSL_CA', None)} if os.getenv('DB_SSL_CA') else {'ssl_disabled': True},
            'cursorclass': pymysql.cursors.DictCursor,
            'charset': 'utf8mb4',
            'autocommit': True,
        }

    def _connect(self):
        return pymysql.connect(**self.config)

    # ─────────────────────────── INIT DB ───────────────────────────

    def init_db(self):
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS categories (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(50) NOT NULL UNIQUE,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS products (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        description TEXT,
                        price DECIMAL(6,2) NOT NULL,
                        category VARCHAR(50) NOT NULL,
                        image_url TEXT,
                        available BOOLEAN DEFAULT TRUE,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS orders (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        customer_name VARCHAR(100) DEFAULT 'Cliente',
                        status ENUM('in_attesa','in_preparazione','pronto','consegnato') DEFAULT 'in_attesa',
                        notes TEXT,
                        total DECIMAL(8,2) DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                """)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS order_items (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        order_id INT NOT NULL,
                        product_id INT NOT NULL,
                        product_name VARCHAR(100) NOT NULL,
                        product_price DECIMAL(6,2) NOT NULL,
                        quantity INT NOT NULL DEFAULT 1,
                        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
                    )
                """)
                default_categories = ['panini', 'menu', 'bevande', 'dolci', 'contorni']
                for cat in default_categories:
                    cur.execute("INSERT IGNORE INTO categories (name) VALUES (%s)", (cat,))
        print("✅ Database inizializzato correttamente")

    # ─────────────────────────── CATEGORIE ───────────────────────────

    def get_categories(self):
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM categories ORDER BY name")
                return cur.fetchall()

    # ─────────────────────────── PRODOTTI ───────────────────────────

    def get_all_products(self):
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM products ORDER BY category, name")
                products = cur.fetchall()
                for p in products:
                    p['price'] = float(p['price'])
                return products

    def get_products_by_category(self, category: str):
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT * FROM products WHERE category = %s AND available = TRUE ORDER BY name",
                    (category,)
                )
                products = cur.fetchall()
                for p in products:
                    p['price'] = float(p['price'])
                return products

    def add_product(self, name, description, price, category, image_url):
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO products (name, description, price, category, image_url) VALUES (%s, %s, %s, %s, %s)",
                    (name, description, price, category, image_url)
                )
                return cur.lastrowid

    def delete_product(self, product_id: int):
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM products WHERE id = %s", (product_id,))

    # ─────────────────────────── ORDINI ───────────────────────────

    def create_order(self, customer_name: str, items: list, notes: str = '') -> int:
        # Calcolo sicuro del totale
        total = sum(float(item['price']) * int(item['quantity']) for item in items)
        
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO orders (customer_name, notes, total) VALUES (%s, %s, %s)",
                    (customer_name, notes, total)
                )
                order_id = cur.lastrowid
                for item in items:
                    cur.execute(
                        """INSERT INTO order_items
                           (order_id, product_id, product_name, product_price, quantity)
                           VALUES (%s, %s, %s, %s, %s)""",
                        (order_id, item['product_id'], item['name'], float(item['price']), item['quantity'])
                    )
                return order_id

    def get_orders(self, status: str = None):
        with self._connect() as conn:
            with conn.cursor() as cur:
                if status:
                    cur.execute("SELECT * FROM orders WHERE status = %s ORDER BY created_at DESC", (status,))
                else:
                    cur.execute("SELECT * FROM orders ORDER BY created_at DESC")
                
                orders = cur.fetchall()
                for order in orders:
                    order['total'] = float(order['total'])
                    cur.execute("SELECT * FROM order_items WHERE order_id = %s", (order['id'],))
                    order['items'] = cur.fetchall()
                    for item in order['items']:
                        item['product_price'] = float(item['product_price'])
                    order['created_at'] = str(order['created_at'])
                    order['updated_at'] = str(order['updated_at'])
                return orders

    def get_order_by_id(self, order_id: int):
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM orders WHERE id = %s", (order_id,))
                order = cur.fetchone()
                if not order: return None
                order['total'] = float(order['total'])
                cur.execute("SELECT * FROM order_items WHERE order_id = %s", (order_id,))
                order['items'] = cur.fetchall()
                for item in order['items']:
                    item['product_price'] = float(item['product_price'])
                order['created_at'] = str(order['created_at'])
                order['updated_at'] = str(order['updated_at'])
                return order

    def update_order_status(self, order_id: int, status: str):
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE orders SET status = %s WHERE id = %s", (status, order_id))