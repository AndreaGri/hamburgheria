# 🍔 Hamburgeria — Sistema Informatico Completo

Sistema digitalizzato composto da:
- **Backend Flask** — API REST + WebSocket (SocketIO)
- **Angular SPA** — Pannello staff per ordini e menù
- **Flutter** — Totem cliente per ordinare

---

## 📁 Struttura del progetto

```
hamburgeria/
├── backend/
│   ├── app.py              # Entry point Flask + Socket.IO
│   ├── database.py         # DatabaseWrapper (tutte le query qui)
│   ├── requirements.txt
│   └── .env                # Credenziali DB (NON committare)
├── angular_staff/
│   ├── src/app/
│   │   ├── app.component.ts        # Shell con sidebar
│   │   ├── app.routes.ts           # Routing
│   │   ├── app.config.ts
│   │   ├── models/models.ts        # Interfacce TypeScript
│   │   ├── services/
│   │   │   ├── api.service.ts      # Chiamate REST
│   │   │   └── socket.service.ts  # WebSocket
│   │   └── components/
│   │       ├── orders/             # Vista ordini kanban
│   │       └── menu-manager/       # Gestione prodotti
│   ├── package.json
│   └── angular.json
├── flutter_totem/
│   ├── lib/
│   │   ├── main.dart
│   │   ├── config/constants.dart
│   │   ├── models/models.dart
│   │   ├── providers/cart_provider.dart
│   │   ├── services/
│   │   │   ├── api_service.dart
│   │   │   └── socket_service.dart
│   │   └── screens/
│   │       ├── home_screen.dart        # Menù + categorie
│   │       ├── cart_screen.dart        # Carrello + invio ordine
│   │       └── order_status_screen.dart # Tracking ordine RT
│   └── pubspec.yaml
├── .gitignore
└── setup.sh
```

---

## ⚡ Comandi bash — copia e incolla nel terminale

### 0. Clona / entra nella cartella
```bash
cd hamburgeria
```

---

### 1. 🐍 BACKEND — Flask

```bash
# Vai nella cartella backend
cd backend

# Crea virtualenv Python
python3 -m venv venv

# Attiva virtualenv (Linux/Mac)
source venv/bin/activate

# Attiva virtualenv (Windows PowerShell)
# venv\Scripts\Activate.ps1

# Installa le dipendenze
pip install -r requirements.txt

# ⚠️  Configura il file .env con le tue credenziali Aiven:
# DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# Avvia il server (inizializza anche il DB)
python app.py
```

Il backend sarà disponibile su: `http://localhost:5000`

---

### 2. 🅰️ ANGULAR — Staff Panel

```bash
# (in un nuovo terminale)
cd angular_staff

# Installa le dipendenze npm
npm install

# Avvia il server di sviluppo
npm start
# oppure:
npx ng serve --open
```

Il pannello staff sarà su: `http://localhost:4200`

---

### 3. 📱 FLUTTER — Totem Cliente

```bash
# (in un nuovo terminale)
cd flutter_totem

# Scarica i package Flutter
flutter pub get

# Verifica dispositivi disponibili
flutter devices

# Avvia su Chrome (modalità web — ideale per totem)
flutter run -d chrome

# Oppure su un dispositivo Android/iOS connesso
flutter run

# Build per produzione web
flutter build web
```

---

## 🔌 API REST — Riepilogo endpoint

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/menu` | Tutti i prodotti |
| GET | `/menu/category/<cat>` | Prodotti per categoria |
| POST | `/menu` | Aggiungi prodotto |
| PUT | `/menu/<id>` | Modifica prodotto |
| DELETE | `/menu/<id>` | Elimina prodotto |
| GET | `/categories` | Lista categorie |
| GET | `/orders` | Tutti gli ordini |
| GET | `/orders?status=in_attesa` | Ordini filtrati |
| GET | `/orders/<id>` | Ordine specifico |
| POST | `/orders` | Crea ordine |
| PATCH | `/orders/<id>/status` | Aggiorna stato ordine |

## ⚡ WebSocket — Eventi

| Evento | Direzione | Descrizione |
|--------|-----------|-------------|
| `connected` | server→client | Connessione stabilita |
| `order_new` | server→client | Nuovo ordine creato |
| `order_updated` | server→client | Stato ordine cambiato |
| `menu_updated` | server→client | Menù modificato |
| `subscribe_orders` | client→server | Snapshot ordini attuali |

## 🗄️ Configurazione .env (backend)

```env
DB_HOST=your-host.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your_password
DB_NAME=hamburgeria
SECRET_KEY=cambia_in_produzione
```

## 📦 Categorie di default

Il sistema inizializza automaticamente: `panini`, `menu`, `bevande`, `dolci`, `contorni`
