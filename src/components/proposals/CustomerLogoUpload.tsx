
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface CustomerLogoUploadProps {
  currentLogoUrl?: string;
  onLogoChange: (logoUrl: string | null) => void;
}

export const CustomerLogoUpload: React.FC<CustomerLogoUploadProps> = ({
  currentLogoUrl,
  onLogoChange
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update preview when currentLogoUrl changes
  useEffect(() => {
    console.log('CustomerLogoUpload: currentLogoUrl changed to:', currentLogoUrl);
    setPreviewUrl(currentLogoUrl || null);
  }, [currentLogoUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        console.log('CustomerLogoUpload: File converted to base64, size:', base64String.length);
        
        // Update preview immediately
        setPreviewUrl(base64String);
        
        // Notify parent component
        onLogoChange(base64String);
        
        toast({
          title: "Success",
          description: "Customer logo uploaded successfully - it will appear in the PDF",
        });
      };
      
      reader.onerror = () => {
        console.error('Error reading file');
        toast({
          title: "Error",
          description: "Failed to read the image file",
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }

    // Clear the input so the same file can be selected again if needed
    event.target.value = '';
  };

  const handleRemoveLogo = () => {
    console.log('CustomerLogoUpload: Removing logo');
    setPreviewUrl(null);
    onLogoChange(null);
    toast({
      title: "Logo removed",
      description: "Customer logo has been removed",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Customer Logo for PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Upload your customer's logo to include it in the proposal PDF. The SmartUniverse logo will always appear as the main branding in the top-right corner.
        </div>
        
        {previewUrl ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
              <img 
                src={previewUrl} 
                alt="Customer Logo Preview" 
                className="max-h-28 max-w-full object-contain"
                onLoad={() => console.log('CustomerLogoUpload: Logo image loaded successfully')}
                onError={() => console.error('CustomerLogoUpload: Failed to load logo image')}
              />
            </div>
            <div className="flex gap-2 justify-center">
              <Label htmlFor="logo-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Change Logo
                  </span>
                </Button>
              </Label>
              <Button 
                variant="outline" 
                onClick={handleRemoveLogo}
                className="text-red-600 hover:text-red-700"
                disabled={uploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
            <div className="text-center text-sm text-green-600 font-medium">
              ✓ Logo uploaded successfully - will appear in PDF
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <Label htmlFor="logo-upload" className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-800">
                  Click to upload customer logo for PDF
                </Label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>
        )}
        
        <Input
          id="logo-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        
        {uploading && (
          <div className="text-sm text-blue-600 text-center">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Uploading logo...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
