import { useState, useEffect } from 'react';
import { uploadProductImage } from '../lib/supabase';
import { X, Upload, Image as ImageIcon, Images } from 'lucide-react';
import { ImageGalleryModal } from './ImageGallery';

interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  category?: string;
  order_position: number;
  is_active: boolean;
  show_title?: boolean;
  show_shadow?: boolean;
}

interface BannerFormProps {
  banner?: Banner | null;
  onSubmit: (banner: Partial<Banner>) => Promise<void>;
  onCancel: () => void;
  categories: string[];
}

export function BannerForm({ banner, onSubmit, onCancel, categories }: BannerFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    category: '',
    order_position: '0',
    is_active: true,
    show_title: true,
    show_shadow: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        description: banner.description,
        image_url: banner.image_url,
        link_url: banner.link_url || '',
        category: banner.category || '',
        order_position: banner.order_position.toString(),
        is_active: banner.is_active,
        show_title: banner.show_title ?? true,
        show_shadow: banner.show_shadow ?? true,
      });
      setImagePreview(banner.image_url);
    }
  }, [banner]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona una imagen válida');
      return;
    }

    setImageFile(file);
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleGallerySelect(imageUrl: string) {
    setImagePreview(imageUrl);
    setFormData({ ...formData, image_url: imageUrl });
    setImageFile(null);
    setShowGallery(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setUploadError('');

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      }

      await onSubmit({
        title: formData.title,
        description: formData.description,
        image_url: imageUrl,
        link_url: formData.link_url,
        category: formData.category,
        order_position: parseInt(formData.order_position),
        is_active: formData.is_active,
        show_title: formData.show_title,
        show_shadow: formData.show_shadow,
      });

      if (!banner) {
        setFormData({
          title: '',
          description: '',
          image_url: '',
          link_url: '',
          category: '',
          order_position: '0',
          is_active: true,
          show_title: true,
          show_shadow: true,
        });
        setImageFile(null);
        setImagePreview('');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al guardar el banner';
      setUploadError(message);
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {showGallery && (
        <ImageGalleryModal
          onSelect={handleGallerySelect}
          onClose={() => setShowGallery(false)}
          selectedImage={imagePreview}
        />
      )}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            {banner ? 'Editar Banner' : 'Agregar Banner'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {uploadError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del banner *
            </label>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                    <ImageIcon size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-colors">
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-sm font-medium text-gray-700">
                    Subir nueva imagen
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    Recomendado: 1920x450px
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowGallery(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors"
                >
                  <Images size={20} />
                  Seleccionar de la galería
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del banner *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Ej: Ofertas de Verano"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Descripción del banner..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de enlace
              </label>
              <input
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría asociada
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Ninguna</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Posición de orden *
            </label>
            <input
              type="number"
              value={formData.order_position}
              onChange={(e) => setFormData({ ...formData, order_position: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Opciones de visualización
            </label>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="ml-3 text-sm text-gray-700">Banner activo</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.show_title}
                  onChange={(e) => setFormData({ ...formData, show_title: e.target.checked })}
                  className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="ml-3 text-sm text-gray-700">Mostrar título sobre el banner</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.show_shadow}
                  onChange={(e) => setFormData({ ...formData, show_shadow: e.target.checked })}
                  className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="ml-3 text-sm text-gray-700">Mostrar sombra oscura sobre la imagen</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !imagePreview}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : banner ? 'Actualizar' : 'Agregar'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
