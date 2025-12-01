#!/bin/bash

echo "🚀 Starting iPhone 16 Pro on port 1235..."

cd "$(dirname "$0")/.."

if [ ! -f "package.json" ]; then
    echo "❌ Error: Run the script from the root directory of the mobile project"
    exit 1
fi

echo "📱 Checking availability of iPhone 16 Pro..."
DEVICES=$(xcrun simctl list devices | grep "iPhone 16 Pro")

if [[ ! $DEVICES == *"iPhone 16 Pro"* ]]; then
    echo "❌ Error: iPhone 16 Pro not found in simulators"
    exit 1
fi

echo "✅ iPhone 16 Pro found"

IPHONE_16_PRO_ID=$(xcrun simctl list devices | grep "iPhone 16 Pro" | grep -o '([A-F0-9-]*' | tr -d '(')

echo "📱 iPhone 16 Pro ID: $IPHONE_16_PRO_ID"

echo "🔧 Starting iPhone 16 Pro (port 1235)..."
npx expo run:ios --port 1235 --device "iPhone 16 Pro"
