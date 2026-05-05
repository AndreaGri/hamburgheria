class AppConfig {
  static const String baseUrl = 'https://supreme-zebra-4jqpq49rgjxgfjppv-5000.app.github.dev';
  static const String socketUrl = 'https://supreme-zebra-4jqpq49rgjxgfjppv-5000.app.github.dev';
}

class OrderStatus {
  static const String inAttesa = 'in_attesa';
  static const String inPreparazione = 'in_preparazione';
  static const String pronto = 'pronto';
  static const String consegnato = 'consegnato';

  static String label(String status) {
    switch (status) {
      case inAttesa: return 'In attesa';
      case inPreparazione: return 'In preparazione';
      case pronto: return 'Pronto! 🍔';
      case consegnato: return 'Consegnato';
      default: return status;
    }
  }
}
