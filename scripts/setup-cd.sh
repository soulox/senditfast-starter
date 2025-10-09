#!/bin/bash

# Setup Continuous Deployment for SendItFast
# Run this script ON YOUR UBUNTU SERVER

echo "🔐 Setting up Continuous Deployment SSH Key"
echo "==========================================="
echo ""

# Generate SSH key for GitHub Actions
if [ ! -f ~/.ssh/github_actions ]; then
    echo "📝 Generating SSH key for GitHub Actions..."
    ssh-keygen -t ed25519 -f ~/.ssh/github_actions -N "" -C "github-actions-deploy"
    echo "✅ SSH key generated"
else
    echo "✅ SSH key already exists"
fi

# Add to authorized_keys
echo ""
echo "🔑 Adding public key to authorized_keys..."
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo "✅ Public key added"

echo ""
echo "=========================================="
echo "📋 COPY THE FOLLOWING TO GITHUB SECRETS:"
echo "=========================================="
echo ""
echo "1. Go to your GitHub repository"
echo "2. Settings → Secrets and variables → Actions"
echo "3. Click 'New repository secret'"
echo "4. Create these secrets:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Secret Name: SERVER_HOST"
echo "Value: $(curl -s ifconfig.me)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Secret Name: SERVER_USER"
echo "Value: $USER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Secret Name: SERVER_PORT"
echo "Value: 22"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Secret Name: SERVER_SSH_KEY"
echo "Value: (Copy the ENTIRE text below)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
cat ~/.ssh/github_actions
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Copy the ENTIRE private key including:"
echo "   -----BEGIN OPENSSH PRIVATE KEY-----"
echo "   ... (all the lines)"
echo "   -----END OPENSSH PRIVATE KEY-----"
echo ""
echo "✅ After adding secrets to GitHub, push any commit to trigger deployment!"
echo ""

