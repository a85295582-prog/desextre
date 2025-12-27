import { useEffect, useState } from 'react';
import { supabase, Product, Category, Subcategory, PromotionalSection as PromotionalSectionType } from '../lib/supabase';
import { ProductCard } from './ProductCard';
import { ProductDetail } from './ProductDetail';
import { Cart } from './Cart';
import { BannerCarousel } from './BannerCarousel';
import { CategoryBar } from './CategoryBar';
import { BrandBar } from './BrandBar';
import { CategoryMenu } from './CategoryMenu';
import { CategoryProductSection } from './CategoryProductSection';
import { PromotionalSection } from './PromotionalSection';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { ProductFilters } from './ProductFilters';
import { useCart } from '../contexts/CartContext';
import { Search, Menu, X, FolderTree, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../utils/currency';

interface CatalogProps {
  onAdminClick?: () => void;
  showAdminButton?: boolean;
}

export function Catalog({ onAdminClick, showAdminButton = false }: CatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [baseFilteredProducts, setBaseFilteredProducts] = useState<Product[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [promotionalSections, setPromotionalSections] = useState<PromotionalSectionType[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { getTotalItems, items } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchCategoriesAndSubcategories();
    fetchPromotionalSections();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedSubcategoryId, selectedBrand]);

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

      const uniqueBrands = Array.from(
        new Set(data?.map((p) => p.brand).filter((b) => b && b.trim() !== '') || [])
      ).sort();
      setBrands(uniqueBrands as string[]);

      const counts: Record<string, number> = {};
      data?.forEach((product) => {
        counts[product.category] = (counts[product.category] || 0) + 1;
      });
      setProductCounts(counts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategoriesAndSubcategories() {
    try {
      const [categoriesResult, subcategoriesResult] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true }),
        supabase
          .from('subcategories')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true }),
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (subcategoriesResult.error) throw subcategoriesResult.error;

      setDbCategories(categoriesResult.data || []);
      setSubcategories(subcategoriesResult.data || []);
    } catch (error) {
      console.error('Error fetching categories and subcategories:', error);
    }
  }

  async function fetchPromotionalSections() {
    try {
      const { data, error } = await supabase
        .from('promotional_sections')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (error) throw error;
      setPromotionalSections(data || []);
    } catch (error) {
      console.error('Error fetching promotional sections:', error);
    }
  }

  function filterProducts() {
    let filtered = products;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
          (p.brand && p.brand.toLowerCase().includes(searchLower))
      );
    }

    if (selectedSubcategoryId) {
      filtered = filtered.filter((p) => p.subcategory_id === selectedSubcategoryId);
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedBrand !== 'all') {
      filtered = filtered.filter((p) => p.brand === selectedBrand);
    }

    setBaseFilteredProducts(filtered);
    setDisplayProducts(filtered);
  }

  function handleCategoryClick(category: string) {
    setSelectedCategory(category);
    setSelectedSubcategoryId('');
    setSelectedBrand('all');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubcategorySelect(subcategoryId: string, categoryName: string) {
    setSelectedSubcategoryId(subcategoryId);
    setSelectedCategory(categoryName);
    setSelectedBrand('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBrandClick(brand: string) {
    setSelectedBrand(brand);
    setSelectedCategory('all');
    setSelectedSubcategoryId('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleLogoClick() {
    setSelectedCategory('all');
    setSelectedSubcategoryId('');
    setSelectedBrand('all');
    setSearchTerm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getSelectedSubcategoryName() {
    if (!selectedSubcategoryId) return '';
    const subcat = subcategories.find((s) => s.id === selectedSubcategoryId);
    return subcat?.name || '';
  }

  function handleCheckout() {
    const phoneNumber = '5491131889898';

    let message = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n';

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   - Cantidad: ${item.quantity}\n`;
      message += `   - Precio unitario: ${formatPrice(item.product.price)}\n`;
      message += `   - Subtotal: ${formatPrice(item.product.price * item.quantity)}\n`;
      if (item.product.sku) {
        message += `   - SKU: ${item.product.sku}\n`;
      }
      message += '\n';
    });

    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    message += `*Total: ${formatPrice(total)}*\n\n`;
    message += '¿Podrías confirmar la disponibilidad y el método de envío?';

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-extreme-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="bg-extreme-black-200 shadow-lg shadow-extreme-green-500/20 sticky top-0 z-20 border-b border-extreme-green-500/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button onClick={handleLogoClick} className="focus:outline-none">
                <img
                  src="/extreme_png.png"
                  alt="EXTREME PERFORMANCE"
                  className="h-10 sm:h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <ProductFilters
                products={baseFilteredProducts}
                onFilterChange={setDisplayProducts}
                categories={categories}
                allProducts={products}
              />

              <button
                onClick={() => setCategoryMenuOpen(true)}
                className="p-2 hover:bg-extreme-green-500/20 rounded-lg transition-colors border border-extreme-green-500/30"
                title="Ver categorías"
              >
                <FolderTree size={24} className="text-extreme-green-500" />
              </button>

              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 hover:bg-extreme-green-500/20 rounded-lg transition-colors border border-extreme-green-500/30"
                title="Ver carrito"
              >
                <ShoppingCart size={24} className="text-extreme-green-500" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-extreme-green-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-extreme-green-500" size={20} />
            <input
              type="text"
              placeholder="Buscar productos por nombre, categoría, marca, SKU o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-extreme-black-300 border border-extreme-green-500/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-extreme-green-500 focus:border-extreme-green-500"
            />
          </div>
        </div>
      </header>

      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryClick={handleCategoryClick}
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8">
          <BannerCarousel onCategoryClick={handleCategoryClick} />
        </div>

        {promotionalSections.filter((s) => s.position === 'top').length > 0 && (
          <div className="mb-8 flex flex-wrap gap-4">
            {promotionalSections
              .filter((s) => s.position === 'top')
              .map((section) => (
                <PromotionalSection
                  key={section.id}
                  section={section}
                  onCategoryClick={handleCategoryClick}
                />
              ))}
          </div>
        )}

        {selectedCategory === 'all' && !searchTerm && !selectedSubcategoryId && selectedBrand === 'all' ? (
          <>
            <BrandBar
              brands={brands}
              selectedBrand={selectedBrand}
              onBrandClick={handleBrandClick}
            />

            <div className="space-y-8">
              {categories.map((category, index) => {
                const categoryProducts = products.filter((p) => p.category === category);
                const betweenSections = promotionalSections.filter(
                  (s) => s.position === 'between_categories' && s.order_position === index
                );

                return (
                  <div key={category}>
                    {betweenSections.length > 0 && (
                      <div className="mb-8 flex flex-wrap gap-4">
                        {betweenSections.map((section) => (
                          <PromotionalSection
                            key={section.id}
                            section={section}
                            onCategoryClick={handleCategoryClick}
                          />
                        ))}
                      </div>
                    )}
                    <CategoryProductSection
                      category={category}
                      products={categoryProducts}
                      onCategoryClick={handleCategoryClick}
                      onProductClick={setSelectedProduct}
                    />
                  </div>
                );
              })}
            </div>

            {promotionalSections.filter((s) => s.position === 'bottom').length > 0 && (
              <div className="mt-8 flex flex-wrap gap-4">
                {promotionalSections
                  .filter((s) => s.position === 'bottom')
                  .map((section) => (
                    <PromotionalSection
                      key={section.id}
                      section={section}
                      onCategoryClick={handleCategoryClick}
                    />
                  ))}
              </div>
            )}
          </>
        ) : (
          <>
            <BrandBar
              brands={brands}
              selectedBrand={selectedBrand}
              onBrandClick={handleBrandClick}
            />

            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-extreme-green-500 px-1">
                {selectedBrand !== 'all'
                  ? `Productos de ${selectedBrand}`
                  : selectedCategory === 'all'
                  ? 'Todos los Productos'
                  : selectedSubcategoryId
                  ? `${selectedCategory} > ${getSelectedSubcategoryName()}`
                  : `Productos de ${selectedCategory}`}
              </h2>
              <p className="text-sm text-gray-400 mt-1 px-1">
                {displayProducts.length} {displayProducts.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            {displayProducts.length === 0 ? (
              <div className="text-center py-16 bg-extreme-black-200 rounded-lg shadow-lg border border-extreme-green-500/20">
                <p className="text-gray-400 text-lg sm:text-xl">
                  No se encontraron productos
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <CategoryMenu
        categories={dbCategories}
        subcategories={subcategories}
        onCategorySelect={handleCategoryClick}
        onSubcategorySelect={handleSubcategorySelect}
        isOpen={categoryMenuOpen}
        onClose={() => setCategoryMenuOpen(false)}
      />

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <ScrollToTop />
      <Footer onAdminClick={onAdminClick} showAdminButton={showAdminButton} />
    </div>
  );
}
