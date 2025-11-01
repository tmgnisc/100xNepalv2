#!/bin/bash

# Script to start Android emulator and run React Native app

set -e

echo "🚀 Starting Android Emulator for AarogyaConnect..."

# Check if emulator is already running
if adb devices | grep -q "device$"; then
    echo "✅ Emulator is already running!"
    DEVICE=$(adb devices | grep "device$" | awk '{print $1}')
    echo "📱 Device: $DEVICE"
else
    echo "📱 Starting emulator..."
    $ANDROID_HOME/emulator/emulator -avd aarogya_emulator -no-snapshot-load &
    
    echo "⏳ Waiting for emulator to boot (this may take 1-2 minutes)..."
    
    # Wait for emulator to be ready
    timeout=120
    counter=0
    while ! adb devices | grep -q "device$"; do
        if [ $counter -ge $timeout ]; then
            echo "❌ Timeout waiting for emulator to start"
            exit 1
        fi
        sleep 2
        counter=$((counter + 2))
        if [ $((counter % 10)) -eq 0 ]; then
            echo "   Still waiting... ($counter seconds)"
        fi
    done
    
    echo "✅ Emulator is ready!"
fi

# Wait a bit more for Android to fully boot
echo "⏳ Waiting for Android to fully boot..."
sleep 10

# Check if Metro bundler needs to be started
if ! lsof -i :8081 > /dev/null 2>&1; then
    echo "📦 Starting Metro bundler..."
    npm start &
    sleep 5
fi

# Install and run the app
echo "📲 Installing and running app on emulator..."
cd /home/shifu/Downloads/aarogya-connect-live-main/mobile-app
npx react-native run-android

echo "✅ App should now be running on the emulator!"

