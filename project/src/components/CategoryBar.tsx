interface CategoryBarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryClick: (category: string) => void;
}

export function CategoryBar({
  categories,
  selectedCategory,
  onCategoryClick,
}: CategoryBarProps) {
  return (
    <div className="bg-extreme-black-200 border-b border-extreme-green-500/30 mb-6">
      <div className="w-full">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-6 py-3">
          <button
            onClick={() => onCategoryClick('all')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-extreme-green-500 text-black'
                : 'bg-extreme-black-300 text-white hover:bg-extreme-black-100 border border-extreme-green-500/30'
            }`}
          >
            Todas las categorías
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryClick(category)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-extreme-green-500 text-black'
                  : 'bg-extreme-black-300 text-white hover:bg-extreme-black-100 border border-extreme-green-500/30'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
