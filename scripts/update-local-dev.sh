#!/bin/bash

# Script to update local development environment with latest changes from main branch
# Author: Kawika Ohumukini
# Date: April 11, 2025

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}    SelfHostHub n8n Node Local Update Script      ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Function to check if command was successful
check_status() {
  if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: $1 failed${NC}"
    echo -e "${YELLOW}Exiting script. Please resolve issues before retrying.${NC}"
    exit 1
  else
    echo -e "${GREEN}✓ $2${NC}"
  fi
}

# Step 1: Save any local changes
echo -e "\n${BLUE}Step 1: Checking for local changes...${NC}"
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}You have local uncommitted changes:${NC}"
  git status -s
  read -p "Do you want to stash these changes before updating? (y/N): " stash_choice
  stash_choice=${stash_choice:-n}
  if [[ $stash_choice =~ ^[Yy]$ ]]; then
    echo "Stashing local changes..."
    git stash
    check_status "Git stash" "Local changes stashed successfully"
  else
    echo -e "${YELLOW}Proceeding with local changes in place. This might cause merge conflicts.${NC}"
  fi
else
  echo -e "${GREEN}✓ No local uncommitted changes detected${NC}"
fi

# Step 2: Fetch the latest changes from GitHub
echo -e "\n${BLUE}Step 2: Fetching latest changes from GitHub...${NC}"
git fetch origin
check_status "Git fetch" "Latest changes fetched successfully"

# Step 3: Merge changes from main branch
echo -e "\n${BLUE}Step 3: Merging changes from main branch...${NC}"
git merge origin/main
check_status "Git merge" "Merged origin/main into local branch"

# Step 4: Update dependencies if package.json changed
echo -e "\n${BLUE}Step 4: Checking if package.json needs to be updated...${NC}"
if git diff --name-only HEAD@{1} HEAD | grep -q "package.json"; then
  echo "package.json has changed. Installing dependencies..."
  npm install --legacy-peer-deps
  check_status "npm install" "Dependencies installed successfully"
else
  echo -e "${GREEN}✓ No changes to package.json detected${NC}"
fi

# Step 5: Build the package
echo -e "\n${BLUE}Step 5: Building the package...${NC}"
npm run build
check_status "npm run build" "Package built successfully"

# Step 6: Check if n8n custom directory exists and create if needed
N8N_CUSTOM_DIR="$HOME/.n8n/custom"
echo -e "\n${BLUE}Step 6: Checking n8n custom directory...${NC}"
if [ ! -d "$N8N_CUSTOM_DIR" ]; then
  echo "Creating n8n custom directory: $N8N_CUSTOM_DIR"
  mkdir -p "$N8N_CUSTOM_DIR"
  check_status "Create directory" "n8n custom directory created"
fi

# Step 7: Set up npm links for the new Self-Host node
echo -e "\n${BLUE}Step 7: Setting up SelfHostHub node links...${NC}"

# Clean up old node links if they exist
echo -e "\n${BLUE}Step 7b: Cleaning up old node links...${NC}"
if npm ls -g --link | grep -q "n8n-nodes-leonardoai"; then
  echo "Unlinking old n8n-nodes-leonardoai node..."
  npm -g unlink n8n-nodes-leonardoai || true
  echo -e "${GREEN}✓ Old node global link removed${NC}"
  
  # Remove link from n8n custom directory if it exists
  if [ -L "$N8N_CUSTOM_DIR/node_modules/n8n-nodes-leonardoai" ]; then
    echo "Removing old node link from n8n custom directory..."
    rm -f "$N8N_CUSTOM_DIR/node_modules/n8n-nodes-leonardoai"
    echo -e "${GREEN}✓ Old node local link removed${NC}"
  fi
elif npm ls -g --link | grep -q "n8n-nodes-selfhosthub"; then
  echo "Unlinking existing n8n-nodes-selfhosthub node..."
  npm -g unlink n8n-nodes-selfhosthub || true
  echo -e "${GREEN}✓ Existing node global link removed${NC}"
  
  # Remove link from n8n custom directory if it exists
  if [ -L "$N8N_CUSTOM_DIR/node_modules/n8n-nodes-selfhosthub" ]; then
    echo "Removing existing node link from n8n custom directory..."
    rm -f "$N8N_CUSTOM_DIR/node_modules/n8n-nodes-selfhosthub"
    echo -e "${GREEN}✓ Existing node local link removed${NC}"
  fi
else
  echo -e "${GREEN}✓ No old node links detected${NC}"
fi

# Create new package link for SelfHostHub version
echo "Setting up npm link for SelfHostHub node..."
npm link
check_status "npm link" "Global npm link for SelfHostHub node established"

# Get the package name from package.json
PACKAGE_NAME=$(node -e "console.log(require('./package.json').name)")
echo "Detected package name: $PACKAGE_NAME"

# Link the new node to n8n
echo "Linking $PACKAGE_NAME to n8n..."
cd "$N8N_CUSTOM_DIR"
npm link "$PACKAGE_NAME"
check_status "npm link in n8n directory" "Local npm link established for $PACKAGE_NAME"
cd - > /dev/null

echo -e "${GREEN}✓ SelfHostHub node links configured${NC}"

# Step 8: Pop stashed changes if needed
if [[ $stash_choice =~ ^[Yy]$ ]]; then
  echo -e "\n${BLUE}Step 8: Restoring stashed changes...${NC}"
  git stash pop
  if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Warning: There were conflicts when restoring stashed changes.${NC}"
    echo -e "${YELLOW}Please resolve conflicts manually.${NC}"
  else
    echo -e "${GREEN}✓ Stashed changes restored successfully${NC}"
  fi
fi

# Step 9: Start n8n
echo -e "\n${BLUE}Step 9: Starting n8n...${NC}"
echo -e "${YELLOW}Do you want to start n8n now? (Y/n): ${NC}"
read -p "" start_choice
  start_choice=${start_choice:-y}
if [[ $start_choice =~ ^[Yy]$ ]]; then
  echo "Starting n8n..."
  n8n start
else
  echo -e "${GREEN}✓ Update complete!${NC}"
  echo -e "${YELLOW}You can start n8n manually with 'n8n start' when ready.${NC}"
fi

echo -e "\n${BLUE}==================================================${NC}"
echo -e "${GREEN}SelfHostHub n8n Node update process completed!${NC}"
echo -e "${BLUE}==================================================${NC}"
