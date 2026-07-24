"use client";

import { motion, useScroll, useTransform, cubicBezier } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Play, Lock, FileKey, Share2, Shield, TrendingUp, Wrench, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// Bespoke Landing Components
import { InteractiveHomePreview } from "@/components/home-preview";
import { DigitalTwinDemo } from "@/components/landing/digital-twin";
import { EcosystemGraph } from "@/components/landing/ecosystem-graph";
import { ProductCollage } from "@/components/landing/product-collage";
import { CinematicTimeline } from "@/components/landing/cinematic-timeline";

export default function LandingPage() {
  const containerRef = useRef(null);
  
  // Custom easing for physical, non-digital motion
  const easePhysical = cubicBezier(0.2, 0.9, 0.3, 1);
  const easeCinematic = cubicBezier(0.4, 0, 0.2, 1);

  const { scrollYProgress: arriveProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "800px start"]
  });

  const heroOpacity = useTransform(arriveProgress, [0, 1], [1, 0]);
  const heroY = useTransform(arriveProgress, [0, 1], ["0%", "10%"]);
  
  return (
    <div ref={containerRef} className="bg-background text-foreground selection:bg-primary/10 selection:text-primary min-h-screen overflow-hidden">
      
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 text-foreground mix-blend-difference invert dark:invert-0">
        <div className="container mx-auto px-8 h-32 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-serif text-lg tracking-wide">HOMEHUB OS</span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/login" 
              className="text-sm font-medium hover:text-muted-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-medium bg-foreground text-background px-6 py-2.5 rounded-full hover:bg-foreground/80 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <motion.section 
        style={{ opacity: heroOpacity, y: heroY }}
        className="min-h-screen flex items-center px-8 md:px-24 pt-24 border-b border-border/40 relative"
      >
        <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <div className="z-10 mt-20 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: easeCinematic }}
            >
               <Badge variant="outline" className="mb-8 tracking-widest uppercase border-primary/20 text-xs py-1.5 px-3">HOMEHUB OS</Badge>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.2, ease: easeCinematic }}
              className="text-hero text-primary"
            >
              Your home <br />
              deserves a <br />
              <span className="italic text-muted-foreground">memory.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 0.8, ease: easeCinematic }}
              className="text-story text-muted-foreground mt-12 max-w-lg"
            >
              A private operating system that connects your rooms, belongings, family, and important documents into one living digital home.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2, ease: easePhysical }}
              className="mt-16 flex items-center gap-6"
            >
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-10 py-5 text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:bg-primary/90 active:scale-[0.98] shadow-md hover:shadow-lg rounded-sm gap-3"
              >
                Create Home
                <ArrowRight className="w-4 h-4" />
              </Link>

            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.5, ease: easePhysical }}
            className="hidden lg:flex justify-end relative items-center"
          >
            <div className="absolute inset-0 bg-primary/5 rounded-[4rem] blur-[100px] -z-10" />
            <InteractiveHomePreview />
          </motion.div>
        </div>
      </motion.section>

      {/* SECTION 2: DIGITAL TWIN */}
      <section className="min-h-screen flex items-center py-32 px-8 md:px-24 bg-secondary/20 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-2 gap-24 items-center">
           <div className="z-10">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: easeCinematic }}
              className="text-section text-primary"
            >
              Every room has its <br />
              own <span className="italic opacity-70">digital identity.</span>
            </motion.h2>
            <motion.p
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 1.2, delay: 0.2, ease: easeCinematic }}
               className="text-story text-muted-foreground mt-8 max-w-md"
            >
               As you map your physical space, HomeHub automatically organizes the complex web of manuals, warranties, receipts, and maintenance schedules that belong there.
            </motion.p>
           </div>

           <div className="hidden lg:block w-full">
              <DigitalTwinDemo />
           </div>
        </div>
      </section>

      {/* SECTION 3: HOMEHUB ECOSYSTEM */}
      <section className="py-40 px-8 bg-background border-y border-border/40 overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center">
          <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: easeCinematic }}
              className="text-section text-primary mb-24"
          >
              The Ecosystem
          </motion.h2>
          
          <div className="w-full max-w-5xl">
            <EcosystemGraph />
          </div>
        </div>
      </section>

      {/* SECTION 4: REAL PRODUCT EXPERIENCE */}
      <section className="min-h-screen py-40 bg-primary text-primary-foreground relative overflow-hidden flex flex-col items-center justify-center isolate">
         {/* Beautiful Dark Home Background */}
         <div className="absolute inset-0 z-0 overflow-hidden">
           <img 
             src="/dark-home-scene.png"
             alt="Atmospheric Home"
             className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
           />
           {/* Heavy vignette to blend edges smoothly into the dark section */}
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_10%,_var(--tw-colors-primary)_80%)]" />
         </div>
         
         <div className="absolute inset-0 z-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
         
         <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: easeCinematic }}
              className="z-10 text-center mb-16"
          >
              <h2 className="text-section">
                A handcrafted interface. <br />
                <span className="italic opacity-70">No generic templates.</span>
              </h2>
         </motion.div>

         <div className="w-full max-w-7xl mx-auto">
            <ProductCollage />
         </div>
      </section>

      {/* SECTION 5: HOW LIFE FLOWS (CINEMATIC TIMELINE) */}
      <section className="py-40 px-8 bg-background relative border-b border-border/40">
         <div className="max-w-[1400px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: easeCinematic }}
              className="text-center mb-24"
            >
              <h2 className="text-section text-primary">
                How life <span className="italic text-muted-foreground">flows.</span>
              </h2>
              <p className="text-body text-muted-foreground mt-6 max-w-xl mx-auto">
                A single event automatically ripples through your entire household ecosystem, keeping everyone in sync without group chats.
              </p>
            </motion.div>

            <CinematicTimeline />
         </div>
      </section>


      {/* SECTION 7: EDITORIAL SPLIT LAYOUTS (WHY HOMEHUB) */}
      <section className="py-40 bg-background border-t border-border/40 space-y-40">
         
         {/* Feature 1 */}
         <div className="max-w-[1400px] mx-auto px-8 grid lg:grid-cols-2 gap-24 items-center">
            <div>
               <h2 className="text-section text-primary mb-6">
                 Quietly <span className="italic text-muted-foreground">connected.</span>
               </h2>
               <p className="text-story text-muted-foreground max-w-md">
                 Invite your family or housemates. When someone logs maintenance or adds an invoice, the system quietly updates the timeline. No notifications, just a shared history.
               </p>
            </div>
            <div className="relative h-[500px] w-full flex items-center justify-center">
               {/* Abstract background connection lines */}
               <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 100 250 C 150 100, 250 400, 300 250" stroke="var(--tw-colors-border)" strokeWidth="1" strokeDasharray="4 4" className="opacity-50" />
                  <circle cx="100" cy="250" r="4" fill="var(--tw-colors-primary)" className="opacity-50" />
                  <circle cx="300" cy="250" r="4" fill="var(--tw-colors-primary)" className="opacity-50" />
               </svg>
               
               {/* Floating elements to create a rich collage */}
               <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-4 md:left-10 top-20 z-10">
                  <div className="flex items-center gap-3 p-3 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-sm">
                     <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-serif">S</div>
                     <span className="text-xs font-medium pr-2 text-muted-foreground">Sarah joined</span>
                  </div>
               </motion.div>

               {/* Main Card */}
               <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="z-20 w-full max-w-[380px]">
                  <Card variant="display" className="w-full p-8 bg-card/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-primary/5 relative overflow-hidden">
                     {/* Subtle glow */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
                     
                     <h3 className="font-serif text-2xl mb-6">Family Activity</h3>
                     <div className="space-y-6 border-l border-border/50 pl-6 ml-2">
                        <div className="relative">
                           <div className="absolute -left-[29px] top-1 w-2 h-2 rounded-full bg-primary ring-4 ring-background" />
                           <p className="text-sm font-semibold">Sarah uploaded an Invoice</p>
                           <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                        </div>
                        <div className="relative opacity-60">
                           <div className="absolute -left-[29px] top-1 w-2 h-2 rounded-full bg-border ring-4 ring-background" />
                           <p className="text-sm font-semibold">James logged Maintenance</p>
                           <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                        </div>
                     </div>
                  </Card>
               </motion.div>

               {/* Another floating element */}
               <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -right-4 md:right-10 bottom-24 z-30">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg">
                     <FileKey className="w-4 h-4" />
                     <span className="text-xs font-medium pr-2">Secure entry added</span>
                  </div>
               </motion.div>
            </div>
         </div>

         {/* Feature 2 */}
         <div className="max-w-[1400px] mx-auto px-8 grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 relative h-[500px] w-full flex items-center justify-center">
               
               {/* Abstract financial graph background */}
               <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
                  <svg className="w-full h-40" viewBox="0 0 400 100" fill="none" preserveAspectRatio="none">
                     <path d="M 0 80 Q 50 80, 100 60 T 200 50 T 300 20 T 400 10" stroke="var(--tw-colors-forest)" strokeWidth="2" strokeDasharray="4 4" />
                     <path d="M 0 80 Q 50 80, 100 60 T 200 50 T 300 20 T 400 10 L 400 100 L 0 100 Z" fill="url(#grad)" opacity="0.1" />
                     <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="var(--tw-colors-forest)" />
                           <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                     </defs>
                  </svg>
               </div>

               {/* Floating elements */}
               <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute left-0 md:left-4 top-16 z-30">
                  <div className="bg-forest text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                     <TrendingUp className="w-4 h-4" />
                     <span className="text-sm font-bold">+ $45,000</span>
                  </div>
               </motion.div>

               {/* Main Card */}
               <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="z-20 w-full max-w-[380px]">
                  <Card variant="display" className="w-full p-8 bg-card/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-primary/5 relative overflow-hidden">
                     <div className="absolute bottom-0 right-0 w-40 h-40 bg-forest/10 rounded-full blur-3xl -z-10" />
                     
                     <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/40">
                       <span className="font-serif text-2xl">Property Value</span>
                       <span className="text-sm font-bold text-forest bg-forest/10 px-3 py-1 rounded-full">+2.4%</span>
                     </div>
                     <div className="space-y-5">
                        <div className="flex justify-between items-center text-sm group">
                          <span className="text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors"><Shield className="w-3 h-3" /> Kitchen Renovation</span>
                          <span className="font-medium">$45,000</span>
                        </div>
                        <div className="flex justify-between items-center text-sm group">
                          <span className="text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors"><Wrench className="w-3 h-3" /> HVAC Replacement</span>
                          <span className="font-medium">$12,500</span>
                        </div>
                        <div className="flex justify-between items-center text-sm group">
                          <span className="text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors"><Activity className="w-3 h-3" /> Solar Installation</span>
                          <span className="font-medium">$18,200</span>
                        </div>
                     </div>
                  </Card>
               </motion.div>
            </div>
            <div className="order-1 lg:order-2">
               <h2 className="text-section text-primary mb-6">
                 Total cost of <span className="italic text-muted-foreground">ownership.</span>
               </h2>
               <p className="text-story text-muted-foreground max-w-md">
                 Understand the financial health of your home. Track capital improvements, utility costs, and major repairs in one immutable ledger.
               </p>
            </div>
         </div>

      </section>

      {/* SECTION 8: TRUST */}
      <section className="py-40 px-8 bg-secondary/30 relative">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: easeCinematic }}
              className="text-center mb-24"
          >
              <h2 className="text-section text-primary">
                A private foundation.
              </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <Card variant="display" className="p-10 h-full bg-background flex flex-col gap-6">
                 <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center"><Lock className="w-5 h-5 text-primary" /></div>
                 <div>
                   <h3 className="text-xl font-serif mb-2">Private Homes</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed">Your data is strictly scoped to your household. We never sell your asset history or home health data to third parties.</p>
                 </div>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Card variant="display" className="p-10 h-full bg-background flex flex-col gap-6">
                 <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center"><Share2 className="w-5 h-5 text-primary" /></div>
                 <div>
                   <h3 className="text-xl font-serif mb-2">Invitation-only</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed">Family access is strictly controlled by the Home Administrator. Members can be added or removed instantly.</p>
                 </div>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <Card variant="display" className="p-10 h-full bg-background flex flex-col gap-6">
                 <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center"><FileKey className="w-5 h-5 text-primary" /></div>
                 <div>
                   <h3 className="text-xl font-serif mb-2">Encrypted Documents</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed">Deeds, insurance policies, and receipts stored in the Vault utilize secure, authenticated access patterns.</p>
                 </div>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
              <Card variant="display" className="p-10 h-full bg-background flex flex-col gap-6">
                 <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center"><Shield className="w-5 h-5 text-primary" /></div>
                 <div>
                   <h3 className="text-xl font-serif mb-2">Multi-home Support</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed">Manage your primary residence, vacation home, and rental properties from a single account without commingling data.</p>
                 </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 9: FINAL CTA */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 text-center bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-[120px] -z-10 w-[800px] h-[800px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" />
        
        <div className="space-y-16 max-w-4xl z-10">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: easeCinematic }}
            className="text-hero text-primary"
          >
            Your home already <br />
            has memories. <br />
            <span className="italic text-muted-foreground">Now give them a place to live.</span>
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5, ease: easePhysical }}
          >
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-12 py-6 text-base font-medium tracking-wide uppercase transition-all duration-300 hover:bg-primary/90 active:scale-[0.98] shadow-lg hover:shadow-xl rounded-sm gap-3"
            >
              Create Your Home
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-16 px-8 border-t border-border/40 bg-background text-center">
        <span className="font-serif text-sm tracking-wide text-muted-foreground">HOMEHUB OS</span>
      </footer>

    </div>
  );
}
