#!/bin/bash

echo "🔍 AarogyaConnect Crash Debugger"
echo "=================================="
echo ""
echo "This will show real-time logs from the app"
echo "Press Ctrl+C to stop"
echo ""
echo "Starting logcat filter..."
echo ""

adb logcat -c  # Clear old logs
adb logcat | grep -E "aarogyaconnect|ReactNative|AndroidRuntime|FATAL|ERROR|Exception" --color=always


