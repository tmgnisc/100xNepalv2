# Accept Android SDK Licenses

## Quick Fix

Run this command with sudo:

```bash
sudo mkdir -p /usr/lib/android-sdk/licenses
echo -e "24333f8a63b6825ea9c5514f83c2829b004d1fee" | sudo tee /usr/lib/android-sdk/licenses/android-sdk-license
echo -e "601085b94cd77f0b54ff86406957099ebe79c4d6" | sudo tee -a /usr/lib/android-sdk/licenses/android-sdk-license
echo -e "84831b9409646a918e30573bab4c9c91346d8abd" | sudo tee /usr/lib/android-sdk/licenses/android-sdk-preview-license
```

Or copy-paste this one-liner:

```bash
sudo bash -c 'mkdir -p /usr/lib/android-sdk/licenses && echo -e "24333f8a63b6825ea9c5514f83c2829b004d1fee\n601085b94cd77f0b54ff86406957099ebe79c4d6" > /usr/lib/android-sdk/licenses/android-sdk-license && echo -e "84831b9409646a918e30573bab4c9c91346d8abd" > /usr/lib/android-sdk/licenses/android-sdk-preview-license'
```

## Verify

```bash
ls -la /usr/lib/android-sdk/licenses/
```

You should see:
- `android-sdk-license`
- `android-sdk-preview-license`

## Then Build Again

```bash
cd mobile-app/android
./gradlew assembleRelease
```

