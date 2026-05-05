import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:badges/badges.dart' as badges;
import '../providers/cart_provider.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import 'cart_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<String> _categories = [];
  String _selectedCategory = '';
  List<Product> _products = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadCategories();
    SocketService().onMenuUpdated((_) => _loadProducts());
  }

  Future<void> _loadCategories() async {
    try {
      final cats = await ApiService().getCategories();
      setState(() {
        _categories = cats;
        _selectedCategory = cats.isNotEmpty ? cats.first : '';
        _error = null;
      });
      await _loadProducts();
    } catch (e) {
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _loadProducts() async {
    setState(() => _loading = true);
    try {
      final products = _selectedCategory.isEmpty
          ? await ApiService().getMenu()
          : await ApiService().getProductsByCategory(_selectedCategory);
      setState(() { _products = products; _loading = false; _error = null; });
    } catch (e) {
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFF111111),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        title: Row(children: [
          Icon(Icons.lunch_dining, color: theme.colorScheme.primary, size: 28),
          const SizedBox(width: 8),
          Text('BurgerTotem', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 22, color: theme.colorScheme.primary)),
        ]),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: badges.Badge(
              showBadge: cart.itemCount > 0,
              badgeContent: Text('${cart.itemCount}', style: const TextStyle(color: Colors.white, fontSize: 11)),
              badgeStyle: badges.BadgeStyle(badgeColor: theme.colorScheme.secondary),
              child: IconButton(
                icon: const Icon(Icons.shopping_cart_outlined),
                iconSize: 28,
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen())),
              ),
            ),
          ),
        ],
      ),
      body: Column(children: [
        // Categorie
        SizedBox(
          height: 52,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            itemCount: _categories.length,
            itemBuilder: (ctx, i) {
              final cat = _categories[i];
              final selected = cat == _selectedCategory;
              return GestureDetector(
                onTap: () { setState(() => _selectedCategory = cat); _loadProducts(); },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: BoxDecoration(
                    color: selected ? theme.colorScheme.primary : const Color(0xFF2A2A2A),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    cat[0].toUpperCase() + cat.substring(1),
                    style: TextStyle(color: selected ? Colors.white : Colors.grey[400], fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
              );
            },
          ),
        ),
        // Prodotti
        Expanded(
          child: _error != null
              ? Center(child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    const Icon(Icons.wifi_off, size: 48, color: Colors.grey),
                    const SizedBox(height: 12),
                    Text('Errore di connessione', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    Text(_error!, style: TextStyle(color: Colors.grey[500], fontSize: 12), textAlign: TextAlign.center),
                    const SizedBox(height: 16),
                    ElevatedButton(onPressed: _loadCategories, child: const Text('Riprova')),
                  ]),
                ))
              : _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _products.isEmpty
                      ? const Center(child: Text('Nessun prodotto disponibile', style: TextStyle(color: Colors.grey)))
                      : GridView.builder(
                          padding: const EdgeInsets.all(12),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2, childAspectRatio: 0.78,
                            crossAxisSpacing: 12, mainAxisSpacing: 12,
                          ),
                          itemCount: _products.length,
                          itemBuilder: (ctx, i) => _ProductCard(product: _products[i]),
                        ),
        ),
      ]),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Product product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    final cart = context.read<CartProvider>();
    final theme = Theme.of(context);
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2A2A2A)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          child: product.imageUrl.isNotEmpty
              ? Image.network(product.imageUrl, height: 120, width: double.infinity, fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _placeholder())
              : _placeholder(),
        ),
        Expanded(child: Padding(
          padding: const EdgeInsets.all(10),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(product.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14), maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 2),
            if (product.description.isNotEmpty)
              Text(product.description, style: TextStyle(fontSize: 11, color: Colors.grey[500]), maxLines: 2, overflow: TextOverflow.ellipsis),
            const Spacer(),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('€${product.price.toStringAsFixed(2)}',
                  style: TextStyle(color: theme.colorScheme.secondary, fontWeight: FontWeight.w800, fontSize: 15)),
              GestureDetector(
                onTap: () {
                  cart.addProduct(product);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('${product.name} aggiunto'),
                    duration: const Duration(seconds: 1),
                    backgroundColor: theme.colorScheme.primary,
                  ));
                },
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(color: theme.colorScheme.primary, borderRadius: BorderRadius.circular(8)),
                  child: const Icon(Icons.add, color: Colors.white, size: 18),
                ),
              ),
            ]),
          ]),
        )),
      ]),
    );
  }

  Widget _placeholder() => Container(
    height: 120, width: double.infinity, color: const Color(0xFF2A2A2A),
    child: const Icon(Icons.lunch_dining, size: 40, color: Colors.grey),
  );
}
