from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from database import DatabaseWrapper
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'hamburger_secret')
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

db = DatabaseWrapper()

# ─────────────────────────── MENU ───────────────────────────

@app.route('/menu', methods=['GET'])
def get_menu():
    items = db.get_all_products()
    return jsonify(items)

@app.route('/menu/category/<string:category>', methods=['GET'])
def get_by_category(category):
    items = db.get_products_by_category(category)
    return jsonify(items)

@app.route('/menu', methods=['POST'])
def add_product():
    data = request.get_json()
    product_id = db.add_product(
        name=data['name'],
        description=data.get('description', ''),
        price=data['price'],
        category=data['category'],
        image_url=data.get('image_url', '')
    )
    socketio.emit('menu_updated', {'action': 'added', 'id': product_id})
    return jsonify({'id': product_id, 'message': 'Prodotto aggiunto'}), 201

@app.route('/menu/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()
    db.update_product(
        product_id=product_id,
        name=data.get('name'),
        description=data.get('description'),
        price=data.get('price'),
        category=data.get('category'),
        image_url=data.get('image_url'),
        available=data.get('available')
    )
    socketio.emit('menu_updated', {'action': 'updated', 'id': product_id})
    return jsonify({'message': 'Prodotto aggiornato'})

@app.route('/menu/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    db.delete_product(product_id)
    socketio.emit('menu_updated', {'action': 'deleted', 'id': product_id})
    return jsonify({'message': 'Prodotto eliminato'})

# ─────────────────────────── ORDINI ───────────────────────────

@app.route('/orders', methods=['GET'])
def get_orders():
    status = request.args.get('status')
    orders = db.get_orders(status=status)
    return jsonify(orders)

@app.route('/orders', methods=['POST'])
def create_order():
    try:
        data = request.get_json()
        order_id = db.create_order(
            customer_name=data.get('customer_name', 'Cliente'),
            items=data['items'],
            notes=data.get('notes', '')
        )
        order = db.get_order_by_id(order_id)
        socketio.emit('order_new', order)
        return jsonify({'id': order_id, 'message': 'Ordine creato'}), 201
    except Exception as e:
        print(f"Errore creazione ordine: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = db.get_order_by_id(order_id)
    if not order:
        return jsonify({'error': 'Ordine non trovato'}), 404
    return jsonify(order)

@app.route('/orders/<int:order_id>/status', methods=['PATCH'])
def update_order_status(order_id):
    data = request.get_json()
    new_status = data['status']
    db.update_order_status(order_id, new_status)
    socketio.emit('order_updated', {'id': order_id, 'status': new_status})
    return jsonify({'message': 'Stato aggiornato'})

# ─────────────────────────── CATEGORIE ───────────────────────────

@app.route('/categories', methods=['GET'])
def get_categories():
    cats = db.get_categories()
    return jsonify(cats)

# ─────────────────────────── WEBSOCKET ───────────────────────────

@socketio.on('connect')
def on_connect():
    print(f'Client connesso: {request.sid}')
    emit('connected', {'message': 'Connesso al server hamburgeria'})

@socketio.on('disconnect')
def on_disconnect():
    print(f'Client disconnesso: {request.sid}')

@socketio.on('subscribe_orders')
def on_subscribe_orders():
    emit('orders_snapshot', db.get_orders())

if __name__ == '__main__':
    db.init_db()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)