import { Card, CardContent } from "@/components/ui/card";
import { Activity, Heart, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const values = [
    {
      icon: Zap,
      title: "Rapid Response",
      description: "Every second counts in emergencies. Our platform ensures instant alert delivery and coordination.",
    },
    {
      icon: Heart,
      title: "Community Driven",
      description: "Built for rural Nepal, connecting remote villages with life-saving healthcare resources.",
    },
    {
      icon: Shield,
      title: "Reliable & Secure",
      description: "Trusted infrastructure ensuring emergency alerts reach the right people at the right time.",
    },
    {
      icon: Activity,
      title: "Real-Time Coordination",
      description: "Live tracking and updates connecting patients, municipalities, hospitals, and volunteers.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About AarogyaConnect</h1>
          <p className="text-xl text-muted-foreground">
            Connecting Lives Across Nepal
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              AarogyaConnect is a rural emergency coordination platform designed to bridge the healthcare gap 
              in remote areas of Nepal. When medical emergencies strike in rural communities, distance and 
              communication barriers can be life-threatening.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our platform enables instant emergency alerts from rural areas, real-time coordination through 
              municipality dashboards, and seamless connection with hospitals and ambulance services—ensuring 
              that help arrives when it's needed most.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emergency text-emergency-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold mb-1">Rural Alert</h3>
                  <p className="text-muted-foreground">
                    Community members trigger SOS alerts with emergency details through a simple interface.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-trust text-trust-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold mb-1">Municipality Coordination</h3>
                  <p className="text-muted-foreground">
                    Local authorities receive alerts, assess situations, and coordinate with hospitals and ambulances.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold mb-1">Hospital Response</h3>
                  <p className="text-muted-foreground">
                    Hospitals prepare for incoming patients, dispatch ambulances, and provide real-time status updates.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-warning text-warning-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-bold mb-1">Volunteer Network</h3>
                  <p className="text-muted-foreground">
                    Ambulance drivers and volunteers track their missions, update progress, and ensure timely care.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
