// lib/screens/order_status_screen.dart
import 'package:flutter/material.dart';
import '../config/constants.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import 'home_screen.dart';

class OrderStatusScreen extends StatefulWidget {
  final int orderId;
  const OrderStatusScreen({super.key, required this.orderId});
  @override
  State<OrderStatusScreen> createState() => _OrderStatusScreenState();
}

class _OrderStatusScreenState extends State<OrderStatusScreen> {
  Order? _order;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadOrder();
    // Aggiornamento in real-time via WebSocket
    SocketService().onOrderUpdated((data) {
      if (data['id'] == widget.orderId) {
        _loadOrder();
      }
    });
  }

  Future<void> _loadOrder() async {
    final o = await ApiService().getOrder(widget.orderId);
    setState(() {
      _order = o;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFF111111),
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.receipt_long_outlined,
                        size: 64, color: Colors.grey),
                    const SizedBox(height: 16),
                    Text('Ordine #${_order!.id}',
                        style: const TextStyle(
                            fontSize: 26, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    Text('Ciao, ${_order!.customerName}!',
                        style: TextStyle(
                            color: Colors.grey[400], fontSize: 16)),
                    const SizedBox(height: 40),
                    _StatusStep(
                        label: 'In attesa',
                        icon: Icons.hourglass_empty,
                        active: _order!.status == OrderStatus.inAttesa),
                    _statusLine(),
                    _StatusStep(
                        label: 'In preparazione',
                        icon: Icons.soup_kitchen_outlined,
                        active:
                            _order!.status == OrderStatus.inPreparazione),
                    _statusLine(),
                    _StatusStep(
                        label: 'Pronto! 🍔',
                        icon: Icons.check_circle_outline,
                        active: _order!.status == OrderStatus.pronto),
                    const SizedBox(height: 48),
                    if (_order!.status == OrderStatus.pronto)
                      Column(
                        children: [
                          Text('Il tuo ordine è pronto!',
                              style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: theme.colorScheme.secondary)),
                          const SizedBox(height: 8),
                          Text('Ritira al banco',
                              style: TextStyle(color: Colors.grey[400])),
                        ],
                      )
                    else
                      Text(OrderStatus.label(_order!.status),
                          style: TextStyle(
                              color: theme.colorScheme.primary,
                              fontSize: 18,
                              fontWeight: FontWeight.w600)),
                    const SizedBox(height: 40),
                    TextButton(
                      onPressed: () => Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(builder: (_) => const HomeScreen()),
                        (_) => false,
                      ),
                      child: const Text('Torna al menù'),
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _statusLine() => Container(
      height: 32,
      width: 2,
      margin: const EdgeInsets.symmetric(vertical: 4),
      color: const Color(0xFF2A2A2A));
}

class _StatusStep extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool active;
  const _StatusStep(
      {required this.label, required this.icon, required this.active});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: active
                ? theme.colorScheme.primary
                : const Color(0xFF2A2A2A),
            shape: BoxShape.circle,
          ),
          child: Icon(icon,
              color: active ? Colors.white : Colors.grey, size: 22),
        ),
        const SizedBox(width: 14),
        Text(label,
            style: TextStyle(
                fontSize: 16,
                fontWeight:
                    active ? FontWeight.w700 : FontWeight.w400,
                color: active ? Colors.white : Colors.grey[600])),
      ],
    );
  }
}
