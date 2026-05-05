// lib/models/product.dart
class Product {
  final int id;
  final String name;
  final String description;
  final double price;
  final String category;
  final String imageUrl;
  final bool available;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    required this.imageUrl,
    required this.available,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        // Adesso anche l'ID è al sicuro da errori di tipo
        id: int.tryParse(json['id'].toString()) ?? 0,
        name: json['name'] ?? '',
        description: json['description'] ?? '',
        price: double.tryParse(json['price'].toString()) ?? 0.0, 
        category: json['category'] ?? '',
        imageUrl: json['image_url'] ?? '',
        available: json['available'] == 1 || json['available'] == true,
      );
}

// lib/models/cart_item.dart
class CartItem {
  final Product product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});

  double get subtotal => product.price * quantity;

  Map<String, dynamic> toJson() => {
        'product_id': product.id,
        'name': product.name,
        'price': product.price,
        'quantity': quantity,
      };
}

// lib/models/order.dart
class Order {
  final int id;
  final String customerName;
  final String status;
  final double total;
  final String notes;
  final String createdAt;
  final List<dynamic> items;

  Order({
    required this.id,
    required this.customerName,
    required this.status,
    required this.total,
    required this.notes,
    required this.createdAt,
    required this.items,
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        // ID protetto anche qui
        id: int.tryParse(json['id'].toString()) ?? 0,
        customerName: json['customer_name'] ?? 'Cliente',
        status: json['status'] ?? '',
        total: double.tryParse(json['total'].toString()) ?? 0.0,
        notes: json['notes'] ?? '',
        createdAt: json['created_at'] ?? '',
        items: json['items'] ?? [],
      );
}