import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Loader, Trash2, Check } from 'lucide-react';
import { showDeleteConfirm, showToastSuccess, showToastError } from '../utils/sweetalert';

interface ImageGalleryProps {
  onSelect?: (imageUrl: string) => void;
  selectedImage?: string;
  mode?: 'select' | 'view';
}

interface StorageImage {
  name: string;
  url: string;
  createdAt: string;
}

export function ImageGallery({ onSelect, selectedImage, mode = 'view' }: ImageGalleryProps) {
  const [images, setImages] = useState<StorageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage.from('products').list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) throw error;

      const imageList: StorageImage[] = (data || []).map((file) => {
        const {
          data: { publicUrl },
        } = supabase.storage.from('products').getPublicUrl(file.name);

        return {
          name: file.name,
          url: publicUrl,
          createdAt: file.created_at || '',
        };
      });

      setImages(imageList);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(imageName: string) {
    const result = await showDeleteConfirm(imageName);

    if (!result.isConfirmed) return;

    try {
      setDeleting(imageName);
      const { error } = await supabase.storage.from('products').remove([imageName]);

      if (error) throw error;
      await fetchImages();
      showToastSuccess('Imagen eliminada correctamente');
    } catch (error) {
      console.error('Error deleting image:', error);
      showToastError('Error al eliminar la imagen');
    } finally {
      setDeleting(null);
    }
  }

  function handleImageClick(imageUrl: string) {
    if (mode === 'select' && onSelect) {
      onSelect(imageUrl);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No hay imágenes en la galería</p>
        <p className="text-gray-400 text-sm mt-2">
          Las imágenes que subas aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((image) => {
        const isSelected = mode === 'select' && selectedImage === image.url;

        return (
          <div
            key={image.name}
            className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
              isSelected
                ? 'border-amber-600 shadow-lg'
                : 'border-gray-200 hover:border-amber-400'
            } ${mode === 'select' ? 'cursor-pointer' : ''}`}
            onClick={() => handleImageClick(image.url)}
          >
            <div className="aspect-square bg-gray-100">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
              />
            </div>

            {isSelected && (
              <div className="absolute top-2 right-2 bg-amber-600 text-white rounded-full p-1">
                <Check size={16} />
              </div>
            )}

            {mode === 'view' && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(image.name)}
                  disabled={deleting === image.name}
                  className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors disabled:opacity-50"
                >
                  {deleting === image.name ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <Trash2 size={20} />
                  )}
                </button>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-white text-xs truncate">{image.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ImageGalleryModalProps {
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
  selectedImage?: string;
}

export function ImageGalleryModal({ onSelect, onClose, selectedImage }: ImageGalleryModalProps) {
  const [tempSelected, setTempSelected] = useState<string | undefined>(selectedImage);

  function handleConfirm() {
    if (tempSelected) {
      onSelect(tempSelected);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Galería de Imágenes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <ImageGallery
            mode="select"
            onSelect={setTempSelected}
            selectedImage={tempSelected}
          />
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!tempSelected}
            className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Seleccionar
          </button>
        </div>
      </div>
    </div>
  );
}
