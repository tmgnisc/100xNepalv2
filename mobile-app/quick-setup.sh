#!/bin/bash

echo "🚀 AarogyaConnect Bluetooth App - Quick Setup"
echo "=============================================="
echo ""

# Check if Android SDK is installed
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME not set!"
    echo ""
    echo "Please install Android Studio or Android SDK, then set:"
    echo "  export ANDROID_HOME=\$HOME/Android/Sdk"
    echo "  export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    echo "  export PATH=\$PATH:\$ANDROID_HOME/emulator"
    echo ""
    echo "Or follow the guide: mobile-app/ANDROID_SETUP.md"
    exit 1
fi

echo "✅ ANDROID_HOME: $ANDROID_HOME"

# Check ADB
if ! command -v adb &> /dev/null; then
    echo "❌ ADB not found in PATH!"
    echo "Add to PATH: $ANDROID_HOME/platform-tools"
    exit 1
fi

echo "✅ ADB found: $(which adb)"

# Check Java
if [ -z "$JAVA_HOME" ]; then
    echo "⚠️  JAVA_HOME not set (might still work if java is in PATH)"
else
    echo "✅ JAVA_HOME: $JAVA_HOME"
fi

# Create local.properties if missing
if [ ! -f "android/local.properties" ]; then
    echo "📝 Creating android/local.properties..."
    echo "sdk.dir=$ANDROID_HOME" > android/local.properties
    echo "✅ Created local.properties"
else
    echo "✅ local.properties exists"
fi

# Check for connected devices
echo ""
echo "📱 Checking for connected devices/emulators..."
DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l)
if [ "$DEVICES" -eq 0 ]; then
    echo "⚠️  No devices found!"
    echo ""
    echo "Options:"
    echo "  1. Connect a physical Android device via USB"
    echo "  2. Start an Android emulator"
    echo ""
    echo "To create emulator:"
    echo "  avdmanager create avd -n test -k 'system-images;android-34;google_apis;x86_64'"
    echo "  emulator -avd test &"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Found $DEVICES device(s)"
fi

echo ""
echo "✅ Setup complete! You can now run:"
echo "   npm run android"
echo ""

