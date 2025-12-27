import { useState, useEffect } from 'react';
import { Filter, X, DollarSign, Package } from 'lucide-react';
import { Product } from '../lib/supabase';

interface ProductFiltersProps {
  products: Product[];
  onFilterChange: (filtered: Product[]) => void;
  categories: string[];
  allProducts: Product[];
}

export function ProductFilters({ products, onFilterChange, categories, allProducts }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const brands = Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean))) as string[];

  const applyFilters = () => {
    let filtered = [...products];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => p.brand && selectedBrands.includes(p.brand));
    }

    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (onlyInStock) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    onFilterChange(filtered);
  };

  const clearFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setOnlyInStock(false);
    onFilterChange(products);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const activeFiltersCount =
    selectedCategories.length +
    selectedBrands.length +
    (onlyInStock ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 100000 ? 1 : 0);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <Filter size={20} />
        <span className="hidden sm:inline"></span>
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Filter size={24} />
                Filtros
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={20} className="text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Rango de Precio</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-sm text-gray-600">Mínimo</label>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-gray-600">Máximo</label>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categorías</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {brands.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package size={20} className="text-amber-600" />
                    <h3 className="font-semibold text-gray-900">Marcas</h3>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 text-amber-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 p-3 bg-amber-50 hover:bg-amber-100 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900">Solo productos en stock</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-2">
              <button
                onClick={() => {
                  applyFilters();
                  setIsOpen(false);
                }}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 rounded-lg transition-all"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
