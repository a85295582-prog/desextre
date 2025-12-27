import { useEffect, useState } from 'react';
import { supabase, Product, PromotionalSection } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ProductForm } from './ProductForm';
import { BannerForm } from './BannerForm';
import { PromotionalSectionForm } from './PromotionalSectionForm';
import { CategoryManagement } from './CategoryManagement';
import { ImageGallery } from './ImageGallery';
import { FooterSettings } from './FooterSettings';
import { ThemeSettings } from './ThemeSettings';
import { Footer } from './Footer';
import { exportToCSV, exportToPDF } from '../utils/exportCatalog';
import { Plus, Edit, Trash2, LogOut, Package, Image, FolderTree, FileDown, FileText, Layout, Copy, Images, Settings, Palette } from 'lucide-react';
import { showDeleteConfirm, showToastSuccess, showToastError } from '../utils/sweetalert';
import { formatPrice } from '../utils/currency';

interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  category?: string;
  order_position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminPanelProps {
  onBackClick?: () => void;
}

export function AdminPanel({ onBackClick }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'banners' | 'categories' | 'promotional' | 'images' | 'footer' | 'themes'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [promotionalSections, setPromotionalSections] = useState<PromotionalSection[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [showPromotionalForm, setShowPromotionalForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editingPromotional, setEditingPromotional] = useState<PromotionalSection | null>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchBanners();
    fetchPromotionalSections();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);

      const uniqueCategories = Array.from(
        new Set(data?.map((p) => p.category) || [])
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBanners() {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  }

  async function fetchPromotionalSections() {
    try {
      const { data, error } = await supabase
        .from('promotional_sections')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      setPromotionalSections(data || []);
    } catch (error) {
      console.error('Error fetching promotional sections:', error);
    }
  }

  async function handleProductSubmit(productData: Partial<Product>) {
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);

        if (error) throw error;
      }

      await fetchProducts();
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  }

  async function handleProductDelete(id: string) {
    const product = products.find(p => p.id === id);
    const result = await showDeleteConfirm(product?.name || 'este producto');

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;
      await fetchProducts();
      showToastSuccess('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      showToastError('Error al eliminar el producto');
    }
  }

  function handleProductEdit(product: Product) {
    setEditingProduct(product);
    setShowProductForm(true);
  }

  async function handleProductDuplicate(product: Product) {
    try {
      const duplicatedProduct = {
        name: `${product.name} (Copia)`,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        stock: product.stock,
        subcategory_id: product.subcategory_id,
        sku: product.sku ? `${product.sku}-COPY` : undefined,
        brand: product.brand,
        dimensions: product.dimensions,
        compatibility: product.compatibility,
      };

      const { error } = await supabase.from('products').insert([duplicatedProduct]);

      if (error) throw error;
      await fetchProducts();
      showToastSuccess('Producto duplicado correctamente');
    } catch (error) {
      console.error('Error duplicating product:', error);
      showToastError('Error al duplicar el producto');
    }
  }

  function handleProductCancel() {
    setShowProductForm(false);
    setEditingProduct(null);
  }

  async function handleBannerSubmit(bannerData: Partial<Banner>) {
    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update(bannerData)
          .eq('id', editingBanner.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('banners').insert([bannerData]);

        if (error) throw error;
      }

      await fetchBanners();
      setShowBannerForm(false);
      setEditingBanner(null);
    } catch (error) {
      console.error('Error saving banner:', error);
      throw error;
    }
  }

  async function handleBannerDelete(id: string) {
    const banner = banners.find(b => b.id === id);
    const result = await showDeleteConfirm(banner?.title || 'este banner');

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase.from('banners').delete().eq('id', id);

      if (error) throw error;
      await fetchBanners();
      showToastSuccess('Banner eliminado correctamente');
    } catch (error) {
      console.error('Error deleting banner:', error);
      showToastError('Error al eliminar el banner');
    }
  }

  function handleBannerEdit(banner: Banner) {
    setEditingBanner(banner);
    setShowBannerForm(true);
  }

  function handleBannerCancel() {
    setShowBannerForm(false);
    setEditingBanner(null);
  }

  async function handlePromotionalSubmit(data: Partial<PromotionalSection>) {
    try {
      if (editingPromotional) {
        const { error } = await supabase
          .from('promotional_sections')
          .update(data)
          .eq('id', editingPromotional.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('promotional_sections').insert([data]);

        if (error) throw error;
      }

      await fetchPromotionalSections();
      setShowPromotionalForm(false);
      setEditingPromotional(null);
    } catch (error) {
      console.error('Error saving promotional section:', error);
      throw error;
    }
  }

  async function handlePromotionalDelete(id: string) {
    const section = promotionalSections.find(s => s.id === id);
    const result = await showDeleteConfirm(section?.title || 'esta sección');

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase.from('promotional_sections').delete().eq('id', id);

      if (error) throw error;
      await fetchPromotionalSections();
      showToastSuccess('Sección eliminada correctamente');
    } catch (error) {
      console.error('Error deleting promotional section:', error);
      showToastError('Error al eliminar la sección');
    }
  }

  function handlePromotionalEdit(section: PromotionalSection) {
    setEditingPromotional(section);
    setShowPromotionalForm(true);
  }

  function handlePromotionalCancel() {
    setShowPromotionalForm(false);
    setEditingPromotional(null);
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-gradient flex flex-col">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/extreme_png.png"
                alt="EXTREME PERFORMANCE"
                className="h-16 w-auto"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administrador</h1>
                <p className="text-gray-600">Gestión de productos</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'products'
                    ? 'theme-border-primary theme-text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package size={20} />
                  <span>Productos ({products.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'categories'
                    ? 'theme-border-primary theme-text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderTree size={20} />
                  <span>Categorías</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('banners')}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'banners'
                    ? 'theme-border-primary theme-text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Image size={20} />
                  <span>Banners ({banners.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('promotional')}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'promotional'
                    ? 'theme-border-primary theme-text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layout size={20} />
                  <span>Secciones ({promotionalSections.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'images'
                    ? 'theme-border-primary theme-text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Images size={20} />
                  <span>Galería</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('footer')}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'footer'
                    ? 'theme-border-primary theme-text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings size={20} />
                  <span>Footer</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('themes')}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === 'themes'
                    ? 'theme-border-primary theme-text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Palette size={20} />
                  <span>Temas</span>
                </div>
              </button>
            </div>
          </div>

          {activeTab !== 'categories' && activeTab !== 'images' && activeTab !== 'footer' && activeTab !== 'themes' && (
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'products' ? 'Productos' : activeTab === 'banners' ? 'Banners' : 'Secciones Promocionales'}
                </h2>
                <p className="text-gray-600">
                  {activeTab === 'products'
                    ? `${products.length} productos registrados`
                    : activeTab === 'banners'
                    ? `${banners.length} banners registrados`
                    : `${promotionalSections.length} secciones registradas`}
                </p>
              </div>
              <div className="flex gap-3">
                {activeTab === 'products' && products.length > 0 && (
                  <>
                    <button
                      onClick={() => exportToCSV(products)}
                      className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                      title="Exportar a CSV"
                    >
                      <FileDown size={20} />
                      <span className="hidden sm:inline">CSV</span>
                    </button>
                    <button
                      onClick={() => exportToPDF(products)}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                      title="Exportar a PDF"
                    >
                      <FileText size={20} />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() =>
                    activeTab === 'products'
                      ? setShowProductForm(true)
                      : activeTab === 'banners'
                      ? setShowBannerForm(true)
                      : setShowPromotionalForm(true)
                  }
                  className="flex items-center gap-2 px-6 py-3 theme-button-gradient theme-hover-primary text-white font-semibold rounded-lg transition-colors"
                >
                  <Plus size={20} />
                  <span>Agregar {activeTab === 'products' ? 'Producto' : activeTab === 'banners' ? 'Banner' : 'Sección'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'products' ? (
          products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Package className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-500 text-xl mb-4">No hay productos registrados</p>
              <button
                onClick={() => setShowProductForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 theme-button-gradient theme-hover-primary text-white font-semibold rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span>Agregar tu primer producto</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Package size={24} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full theme-bg-primary text-white">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleProductEdit(product)}
                              className="theme-text-primary hover:opacity-70 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleProductDuplicate(product)}
                              className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                              title="Duplicar"
                            >
                              <Copy size={18} />
                            </button>
                            <button
                              onClick={() => handleProductDelete(product.id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded-lg"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : activeTab === 'footer' ? (
          <FooterSettings />
        ) : activeTab === 'themes' ? (
          <ThemeSettings />
        ) : activeTab === 'images' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Galería de Imágenes</h2>
              <p className="text-gray-600 mb-6">
                Aquí puedes ver y gestionar todas las imágenes subidas. Puedes eliminar imágenes que ya no necesites.
              </p>
              <ImageGallery mode="view" />
            </div>
          </div>
        ) : activeTab === 'categories' ? (
          <CategoryManagement />
        ) : activeTab === 'promotional' ? (
          promotionalSections.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Layout className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-500 text-xl mb-4">No hay secciones promocionales registradas</p>
              <button
                onClick={() => setShowPromotionalForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 theme-button-gradient theme-hover-primary text-white font-semibold rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span>Agregar tu primera sección</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sección
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posición
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orden
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {promotionalSections.map((section) => (
                      <tr key={section.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-16 w-32 flex-shrink-0">
                              <img
                                src={section.image_url}
                                alt={section.title}
                                className="h-16 w-32 rounded-lg object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {section.title}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {section.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {section.section_type === 'full_width' ? 'Ancho completo' :
                             section.section_type === 'half_width' ? 'Medio ancho' :
                             section.section_type === 'grid_2' ? 'Grid 2' : 'Grid 3'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {section.position === 'top' ? 'Arriba' :
                             section.position === 'bottom' ? 'Abajo' :
                             section.position === 'middle' ? 'Medio' : 'Entre categorías'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {section.order_position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              section.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {section.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePromotionalEdit(section)}
                              className="theme-text-primary hover:opacity-70 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handlePromotionalDelete(section.id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          banners.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Image className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-500 text-xl mb-4">No hay banners registrados</p>
              <button
                onClick={() => setShowBannerForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 theme-button-gradient theme-hover-primary text-white font-semibold rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span>Agregar tu primer banner</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Banner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orden
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {banners.map((banner) => (
                      <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-16 w-32 flex-shrink-0">
                              <img
                                src={banner.image_url}
                                alt={banner.title}
                                className="h-16 w-32 rounded-lg object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {banner.title}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {banner.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {banner.category ? (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full theme-bg-primary text-white">
                              {banner.category}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {banner.order_position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              banner.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {banner.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBannerEdit(banner)}
                              className="theme-text-primary hover:opacity-70 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleBannerDelete(banner.id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </main>

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleProductSubmit}
          onCancel={handleProductCancel}
        />
      )}

      {showBannerForm && (
        <BannerForm
          banner={editingBanner}
          onSubmit={handleBannerSubmit}
          onCancel={handleBannerCancel}
          categories={categories}
        />
      )}

      {showPromotionalForm && (
        <PromotionalSectionForm
          section={editingPromotional}
          onSubmit={handlePromotionalSubmit}
          onCancel={handlePromotionalCancel}
          categories={categories}
        />
      )}

      <Footer onAdminClick={onBackClick} showAdminButton={true} isAdminView={true} />
    </div>
  );
}
