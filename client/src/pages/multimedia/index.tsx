import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
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
        title: t('multimedia.uploadSuccess'),
        description: t('multimedia.fileUploadedSuccessfully'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('multimedia.uploadError'),
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
        title: t('multimedia.deleteSuccess'),
        description: t('multimedia.fileDeletedSuccessfully'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('multimedia.deleteError'),
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
          title: t('multimedia.invalidFileType'),
          description: t('multimedia.onlyImagesAndVideos'),
          variant: 'destructive',
        });
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: t('multimedia.fileTooLarge'),
          description: t('multimedia.maxFileSize'),
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

  const deleteFile = (fileId: number) => {
    deleteMutation.mutate(fileId);
  };

  // Filter files based on search and type
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || file.fileType === filterType;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('multimedia.title')}</h1>
          <p className="text-gray-600 mt-2">{t('multimedia.description')}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {files.length} {t('multimedia.files')}
        </Badge>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
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
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('multimedia.uploadFiles')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('multimedia.dragDropOrClick')}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {t('multimedia.supportedFormats')}
            </p>
            <input
              type="file"
              id="fileInput"
              className="hidden"
              multiple
              accept="image/*,video/*"
              onChange={handleFileInputChange}
            />
            <Button
              onClick={() => document.getElementById('fileInput')?.click()}
              disabled={uploadMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploadMutation.isPending ? t('common.uploading') : t('multimedia.selectFiles')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('multimedia.searchFiles')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('multimedia.allFiles')}</SelectItem>
                  <SelectItem value="image">{t('multimedia.images')}</SelectItem>
                  <SelectItem value="video">{t('multimedia.videos')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid/List */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterType !== 'all'
                ? t('multimedia.noFilesFound')
                : t('multimedia.noFilesYet')}
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all'
                ? t('multimedia.tryDifferentSearch')
                : t('multimedia.uploadFirstFile')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredFiles.map((file) => (
            <Card key={file.id} className="group relative overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                {viewMode === 'grid' ? (
                  <>
                    {file.mimeType.startsWith('image/') ? (
                      <div className="aspect-square relative">
                        <img 
                          src={file.url} 
                          alt={file.originalName} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : file.mimeType.startsWith('video/') ? (
                      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                        <Video className="w-12 h-12 text-gray-400" />
                        <video className="absolute inset-0 w-full h-full object-cover">
                          <source src={file.url} type={file.mimeType} />
                        </video>
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center p-4 space-x-4">
                    <div className="flex-shrink-0">
                      {file.mimeType.startsWith('image/') ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                          <img src={file.url} alt={file.originalName} className="w-full h-full object-cover" />
                        </div>
                      ) : file.mimeType.startsWith('video/') ? (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Video className="w-6 h-6 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.fileSize)} • {file.fileType}</p>
                      {file.createdAt && (
                        <p className="text-xs text-gray-400">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteFile(file.id)}
                  disabled={deleteMutation.isPending}
                  className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}