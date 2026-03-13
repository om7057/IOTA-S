#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== IOTA-S Setup Verification ===${NC}\n"

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
   VERSION=$(node --version)
   echo -e "${GREEN}✓ ${VERSION}${NC}"
else
   echo -e "${RED}✗ Node.js not found${NC}"
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
   VERSION=$(npm --version)
   echo -e "${GREEN}✓ ${VERSION}${NC}"
else
   echo -e "${RED}✗ npm not found${NC}"
fi

# Check Docker
echo -n "Checking Docker... "
if command -v docker &> /dev/null; then
   VERSION=$(docker --version)
   echo -e "${GREEN}✓ ${VERSION}${NC}"
else
   echo -e "${RED}✗ Docker not found (required for PostgreSQL)${NC}"
fi

# Check Docker Compose
echo -n "Checking Docker Compose... "
if command -v docker-compose &> /dev/null; then
   VERSION=$(docker-compose --version)
   echo -e "${GREEN}✓ ${VERSION}${NC}"
else
   echo -e "${RED}✗ Docker Compose not found${NC}"
fi

echo ""
echo -e "${BLUE}=== File Structure ===${NC}\n"

# Check critical files
files=(
   "docker-compose.yml"
   "init-db.sql"
   "SETUP_GUIDE.md"
   "POSTGRES_MIGRATION.md"
   "OAUTH_SETUP_GUIDE.md"
   "mobile/server/package.json"
   "mobile/server/.env"
   "mobile/server/config/database.js"
   "mobile/server/routes/auth.js"
   "mobile/client/package.json"
   "web/client/package.json"
)

for file in "${files[@]}"; do
   if [ -f "$file" ]; then
      echo -e "${GREEN}✓${NC} $file"
   else
      echo -e "${RED}✗${NC} $file"
   fi
done

echo ""
echo -e "${BLUE}=== Dependencies ===${NC}\n"

# Check backend dependencies
echo "Backend dependencies:"
if [ -d "mobile/server/node_modules" ]; then
   echo -e "${GREEN}✓${NC} node_modules installed"
else
   echo -e "${YELLOW}○${NC} run: cd mobile/server && npm install --legacy-peer-deps"
fi

# Check web dependencies
echo "Web dependencies:"
if [ -d "web/client/node_modules" ]; then
   echo -e "${GREEN}✓${NC} node_modules installed"
else
   echo -e "${YELLOW}○${NC} run: cd web/client && npm install"
fi

# Check mobile dependencies
echo "Mobile dependencies:"
if [ -d "mobile/client/node_modules" ]; then
   echo -e "${GREEN}✓${NC} node_modules installed"
else
   echo -e "${YELLOW}○${NC} run: cd mobile/client && npm install --legacy-peer-deps"
fi

echo ""
echo -e "${BLUE}=== Docker Status ===${NC}\n"

# Check Docker daemon
if docker ps &> /dev/null; then
   echo -e "${GREEN}✓${NC} Docker daemon running"
   
   # Check if services are running
   if docker ps | grep -q "iota-postgres"; then
      echo -e "${GREEN}✓${NC} PostgreSQL container (iota-postgres) is running"
   else
      echo -e "${YELLOW}○${NC} PostgreSQL not running - run: docker-compose up -d"
   fi
   
   if docker ps | grep -q "iota-redis"; then
      echo -e "${GREEN}✓${NC} Redis container (iota-redis) is running"
   else
      echo -e "${YELLOW}○${NC} Redis not running - run: docker-compose up -d"
   fi
else
   echo -e "${RED}✗${NC} Docker daemon not running"
fi

echo ""
echo -e "${BLUE}=== Environment Configuration ===${NC}\n"

if [ -f "mobile/server/.env" ]; then
   echo -e "${GREEN}✓${NC} .env file exists"
   
   # Check for critical env vars
   if grep -q "DB_HOST" mobile/server/.env; then
      echo -e "${GREEN}✓${NC} DB_HOST configured"
   else
      echo -e "${RED}✗${NC} DB_HOST missing"
   fi
   
   if grep -q "DB_USER" mobile/server/.env; then
      echo -e "${GREEN}✓${NC} DB_USER configured"
   else
      echo -e "${RED}✗${NC} DB_USER missing"
   fi
   
   if grep -q "JWT_SECRET" mobile/server/.env; then
      echo -e "${GREEN}✓${NC} JWT_SECRET configured"
   else
      echo -e "${RED}✗${NC} JWT_SECRET missing"
   fi
else
   echo -e "${RED}✗${NC} .env file not found"
fi

echo ""
echo -e "${BLUE}=== Next Steps ===${NC}\n"

echo "1. Start Docker services:"
echo "   ${YELLOW}docker-compose up -d${NC}"
echo ""
echo "2. Install dependencies (if not already done):"
echo "   ${YELLOW}cd mobile/server && npm install --legacy-peer-deps${NC}"
echo ""
echo "3. Start backend server:"
echo "   ${YELLOW}cd mobile/server && npm start${NC}"
echo ""
echo "4. In another terminal, start web frontend:"
echo "   ${YELLOW}cd web/client && npm run dev${NC}"
echo ""
echo "5. In another terminal, start mobile frontend:"
echo "   ${YELLOW}cd mobile/client && npm start${NC}"
echo ""
echo -e "${YELLOW}See SETUP_GUIDE.md for detailed instructions${NC}"
