#!/bin/bash

echo "🔨 Building Android APK for AarogyaConnect Bluetooth..."
echo "======================================================"

# Check if ANDROID_HOME is set
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME not set!"
    echo ""
    echo "Please set Android SDK path:"
    echo "  export ANDROID_HOME=\$HOME/Android/Sdk"
    echo "  export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    echo ""
    exit 1
fi

# Create local.properties if missing
if [ ! -f "android/local.properties" ]; then
    echo "📝 Creating local.properties..."
    echo "sdk.dir=$ANDROID_HOME" > android/local.properties
fi

# Setup Gradle wrapper if needed
if [ ! -f "android/gradle/wrapper/gradle-wrapper.jar" ]; then
    echo "📦 Setting up Gradle wrapper..."
    ./setup-gradle.sh
fi

cd android

echo ""
echo "🔨 Building release APK..."
echo ""

# Build release APK
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    if [ -f "$APK_PATH" ]; then
        echo ""
        echo "✅ APK built successfully!"
        echo "📦 Location: $APK_PATH"
        echo ""
        echo "📱 To install on device:"
        echo "   adb install -r $APK_PATH"
        echo ""
        echo "📤 File size: $(du -h $APK_PATH | cut -f1)"
        echo ""
        
        # Copy to root for easy access
        cp "$APK_PATH" "../AarogyaConnect-Bluetooth.apk"
        echo "✅ Also copied to: ../AarogyaConnect-Bluetooth.apk"
    else
        echo "❌ APK not found at expected location"
    fi
else
    echo "❌ Build failed!"
    exit 1
fi

