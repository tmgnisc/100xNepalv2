#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// ===== Wi-Fi Configuration =====
const char* ssid = "Redmi Note 14 Pro+ 5G";   // Replace with your Wi-Fi SSID
const char* password = "123456789";           // Replace with your Wi-Fi password

ESP8266WebServer server(80);
WiFiClient client; // Required for HTTPClient in new ESP8266 core

// ===== LED Configuration =====
// Try these pins if LED doesn't work:
//   GPIO2 (D4) - Most common, INVERTED (LOW = ON, HIGH = OFF) - ESP8266-01, NodeMCU
//   GPIO16 (D0) - Some boards use this, NOT inverted (HIGH = ON, LOW = OFF)
//   GPIO0 (D3) - Some boards use this
// If your board LED is NOT inverted, change logic: HIGH = ON, LOW = OFF
#define LED_PIN 2  // Built-in LED pin - adjust if needed
// Note: GPIO2 LED is INVERTED on most ESP8266 boards (LOW = ON, HIGH = OFF)
bool ledBlinking = false;
unsigned long blinkStartTime = 0;
unsigned long blinkInterval = 200;  // 200ms = fast blink
unsigned long lastBlinkToggle = 0;
bool ledState = HIGH;  // HIGH = LED OFF (inverted), LOW = LED ON
const unsigned long BLINK_DURATION = 10000;  // Blink for 10 seconds

// ===== Backend API URL =====
const char* SOS_API_URL = "http://192.168.1.5:3001/emergencies"; // Replace with your PC's local IP

// ===== Emergency Struct =====
struct Emergency {
  String name;
  String location;
  String type;
  String note;
};

// ===== Start LED Blinking =====
void startBlinking() {
  if (!ledBlinking) {  // Only start if not already blinking
    ledBlinking = true;
    blinkStartTime = millis();
    ledState = LOW;  // LOW = LED ON (inverted logic)
    digitalWrite(LED_PIN, ledState);
    lastBlinkToggle = millis();
    Serial.println("🚨 SOS Alert! LED blinking started!");
    Serial.print("   Duration: ");
    Serial.print(BLINK_DURATION / 1000);
    Serial.println(" seconds");
  }
}

// ===== Send SOS to Backend =====
void sendToServer(Emergency e) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(client, SOS_API_URL); // Updated API
  http.addHeader("Content-Type", "application/json");

  DynamicJsonDocument doc(256);
  doc["name"] = e.name;
  doc["location"] = e.location;
  doc["type"] = e.type;
  doc["note"] = e.note;

  String payload;
  serializeJson(doc, payload);

  int httpResponseCode = http.POST(payload);
  if (httpResponseCode > 0) {
    Serial.println("✅ SOS sent successfully to server!");
  } else {
    Serial.println("❌ Error sending SOS: " + String(httpResponseCode));
  }

  http.end();
}

// ===== Handle SOS Trigger Endpoint =====
void handleSOSTrigger() {
  Serial.println("\n=================================");
  Serial.println("📢 SOS TRIGGER RECEIVED!");
  Serial.println("=================================");
  
  Emergency e;
  
  // Try to parse JSON body if POST with body
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    Serial.print("Received body: ");
    Serial.println(body);
    
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, body);
    
    if (!error) {
      e.name = doc["name"] | "Unknown";
      e.location = doc["location"] | "Unknown";
      e.type = doc["type"] | "other";
      e.note = doc["note"] | "";
      Serial.println("✅ JSON parsed successfully");
    } else {
      Serial.print("⚠️ JSON parse error: ");
      Serial.println(error.c_str());
      // Use defaults
      e.name = "Emergency";
      e.location = "Unknown";
      e.type = "other";
      e.note = "";
    }
  } else {
    // No body data (GET request or empty POST) - use defaults
    Serial.println("ℹ️ No body data, using defaults");
    e.name = "Emergency";
    e.location = "Unknown";
    e.type = "other";
    e.note = "";
  }

  // Trigger LED blinking immediately
  Serial.println("\n💡 Starting LED blink...");
  startBlinking();

  // Send to backend API (non-blocking, will continue even if fails)
  Serial.println("📤 Sending to backend API...");
  sendToServer(e);

  // Respond to client immediately
  server.send(200, "application/json", "{\"status\":\"ok\",\"message\":\"SOS alert triggered\"}");
  Serial.println("✅ Response sent to client");
  Serial.println("=================================\n");
}

// ===== Root Page =====
void handleRoot() {
  String html = "<!DOCTYPE html><html><head><title>ESP8266 SOS Device</title></head><body>";
  html += "<h2>AarogyaConnect SOS Alert Device</h2>";
  html += "<p><strong>Status:</strong> ";
  if (WiFi.status() == WL_CONNECTED) {
    html += "<span style='color:green'>✅ Connected</span></p>";
    html += "<p><strong>IP Address:</strong> " + WiFi.localIP().toString() + "</p>";
    html += "<p><strong>Endpoint:</strong> POST /trigger-sos</p>";
  } else {
    html += "<span style='color:red'>❌ Not Connected</span></p>";
  }
  html += "</body></html>";
  server.send(200, "text/html", html);
}

// ===== Setup =====
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\nConnecting to Wi-Fi...");
  WiFi.begin(ssid, password);

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 30) {
    delay(500);
    Serial.print(".");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Wi-Fi connected!");
    Serial.print("📡 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Failed to connect Wi-Fi!");
  }

  // Initialize LED
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);  // LED OFF initially (inverted logic)
  
  // Test LED briefly to confirm it works
  Serial.println("\n💡 Testing LED...");
  digitalWrite(LED_PIN, LOW);  // Turn ON
  delay(200);
  digitalWrite(LED_PIN, HIGH); // Turn OFF
  delay(200);
  digitalWrite(LED_PIN, LOW);  // Turn ON
  delay(200);
  digitalWrite(LED_PIN, HIGH); // Turn OFF
  Serial.println("✅ LED test complete");

  // Setup HTTP server routes
  server.on("/", handleRoot);
  server.on("/trigger-sos", HTTP_POST, handleSOSTrigger);
  server.on("/trigger-sos", HTTP_GET, handleSOSTrigger);

  server.begin();
  Serial.println("\n✅ HTTP server started!");
  Serial.println("🌐 Ready for SOS alerts...");
  Serial.print("📍 Trigger URL: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/trigger-sos\n");
}

// ===== Loop =====
void loop() {
  server.handleClient();

  unsigned long now = millis();
  
  // Handle LED blinking (non-blocking)
  if (ledBlinking) {
    unsigned long elapsed = now - blinkStartTime;
    
    // Check if blink duration expired
    if (elapsed >= BLINK_DURATION) {
      ledBlinking = false;
      digitalWrite(LED_PIN, HIGH);  // Turn LED OFF (inverted logic)
      Serial.println("\n⏸️ LED blinking stopped. Ready for next alert.");
    } 
    // Toggle LED state for blinking effect
    else if (now - lastBlinkToggle >= blinkInterval) {
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState);
      lastBlinkToggle = now;
      
      // Optional: print status every 2 seconds
      if ((elapsed / 2000) != ((elapsed - blinkInterval) / 2000)) {
        Serial.print("💡 Blinking... (");
        Serial.print((BLINK_DURATION - elapsed) / 1000);
        Serial.println("s remaining)");
      }
    }
  }

  delay(10);  // Small delay to prevent watchdog issues
}