import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  X, 
  Trash2,
  Search,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MultimediaFile } from '@shared/schema';

export default function MultimediaPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch multimedia files
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['/api/multimedia'],
    select: (data: MultimediaFile[]) => data
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (fileData: {
      fileName: string;
      originalName: string;
      fileType: string;
      mimeType: string;
      fileSize: number;
      filePath: string;
      url: string;
    }) => {
      return await apiRequest('POST', '/api/multimedia', fileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/multimedia'] });
      toast({
        title: "Archivo subido",
        description: "El archivo se ha subido correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir archivo",
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      return await apiRequest('DELETE', `/api/multimedia/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/multimedia'] });
      toast({
        title: "Archivo eliminado",
        description: "El archivo se ha eliminado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar archivo",
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  }, []);

  const handleFileUpload = async (fileList: File[]) => {
    for (const file of fileList) {
      // Validate file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
          title: "Tipo de archivo no válido",
          description: "Solo se permiten imágenes y videos",
          variant: 'destructive',
        });
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Archivo demasiado grande",
          description: "El tamaño máximo es 10MB",
          variant: 'destructive',
        });
        continue;
      }

      // Create a simulated file URL (in a real app, you'd upload to cloud storage)
      const fileUrl = URL.createObjectURL(file);
      
      const fileData = {
        fileName: `${Date.now()}-${file.name}`,
        originalName: file.name,
        fileType: file.type.startsWith('image/') ? 'image' : 'video',
        mimeType: file.type,
        fileSize: file.size,
        filePath: `/uploads/${Date.now()}-${file.name}`,
        url: fileUrl,
      };

      uploadMutation.mutate(fileData);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-8 h-8 text-blue-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.fileType === filterType;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Archivos Multimedia
        </h1>
        <p className="text-gray-600">
          Administra imágenes, videos y audios para tus chatbots
        </p>
      </div>

      {/* Upload Area */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Subir archivos multimedia
            </h3>
            <p className="text-gray-600 mb-4">
              Arrastra y suelta archivos aquí o selecciona manualmente
            </p>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                Seleccionar archivos
              </Button>
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Máximo 10MB por archivo. Formatos soportados: JPG, PNG, GIF, MP4, AVI
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar archivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="image">Imágenes</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay archivos multimedia
            </h3>
            <p className="text-gray-600">
              Sube tu primer archivo para comenzar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {filteredFiles.map((file) => (
            <Card key={file.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.fileType)}
                    <Badge variant={file.fileType === 'image' ? 'default' : 'secondary'}>
                      {file.fileType === 'image' ? 'Imagen' : 'Video'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(file.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {file.fileType === 'image' && (
                  <div className="mb-4 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={file.url}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {file.fileType === 'video' && (
                  <div className="mb-4 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 truncate" title={file.originalName}>
                    {file.originalName}
                  </h4>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>{new Date(file.createdAt || '').toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}