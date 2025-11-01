#!/bin/bash

# Quick script to start emulator and run app

echo "🔧 Checking KVM access..."
if ! groups | grep -q kvm; then
    echo "⚠️  You're not in the 'kvm' group."
    echo "   Run this command (then logout/login):"
    echo "   sudo usermod -a -G kvm $USER"
    echo ""
    echo "   Or use Android Studio's emulator instead."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📱 Starting emulator..."
$ANDROID_HOME/emulator/emulator -avd aarogya_emulator &

echo "⏳ Waiting for emulator to boot (60 seconds max)..."
timeout=60
counter=0
while ! adb devices 2>/dev/null | grep -q "device$"; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Timeout - emulator didn't start"
        echo "💡 Try starting emulator manually from Android Studio"
        exit 1
    fi
    sleep 2
    counter=$((counter + 2))
    if [ $((counter % 10)) -eq 0 ]; then
        echo "   Still waiting... (${counter}s)"
    fi
done

echo "✅ Emulator is ready!"
adb devices

echo ""
echo "🚀 Now run the app:"
echo "   npm run android"
echo ""
echo "   Or in a new terminal:"
echo "   cd $(pwd) && npm run android"

