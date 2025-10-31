#!/bin/bash

echo "📝 Accepting Android SDK Licenses..."
echo ""

# Create licenses directory
sudo mkdir -p /usr/lib/android-sdk/licenses

# Accept Android SDK license
echo -e "24333f8a63b6825ea9c5514f83c2829b004d1fee" | sudo tee /usr/lib/android-sdk/licenses/android-sdk-license
echo -e "601085b94cd77f0b54ff86406957099ebe79c4d6" | sudo tee -a /usr/lib/android-sdk/licenses/android-sdk-license

# Accept Android SDK Preview license
echo -e "84831b9409646a918e30573bab4c9c91346d8abd" | sudo tee /usr/lib/android-sdk/licenses/android-sdk-preview-license

echo ""
echo "✅ Licenses accepted!"
echo ""
echo "Verifying..."
ls -la /usr/lib/android-sdk/licenses/
echo ""
echo "You can now run: ./gradlew assembleRelease"

