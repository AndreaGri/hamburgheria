#!/bin/bash
# ================================================================
#  HAMBURGERIA — Script di setup completo
#  Esegui dalla cartella radice del progetto: bash setup.sh
# ================================================================

set -e  # Esci in caso di errore

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🍔 Setup Hamburgeria — Sistema completo${NC}\n"

# ──────────────────────────────────────────────────────────────────
# 1. BACKEND (Flask)
# ──────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[1/3] Setup Backend Flask...${NC}"

cd backend

# Crea e attiva virtualenv
python3 -m venv venv
source venv/bin/activate     # Linux/Mac
# venv\Scripts\activate       # Windows — decommentare se necessario

# Installa dipendenze
pip install -r requirements.txt

# Copia .env se non esiste
if [ ! -f .env ]; then
  cp .env .env.local
  echo -e "${YELLOW}⚠  Configura il file backend/.env con le credenziali Aiven!${NC}"
fi

echo -e "${GREEN}✅ Backend pronto!${NC}"
cd ..

# ──────────────────────────────────────────────────────────────────
# 2. ANGULAR STAFF PANEL
# ──────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[2/3] Setup Angular Staff Panel...${NC}"

cd angular_staff
npm install
echo -e "${GREEN}✅ Angular pronto!${NC}"
cd ..

# ──────────────────────────────────────────────────────────────────
# 3. FLUTTER TOTEM
# ──────────────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[3/3] Setup Flutter Totem...${NC}"

cd flutter_totem
flutter pub get
echo -e "${GREEN}✅ Flutter pronto!${NC}"
cd ..

echo -e "\n${GREEN}🎉 Setup completato!${NC}"
echo -e "\n${CYAN}Come avviare i servizi:${NC}"
echo -e "  Backend:  cd backend && source venv/bin/activate && python app.py"
echo -e "  Angular:  cd angular_staff && npm start"
echo -e "  Flutter:  cd flutter_totem && flutter run -d chrome  (o -d <device_id>)"
