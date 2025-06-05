import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, Image, Video, Trash2, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MultimediaFile } from "@shared/schema";

export default function Multimedia() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const queryClient = useQueryClient();

  // Obtener archivos multimedia
  const { data: mediaFiles = [], isLoading } = useQuery<MultimediaFile[]>({
    queryKey: ['/api/multimedia'],
  });

  // Mutation para subir archivos
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/multimedia/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al subir archivos');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('multimedia.uploadSuccess'),
        description: t('multimedia.uploadSuccessDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/multimedia'] });
      setUploadFiles(null);
    },
    onError: (error) => {
      toast({
        title: t('multimedia.uploadError'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para eliminar archivo
  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await apiRequest('DELETE', `/api/multimedia/${fileId}`);
    },
    onSuccess: () => {
      toast({
        title: t('multimedia.deleteSuccess'),
        description: t('multimedia.deleteSuccessDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/multimedia'] });
    },
    onError: (error) => {
      toast({
        title: t('multimedia.deleteError'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFiles(e.dataTransfer.files);
    }
  };

  const handleUpload = () => {
    if (uploadFiles) {
      uploadMutation.mutate(uploadFiles);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8" />;
    if (type.startsWith('video/')) return <Video className="h-8 w-8" />;
    return <Upload className="h-8 w-8" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('multimedia.title')}</h1>
        <p className="text-gray-600">{t('multimedia.subtitle')}</p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">{t('multimedia.upload')}</TabsTrigger>
          <TabsTrigger value="library">{t('multimedia.library')}</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>{t('multimedia.uploadFiles')}</CardTitle>
              <CardDescription>
                {t('multimedia.uploadFilesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Zona de arrastre */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {t('multimedia.dragDrop')}
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      {t('multimedia.dragDropDesc')}
                    </span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </div>
              </div>

              {/* Archivos seleccionados */}
              {uploadFiles && uploadFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">{t('multimedia.selectedFiles')}</h3>
                  <div className="space-y-2">
                    {Array.from(uploadFiles).map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.type)}
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={file.type.startsWith('image/') ? 'default' : 'secondary'}>
                          {file.type.startsWith('image/') ? t('multimedia.image') : t('multimedia.video')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="flex-1"
                    >
                      {uploadMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                          {t('multimedia.uploading')}
                        </div>
                      ) : (
                        t('multimedia.uploadNow')
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setUploadFiles(null)}
                    >
                      {t('multimedia.cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle>{t('multimedia.mediaLibrary')}</CardTitle>
              <CardDescription>
                {t('multimedia.mediaLibraryDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="mx-auto h-12 w-12 mb-4" />
                  <p>{t('multimedia.noFiles')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {mediaFiles.map((file: MultimediaFile) => (
                    <div key={file.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        {file.type === 'image' ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Video className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium truncate" title={file.name}>
                          {file.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                        <div className="flex justify-between items-center mt-3">
                          <Badge variant={file.type === 'image' ? 'default' : 'secondary'}>
                            {file.type === 'image' ? t('multimedia.image') : t('multimedia.video')}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteMutation.mutate(file.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}