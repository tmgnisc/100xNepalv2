import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Users, Building2, Ambulance, AlertTriangle, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      icon: AlertTriangle,
      title: "Rural SOS Alerts",
      description: "Simple one-tap emergency alerts from remote villages",
      link: "/rural",
      color: "text-emergency",
    },
    {
      icon: Users,
      title: "Municipality Dashboard",
      description: "Centralized emergency coordination and routing",
      link: "/municipality",
      color: "text-trust",
    },
    {
      icon: Building2,
      title: "Hospital Management",
      description: "Real-time patient intake and resource tracking",
      link: "/hospital",
      color: "text-success",
    },
    {
      icon: Ambulance,
      title: "Volunteer Network",
      description: "Mobile responders and ambulance coordination",
      link: "/volunteer",
      color: "text-warning",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emergency/10 via-trust/10 to-success/10" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-emergency/10 text-emergency px-4 py-2 rounded-full mb-6 font-medium">
              <Activity className="h-4 w-4" />
              <span>Connecting Lives Across Nepal</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Emergency Healthcare
              <br />
              <span className="bg-gradient-to-r from-emergency via-trust to-success bg-clip-text text-transparent">
                When Every Second Counts
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AarogyaConnect bridges the gap between rural communities and healthcare facilities, 
              ensuring rapid emergency response through real-time coordination.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link to="/rural">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Trigger SOS Alert
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg">
                <Link to="/municipality">
                  <Users className="mr-2 h-5 w-5" />
                  View Dashboard
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A seamless flow from emergency alert to medical response
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={feature.link}>
                  <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary">
                    <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl md:text-5xl font-bold text-emergency mb-2">
                <Heart className="inline h-12 w-12 mb-2" />
              </div>
              <div className="text-3xl font-bold mb-2">2,500+</div>
              <p className="text-muted-foreground">Lives Connected</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl md:text-5xl font-bold text-trust mb-2">
                <Ambulance className="inline h-12 w-12 mb-2" />
              </div>
              <div className="text-3xl font-bold mb-2">45</div>
              <p className="text-muted-foreground">Active Ambulances</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl md:text-5xl font-bold text-success mb-2">
                <Building2 className="inline h-12 w-12 mb-2" />
              </div>
              <div className="text-3xl font-bold mb-2">12</div>
              <p className="text-muted-foreground">Partner Hospitals</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
