interface BrandBarProps {
  brands: string[];
  selectedBrand: string;
  onBrandClick: (brand: string) => void;
}

export function BrandBar({
  brands,
  selectedBrand,
  onBrandClick,
}: BrandBarProps) {
  if (brands.length === 0) return null;

  return (
    <div className="mb-8">
    
      <div className="bg-extreme-black-200 border border-extreme-green-500/30 rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => onBrandClick('all')}
            className={`px-8 py-4 rounded-lg font-bold text-base whitespace-nowrap transition-all shadow-md flex-shrink-0 ${
              selectedBrand === 'all'
                ? 'bg-extreme-green-500 text-black scale-105 shadow-extreme-green-500/50'
                : 'bg-extreme-black-300 text-white hover:bg-extreme-black-100 border border-extreme-green-500/30 hover:scale-105'
            }`}
          >
            TODAS LAS MARCAS
          </button>

          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => onBrandClick(brand)}
              className={`px-8 py-4 rounded-lg font-bold text-base whitespace-nowrap transition-all shadow-md flex-shrink-0 ${
                selectedBrand === brand
                  ? 'bg-extreme-green-500 text-black scale-105 shadow-extreme-green-500/50'
                  : 'bg-extreme-black-300 text-white hover:bg-extreme-black-100 border border-extreme-green-500/30 hover:scale-105'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
