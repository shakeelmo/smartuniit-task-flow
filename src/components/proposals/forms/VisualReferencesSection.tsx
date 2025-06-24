
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Image, X, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface VisualReference {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageFile?: File;
}

interface VisualReferencesSectionProps {
  references: VisualReference[];
  onReferencesChange: (references: VisualReference[]) => void;
}

export const VisualReferencesSection: React.FC<VisualReferencesSectionProps> = ({
  references,
  onReferencesChange
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const newReference: VisualReference = {
              id: `ref_${Date.now()}_${Math.random()}`,
              title: file.name.replace(/\.[^/.]+$/, ""),
              description: '',
              imageUrl: e.target?.result as string,
              imageFile: file
            };
            onReferencesChange([...references, newReference]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const updateReference = (id: string, field: keyof VisualReference, value: string) => {
    const updated = references.map(ref => 
      ref.id === id ? { ...ref, [field]: value } : ref
    );
    onReferencesChange(updated);
  };

  const removeReference = (id: string) => {
    onReferencesChange(references.filter(ref => ref.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Visual References & Project Layout
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Site Survey Images & Diagrams
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop images here or click to browse
            </p>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="image-upload"
            />
            <Label htmlFor="image-upload">
              <Button variant="outline" className="cursor-pointer">
                Choose Images
              </Button>
            </Label>
          </div>

          {/* Uploaded References */}
          {references.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Uploaded References ({references.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {references.map((ref) => (
                  <Card key={ref.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={ref.imageUrl}
                        alt={ref.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>{ref.title}</DialogTitle>
                            </DialogHeader>
                            <img
                              src={ref.imageUrl}
                              alt={ref.title}
                              className="w-full max-h-[70vh] object-contain"
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeReference(ref.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3 space-y-2">
                      <Input
                        value={ref.title}
                        onChange={(e) => updateReference(ref.id, 'title', e.target.value)}
                        placeholder="Image title..."
                        className="font-medium"
                      />
                      <Textarea
                        value={ref.description}
                        onChange={(e) => updateReference(ref.id, 'description', e.target.value)}
                        placeholder="Add description or notes..."
                        rows={2}
                        className="text-sm"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
