#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// ===== Wi-Fi Configuration =====
const char* ssid = "Redmi Note 14 Pro+ 5G";
const char* password = "123456789";

// ===== Backend JSON Server =====
const char* SOS_API_URL = "http://10.142.67.208:3001/emergencies"; 
// ⚠️ Replace 0.0.0.0 with your PC’s LAN IP, e.g. "http://192.168.43.50:3001/emergencies"

WiFiClient client;

// ===== LED Configuration =====
#define LED_PIN 2  // Built-in LED on ESP8266 (GPIO2, D4)
bool ledBlinking = false;
unsigned long blinkStartTime = 0;
unsigned long blinkInterval = 200;
unsigned long lastBlinkToggle = 0;
bool ledState = HIGH;
const unsigned long BLINK_DURATION = 5500; // 5.5 seconds

// ===== Polling Control =====
unsigned long lastPollTime = 0;
const unsigned long POLL_INTERVAL = 5000; // every 5 seconds
int lastKnownCount = 0;  // stores how many SOS entries were seen last time

// ===== LED Functions =====
void startBlinking() {
  ledBlinking = true;
  blinkStartTime = millis();
  ledState = LOW;
  digitalWrite(LED_PIN, ledState);
  lastBlinkToggle = millis();
  Serial.println("🚨 New SOS detected! LED blinking started!");
}

void stopBlinking() {
  ledBlinking = false;
  digitalWrite(LED_PIN, HIGH);
  Serial.println("✅ LED blinking stopped.");
}

// ===== Fetch Emergency Count =====
int getSOSCount() {
  if (WiFi.status() != WL_CONNECTED) return -1;

  HTTPClient http;
  http.begin(client, SOS_API_URL);
  int httpCode = http.GET();

  if (httpCode != HTTP_CODE_OK) {
    Serial.println("❌ Failed to fetch SOS list");
    http.end();
    return -1;
  }

  String payload = http.getString();
  http.end();

  DynamicJsonDocument doc(2048);
  DeserializationError error = deserializeJson(doc, payload);

  if (error) {
    Serial.println("⚠️ JSON parse error");
    return -1;
  }

  int count = doc.size();
  Serial.printf("📦 Total SOS entries: %d\n", count);
  return count;
}

// ===== Setup =====
void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);

  Serial.println("\nConnecting to Wi-Fi...");
  WiFi.begin(ssid, password);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 30) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Connected!");
    Serial.print("📡 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Wi-Fi connection failed!");
  }

  // Initial fetch
  lastKnownCount = getSOSCount();
  Serial.printf("🔍 Initial SOS count: %d\n", lastKnownCount);
}

// ===== Loop =====
void loop() {
  // Handle blinking LED
  unsigned long now = millis();
  if (ledBlinking) {
    if (now - blinkStartTime >= BLINK_DURATION) {
      stopBlinking();
    } else if (now - lastBlinkToggle >= blinkInterval) {
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState);
      lastBlinkToggle = now;
    }
  }

  // Periodic JSON Server polling
  if (now - lastPollTime >= POLL_INTERVAL) {
    lastPollTime = now;
    int currentCount = getSOSCount();

    if (currentCount > lastKnownCount && currentCount != -1) {
      Serial.println("🆕 New SOS entry detected!");
      startBlinking();
      lastKnownCount = currentCount;
    }
  }
}