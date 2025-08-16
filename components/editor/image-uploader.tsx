"use client"

import type React from "react"
import { useState, useRef } from "react"
import { X, Upload, ImageIcon, Sparkles } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils" // Assuming you have a utility for classnames

interface ImageUploaderProps {
  onClose: () => void
  onImageUploaded: (url: string) => void
}

type ActiveTab = "upload" | "generate"

export function ImageUploader({ onClose, onImageUploaded }: ImageUploaderProps) {
  const { toast } = useToast()
  
  // State for both upload and generation
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State for AI Generation
  const [prompt, setPrompt] = useState("")
  const [activeTab, setActiveTab] = useState<ActiveTab>("upload")


  async function handleGenerateImage() {
    if (!prompt) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setImageUrl("") // Clear previous image

    try {
      const response = await fetch("/api/ai/image-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate image.");
      }

      const data = await response.json();

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        toast({
          title: "Success",
          description: "Image generated successfully.",
        });
      } else {
          throw new Error("No image URL returned from the server.");
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }


  async function uploadImage(file: File) {
    setIsUploading(true);
    setUploadProgress(0);
    setImageUrl("") // Clear previous image
  
    try {
      // Convert file to base64 using a Promise
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
      });
  
      // Extract the base64 data
      const base64Data = base64Image.split(",")[1];
  
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
  
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64Data,
            name: file.name,
          }),
        });
  
        clearInterval(progressInterval);
  
        if (!response.ok) {
          throw new Error("Failed to upload image");
        }
  
        const data = await response.json();
        setUploadProgress(100);
        setImageUrl(data.url);
  
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      uploadImage(file)
    }
  }

  function handleInsert() {
    if (imageUrl) {
      onImageUploaded(imageUrl)
      onClose()
    }
  }

  function resetState() {
    setImageUrl("")
    setPrompt("")
    if (fileInputRef.current) {
        fileInputRef.current.value = ""
    }
  }

  const isLoading = isUploading || isGenerating;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ImageIcon className="mr-2 h-4 w-4" />
            Add Header Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
            {imageUrl ? (
                 <div className="space-y-4 text-center">
                    <img
                      src={imageUrl}
                      alt="Generated or Uploaded"
                      className="max-h-[250px] w-full object-contain rounded-md"
                    />
                    <Button variant="outline" onClick={resetState}>
                      Use a Different Image
                    </Button>
                </div>
            ) : isLoading ? (
                <div className="w-full space-y-2 flex flex-col items-center justify-center h-48">
                    {isUploading ? (
                        <>
                            <div className="flex justify-between text-sm w-full">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-8 w-8 animate-pulse text-primary" />
                            <p className="text-sm text-gray-500 mt-2">Generating your image...</p>
                        </>
                    )}
                </div>
            ) : (
            <>
                {/* Tabs */}
                <div className="grid grid-cols-2 gap-2">
                    <Button variant={activeTab === 'upload' ? 'default' : 'outline'} onClick={() => setActiveTab('upload')}>
                        <Upload className="mr-2 h-4 w-4" /> Upload
                    </Button>
                    <Button variant={activeTab === 'generate' ? 'default' : 'outline'} onClick={() => setActiveTab('generate')}>
                        <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
                    </Button>
                </div>

                {/* Content based on tab */}
                {activeTab === 'upload' && (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 h-48">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <div className="text-center space-y-4">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Drag and drop an image, or click to select</p>
                                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                            </div>
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" /> Select Image
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'generate' && (
                    <div className="space-y-4 h-48 flex flex-col justify-center">
                        <p className="text-sm text-gray-600">Describe the image you want to create.</p>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="e.g., A futuristic cityscape at sunset"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerateImage()}
                            />
                            <Button onClick={handleGenerateImage} disabled={isGenerating}>
                                <Sparkles className="mr-2 h-4 w-4" /> Generate
                            </Button>
                        </div>
                         <p className="text-xs text-gray-400">Our AI will generate a unique image based on your prompt.</p>
                    </div>
                )}
            </>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!imageUrl || isLoading}>
            Use Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}