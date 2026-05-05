// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../models/models.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final String _base = AppConfig.baseUrl;

  // ── Prodotti ─────────────────────────────────────────────────────

  Future<List<Product>> getMenu() async {
    final res = await http.get(Uri.parse('$_base/menu'));
    if (res.statusCode == 200) {
      final List data = jsonDecode(res.body);
      return data.map((e) => Product.fromJson(e)).toList();
    }
    throw Exception('Errore nel caricamento del menù');
  }

  Future<List<Product>> getProductsByCategory(String category) async {
    final res = await http.get(Uri.parse('$_base/menu/category/$category'));
    if (res.statusCode == 200) {
      final List data = jsonDecode(res.body);
      return data.map((e) => Product.fromJson(e)).toList();
    }
    throw Exception('Errore nel caricamento dei prodotti');
  }

  Future<List<String>> getCategories() async {
    final res = await http.get(Uri.parse('$_base/categories'));
    if (res.statusCode == 200) {
      final List data = jsonDecode(res.body);
      return data.map<String>((e) => e['name'] as String).toList();
    }
    throw Exception('Errore nel caricamento delle categorie');
  }

  // ── Ordini ───────────────────────────────────────────────────────

  Future<int> createOrder({
    required String customerName,
    required List<Map<String, dynamic>> items,
    String notes = '',
  }) async {
    final res = await http.post(
      Uri.parse('$_base/orders'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'customer_name': customerName,
        'items': items,
        'notes': notes,
      }),
    );
    if (res.statusCode == 201) {
      return jsonDecode(res.body)['id'];
    }
    throw Exception('Errore nella creazione dell\'ordine');
  }

  Future<Order> getOrder(int orderId) async {
    final res = await http.get(Uri.parse('$_base/orders/$orderId'));
    if (res.statusCode == 200) {
      return Order.fromJson(jsonDecode(res.body));
    }
    throw Exception('Ordine non trovato');
  }
}
