import { useState } from 'react';
import { X, Upload, Loader, Images } from 'lucide-react';
import { PromotionalSection, uploadProductImage } from '../lib/supabase';
import { showToastError } from '../utils/sweetalert';
import { ImageGalleryModal } from './ImageGallery';

interface PromotionalSectionFormProps {
  section?: PromotionalSection | null;
  onSubmit: (data: Partial<PromotionalSection>) => Promise<void>;
  onCancel: () => void;
  categories: string[];
}

export function PromotionalSectionForm({
  section,
  onSubmit,
  onCancel,
  categories,
}: PromotionalSectionFormProps) {
  const [formData, setFormData] = useState({
    title: section?.title || '',
    description: section?.description || '',
    image_url: section?.image_url || '',
    link_url: section?.link_url || '',
    category: section?.category || '',
    position: section?.position || 'between_categories',
    order_position: section?.order_position || 0,
    is_active: section?.is_active ?? true,
    section_type: section?.section_type || 'full_width',
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(section?.image_url || '');
  const [showGallery, setShowGallery] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleGallerySelect(imageUrl: string) {
    setImagePreview(imageUrl);
    setFormData({ ...formData, image_url: imageUrl });
    setImageFile(null);
    setShowGallery(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        setUploading(true);
        try {
          imageUrl = await uploadProductImage(imageFile);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          showToastError('Error al subir la imagen');
          setUploading(false);
          setSubmitting(false);
          return;
        }
        setUploading(false);
      }

      if (!imageUrl) {
        showToastError('Debes seleccionar una imagen');
        setSubmitting(false);
        return;
      }

      await onSubmit({
        ...formData,
        image_url: imageUrl,
      });
    } catch (error) {
      console.error('Error submitting promotional section:', error);
      showToastError('Error al guardar la sección promocional');
    } finally {
      setSubmitting(false);
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {section ? 'Editar Sección Promocional' : 'Nueva Sección Promocional'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen *
            </label>
            <div className="space-y-3">
              {imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                  <Upload size={20} />
                  <span>Subir nueva</span>
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
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors"
                >
                  <Images size={20} />
                  Galería
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Sección *
              </label>
              <select
                value={formData.section_type}
                onChange={(e) => setFormData({ ...formData, section_type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              >
                <option value="full_width">Ancho completo</option>
                <option value="half_width">Medio ancho</option>
                <option value="grid_2">Grid 2 columnas</option>
                <option value="grid_3">Grid 3 columnas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posición *
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              >
                <option value="top">Arriba</option>
                <option value="between_categories">Entre categorías</option>
                <option value="middle">Medio</option>
                <option value="bottom">Abajo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de enlace
            </label>
            <input
              type="url"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="https://ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría (opcional)
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden
              </label>
              <input
                type="number"
                value={formData.order_position}
                onChange={(e) => setFormData({ ...formData, order_position: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mt-8">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-gray-700">Activo</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={submitting || uploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={submitting || uploading}
            >
              {(submitting || uploading) && <Loader className="animate-spin" size={20} />}
              {uploading ? 'Subiendo imagen...' : submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
