// lib/services/socket_service.dart
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../config/constants.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  late IO.Socket socket;

  void connect() {
    socket = IO.io(
      AppConfig.socketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .build(),
    );
    socket.connect();

    socket.onConnect((_) {
      print('✅ WebSocket connesso');
    });

    socket.onDisconnect((_) {
      print('❌ WebSocket disconnesso');
    });
  }

  void onMenuUpdated(Function(dynamic) callback) {
    socket.on('menu_updated', callback);
  }

  void onOrderUpdated(Function(dynamic) callback) {
    socket.on('order_updated', callback);
  }

  void onOrderNew(Function(dynamic) callback) {
    socket.on('order_new', callback);
  }

  void disconnect() {
    socket.disconnect();
  }
}
