"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ImageIcon, Sofa, Bath, Bed, Utensils, Coffee, 
  Sun, Car, Package, ArrowRight, ArrowLeft, Check, Box, Upload
} from "lucide-react";
import { SpaceCard } from "../components/space-card";
import { useHome } from "@/components/providers/home-provider";

const ICONS = [
  { name: "Sofa", component: Sofa },
  { name: "Bath", component: Bath },
  { name: "Bed", component: Bed },
  { name: "Utensils", component: Utensils },
  { name: "Coffee", component: Coffee },
  { name: "Sun", component: Sun },
  { name: "Car", component: Car },
  { name: "Package", component: Package },
  { name: "Image", component: ImageIcon },
];

const PRESET_TYPES = [
  { name: "Living Room", icon: "Sofa", desc: "The central gathering space." },
  { name: "Kitchen", icon: "Utensils", desc: "Appliances and cooking." },
  { name: "Bedroom", icon: "Bed", desc: "Personal spaces." },
  { name: "Bathroom", icon: "Bath", desc: "Fixtures and plumbing." },
  { name: "Garage", icon: "Car", desc: "Vehicles and storage." },
  { name: "Custom", icon: "Box", desc: "Define your own space." },
];

export default function CreateSpaceWizard() {
  const router = useRouter();
  const { activeHome } = useHome();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    floor: "Ground Floor",
    icon: "Sofa",
    coverImage: "",
  });

  const previewSpace = {
    id: "preview",
    homeId: "preview",
    parentSpaceId: null,
    name: formData.name || "Space Name",
    slug: "preview-space",
    icon: formData.icon,
    color: null,
    coverImage: formData.coverImage,
    description: formData.description || "A beautiful space in your home.",
    floor: formData.floor,
    displayOrder: 0,
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: null,
    _count: { assets: 0, activities: 0 }
  } as const;

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setFormData({ ...formData, coverImage: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectType = (type: typeof PRESET_TYPES[0]) => {
    setFormData({
      ...formData,
      name: type.name === "Custom" ? "" : type.name,
      icon: type.icon,
    });
    handleNext();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-home-id": activeHome!.id
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create space");

      const { space } = await res.json();
      toast.success("Space created successfully");
      router.push(`/spaces/${space.id}`);
      router.refresh();
    } catch {
      toast.error("Failed to create space");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto min-h-[80vh] flex flex-col pt-12 px-6 lg:px-12">
      
      {/* Wizard Header */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-section text-primary">Map your <span className="italic text-muted-foreground/80">physical</span> world.</h1>
          <p className="text-body text-muted-foreground mt-2 max-w-lg">
            Create a digital twin of a real room or area in your home to track its assets and maintenance.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
           <span className={step >= 1 ? "text-primary" : "text-muted-foreground"}>1. Type</span>
           <span className="w-8 h-px bg-border" />
           <span className={step >= 2 ? "text-primary" : "text-muted-foreground"}>2. Customize</span>
           <span className="w-8 h-px bg-border" />
           <span className={step >= 3 ? "text-primary" : "text-muted-foreground"}>3. Preview</span>
        </div>
      </div>

      {/* Wizard Body */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: CHOOSE TYPE */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-4xl"
            >
              <h2 className="text-label text-muted-foreground mb-6">Choose Space Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRESET_TYPES.map((type) => {
                  const Icon = ICONS.find(i => i.name === type.icon)?.component || Box;
                  return (
                    <button
                      key={type.name}
                      onClick={() => handleSelectType(type)}
                      className="group flex flex-col items-start p-6 rounded-3xl border border-border/50 bg-secondary/10 hover:bg-secondary/30 transition-all text-left"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-serif text-xl mb-1">{type.name}</h3>
                      <p className="text-sm text-muted-foreground">{type.desc}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: CUSTOMIZE */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <h2 className="text-label text-muted-foreground mb-6">Customize Details</h2>
              <div className="space-y-8">
                
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Space Name</label>
                  <Input 
                    placeholder="e.g. Master Bedroom" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-14 text-lg"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Floor / Level</label>
                    <select 
                      className="flex h-14 w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all hover:border-border"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    >
                      <option value="Ground Floor">Ground Floor</option>
                      <option value="1st Floor">1st Floor</option>
                      <option value="2nd Floor">2nd Floor</option>
                      <option value="Basement">Basement</option>
                      <option value="Outdoor">Outdoor</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Cover Image</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`flex h-14 w-full items-center justify-between rounded-xl border border-border/60 bg-background px-4 text-sm transition-all ${formData.coverImage ? 'border-primary bg-primary/5 text-primary' : 'hover:border-border text-muted-foreground'}`}>
                        <span className="truncate">
                          {formData.coverImage && formData.coverImage.startsWith('data:image') ? "Image selected" : formData.coverImage ? "URL provided" : "Choose from gallery..."}
                        </span>
                        <Upload className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold">Select Icon</label>
                  <div className="flex flex-wrap gap-3">
                    {ICONS.map((Icon) => (
                      <button
                        key={Icon.name}
                        onClick={() => setFormData({ ...formData, icon: Icon.name })}
                        className={`flex w-14 h-14 items-center justify-center rounded-2xl border transition-all ${
                          formData.icon === Icon.name
                            ? "border-primary bg-primary/10 text-primary scale-110 shadow-sm"
                            : "border-border bg-background hover:bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Icon.component className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <Button variant="outline" size="lg" onClick={handleBack} className="w-32">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button size="lg" onClick={handleNext} disabled={!formData.name} className="w-32">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PREVIEW & CONFIRM */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid lg:grid-cols-2 gap-16 items-center"
            >
              <div className="space-y-8">
                <div>
                  <h2 className="text-section text-primary mb-2">Looks <span className="italic">perfect.</span></h2>
                  <p className="text-body text-muted-foreground">
                    This is how your new space will appear on the dashboard. You can always edit these details later.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" size="lg" onClick={handleBack} disabled={loading} className="w-32">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button size="lg" onClick={handleSubmit} disabled={loading} className="w-48 bg-primary">
                    {loading ? "Initializing..." : "Create Space"}
                    {!loading && <Check className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                 <div className="w-full max-w-[340px] h-[340px]">
                    <SpaceCard space={previewSpace} isPreview />
                 </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
