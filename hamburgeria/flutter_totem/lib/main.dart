// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/cart_provider.dart';
import 'screens/home_screen.dart';
import 'services/socket_service.dart';

void main() {
  SocketService().connect();
  runApp(
    ChangeNotifierProvider(
      create: (_) => CartProvider(),
      child: const HamburgeriaApp(),
    ),
  );
}

class HamburgeriaApp extends StatelessWidget {
  const HamburgeriaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BurgerTotem',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFE63946),
          brightness: Brightness.dark,
          primary: const Color(0xFFE63946),
          secondary: const Color(0xFFF4A261),
          surface: const Color(0xFF1A1A1A),
        ),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
        scaffoldBackgroundColor: const Color(0xFF111111),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
