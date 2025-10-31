#!/bin/bash

echo "📦 Setting up Gradle Wrapper..."

cd "$(dirname "$0")/android/gradle/wrapper"

# Download gradle-wrapper.jar if missing
if [ ! -f "gradle-wrapper.jar" ]; then
    echo "Downloading gradle-wrapper.jar..."
    curl -L -o gradle-wrapper.jar https://github.com/gradle/gradle/raw/v8.3.0/gradle/wrapper/gradle-wrapper.jar
    
    if [ ! -f "gradle-wrapper.jar" ]; then
        echo "❌ Failed to download. Trying alternative method..."
        # Alternative: Use gradle to bootstrap itself
        cd ../../..
        if command -v gradle &> /dev/null; then
            gradle wrapper
        else
            echo "Please install Gradle or download manually:"
            echo "https://github.com/gradle/gradle/raw/v8.3.0/gradle/wrapper/gradle-wrapper.jar"
            echo "Save to: android/gradle/wrapper/gradle-wrapper.jar"
            exit 1
        fi
    else
        echo "✅ Downloaded gradle-wrapper.jar"
    fi
else
    echo "✅ gradle-wrapper.jar already exists"
fi

cd ../../..
echo "✅ Gradle wrapper setup complete!"

