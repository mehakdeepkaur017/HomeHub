"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useHome } from "@/components/providers/home-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, ShieldAlert, PackageOpen, ImagePlus, FileText } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AssetCard } from "../components/asset-card";
import { toast } from "sonner";

const steps = [
  { id: "identity", title: "Identity" },
  { id: "placement", title: "Placement" },
  { id: "ownership", title: "Ownership" },
  { id: "documents", title: "Documents" },
  { id: "preview", title: "Preview" }
];

export default function CreateAssetPage() {
  const router = useRouter();
  const { activeHome } = useHome();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<{file: File, base64: string}[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    coverImage: "",
    spaceId: "",
    purchaseDate: "",
    purchasePrice: "",
    condition: "GOOD",
    // We keep these minimal for now to match exactly what is required
  });

  const { data: spaces } = useQuery({
    queryKey: ["spaces", activeHome?.id],
    queryFn: async () => {
      if (!activeHome?.id) return [];
      const res = await fetch("/api/spaces", { headers: { "x-home-id": activeHome.id } });
      if (!res.ok) throw new Error("Failed to fetch spaces");
      const data = await res.json();
      return data.spaces || [];
    },
    enabled: !!activeHome?.id,
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((p) => p + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-home-id": activeHome!.id,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create asset");
      }

      const newAsset = await res.json();
      
      // Upload any selected documents
      if (selectedDocs.length > 0) {
        for (const doc of selectedDocs) {
          try {
            await fetch('/api/documents', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-home-id': activeHome!.id 
              },
              body: JSON.stringify({
                title: doc.file.name,
                category: "Receipt/Manual", // generic category
                file: doc.base64,
                mimeType: doc.file.type || "application/octet-stream",
                size: doc.file.size,
                assetId: newAsset.id
              })
            });
          } catch (e) {
            console.error("Failed to upload document", e);
          }
        }
      }

      router.push(`/assets/${newAsset.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const selectedSpace = spaces?.find((s: { id: string }) => s.id === formData.spaceId);

  // Generate preview asset for step 5
  const previewAsset = {
    id: "preview",
    name: formData.name || "Asset Name",
    category: formData.category || "Category",
    coverImage: formData.coverImage,
    condition: formData.condition,
    space: selectedSpace || null,
    _count: { activities: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/assets" className="p-2 rounded-full hover:bg-secondary/60 transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif tracking-tight text-primary">Add Digital Asset</h1>
            <p className="text-sm text-muted-foreground mt-1">Create a digital passport for your object.</p>
          </div>
        </div>
        <div className="text-sm font-medium text-muted-foreground/50 hidden sm:block">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex-1 flex flex-col gap-2">
            <div className={`h-1.5 w-full rounded-full transition-colors duration-500 ${i <= currentStep ? "bg-primary" : "bg-secondary"}`} />
            <span className={`text-[10px] font-semibold tracking-widest uppercase transition-colors duration-500 hidden sm:block ${i === currentStep ? "text-primary" : "text-muted-foreground/40"}`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-sm min-h-[400px] relative overflow-hidden flex flex-col">
        {error && (
          <div className="mb-6 p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-xl mx-auto"
            >
              {/* Step 1: Identity */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-primary">Identity</h2>
                    <p className="text-muted-foreground mt-2">What are we adding to your home?</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center mb-6">
                      <label className="relative w-32 h-32 rounded-3xl border-2 border-dashed border-border/60 bg-secondary/20 flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/40 transition-colors cursor-pointer overflow-hidden group">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            setIsUploadingImage(true);
                            const toastId = toast.loading("Uploading securely to Cloudinary...");
                            
                            try {
                              const uploadData = new FormData();
                              uploadData.append("file", file);
                        
                              const res = await fetch("/api/upload", {
                                method: "POST",
                                body: uploadData,
                              });
                              
                              const data = await res.json();
                              if (!res.ok) throw new Error(data.error || "Upload failed");
                              
                              setFormData({ ...formData, coverImage: data.url });
                              toast.success("Image uploaded", { id: toastId });
                            } catch (error: any) {
                              toast.error(error.message, { id: toastId });
                            } finally {
                              setIsUploadingImage(false);
                            }
                          }}
                        />
                        {formData.coverImage ? (
                          <>
                            <img src={formData.coverImage} alt="Asset" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-medium uppercase tracking-widest text-white">Change</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <ImagePlus className="h-8 w-8 mb-2 opacity-50" />
                            <span className="text-[10px] font-medium uppercase tracking-widest">Add Photo</span>
                          </>
                        )}
                      </label>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium pl-1">Asset Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-14 px-5 text-lg bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                        placeholder="e.g. Samsung Refrigerator"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium pl-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">Select Category</option>
                        <option value="Appliances">Appliances</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Tools">Tools</option>
                        <option value="Vehicles">Vehicles</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Placement */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-primary">Placement</h2>
                    <p className="text-muted-foreground mt-2">Where does this object live?</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 pb-2">
                    <button
                      onClick={() => setFormData({ ...formData, spaceId: "" })}
                      className={`h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${!formData.spaceId ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border/50 bg-background hover:bg-secondary/40 text-muted-foreground"}`}
                    >
                      <PackageOpen className="h-6 w-6" />
                      <span className="text-sm font-medium">Unassigned</span>
                    </button>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {spaces?.map((space: any) => (
                      <button
                        key={space.id}
                        onClick={() => setFormData({ ...formData, spaceId: space.id })}
                        className={`h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${formData.spaceId === space.id ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border/50 bg-background hover:bg-secondary/40 text-muted-foreground"}`}
                      >
                        <span className="text-2xl">{space.icon || "🏠"}</span>
                        <span className="text-sm font-medium">{space.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Ownership */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-primary">Ownership</h2>
                    <p className="text-muted-foreground mt-2">Value and current condition.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium pl-1">Purchase Date</label>
                        <input
                          type="date"
                          value={formData.purchaseDate}
                          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                          className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium pl-1">Cost</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formData.purchasePrice}
                          onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                          className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium pl-1">Condition</label>
                      <select
                        value={formData.condition}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                        className="w-full h-14 px-5 bg-background border border-border/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="NEW">New</option>
                        <option value="EXCELLENT">Excellent</option>
                        <option value="GOOD">Good</option>
                        <option value="FAIR">Fair</option>
                        <option value="POOR">Poor</option>
                        <option value="BROKEN">Broken</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documents */}
              {currentStep === 3 && (
                <div className="space-y-6 text-center">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-primary">Documents</h2>
                    <p className="text-muted-foreground mt-2">Upload invoices, manuals, and warranties.</p>
                  </div>
                  
                  <div className="p-8 border-2 border-dashed border-border/60 rounded-3xl bg-secondary/10 flex flex-col items-center relative">
                     <input 
                       type="file" 
                       multiple 
                       accept="image/*,application/pdf"
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       onChange={(e) => {
                         const files = Array.from(e.target.files || []);
                         files.forEach(file => {
                           const reader = new FileReader();
                           reader.onload = (event) => {
                             setSelectedDocs(prev => [...prev, {
                               file,
                               base64: event.target?.result as string
                             }]);
                           };
                           reader.readAsDataURL(file);
                         });
                       }}
                     />
                     <div className="h-16 w-16 bg-card rounded-2xl flex items-center justify-center shadow-sm mb-4">
                       <FileText className="h-8 w-8 text-muted-foreground/60" />
                     </div>
                     <h3 className="text-lg font-medium mb-2">Click to Upload</h3>
                     <p className="text-sm text-muted-foreground max-w-sm mb-6">
                       Select PDFs, receipts, or images to attach to this asset.
                     </p>
                     
                     {selectedDocs.length > 0 && (
                       <div className="w-full flex flex-col gap-2 mt-4 z-10 relative pointer-events-none">
                         {selectedDocs.map((doc, idx) => (
                           <div key={idx} className="bg-background border border-border/50 rounded-xl p-3 flex items-center gap-3 text-left">
                             <FileText className="h-5 w-5 text-primary" />
                             <span className="text-sm font-medium truncate flex-1">{doc.file.name}</span>
                             <span className="text-xs text-muted-foreground">{(doc.file.size / 1024).toFixed(0)}kb</span>
                           </div>
                         ))}
                       </div>
                     )}
                  </div>
                </div>
              )}

              {/* Step 5: Preview */}
              {currentStep === 4 && (
                <div className="space-y-8 text-center max-w-sm mx-auto">
                  <div>
                    <h2 className="text-3xl font-serif tracking-tight text-primary mb-2">Ready to save</h2>
                    <p className="text-sm text-muted-foreground">
                      This is how your home will remember this object.
                    </p>
                  </div>

                  <div className="text-left">
                    <AssetCard asset={previewAsset} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 border-t border-border/40 bg-card/80 backdrop-blur-xl flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0 || loading}
            className="rounded-xl px-4 sm:px-6 h-12"
          >
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!formData.name && currentStep === 0}
              className="rounded-xl px-6 sm:px-8 h-12 shadow-float"
            >
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={loading}
              className="rounded-xl px-6 sm:px-8 h-12 shadow-float bg-forest hover:bg-forest/90 text-white"
            >
              {loading ? "Saving..." : "Save Asset"} <Save className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
