import { Package, Shirt, Home, Smartphone, Book, Utensils } from 'lucide-react';

interface Category {
  name: string;
  icon: React.ReactNode;
  count: number;
}

interface CategoryGridProps {
  categories: string[];
  productCounts: Record<string, number>;
  onCategoryClick: (category: string) => void;
  selectedCategory: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Electrónica': <Smartphone size={32} />,
  'Ropa': <Shirt size={32} />,
  'Hogar': <Home size={32} />,
  'Libros': <Book size={32} />,
  'Alimentos': <Utensils size={32} />,
};

export function CategoryGrid({
  categories,
  productCounts,
  onCategoryClick,
  selectedCategory,
}: CategoryGridProps) {
  const categoryData: Category[] = categories.map((cat) => ({
    name: cat,
    icon: categoryIcons[cat] || <Package size={32} />,
    count: productCounts[cat] || 0,
  }));

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-extreme-green-500 mb-4 px-1">
        Categorías
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <button
          onClick={() => onCategoryClick('all')}
          className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-lg transition-all border ${
            selectedCategory === 'all'
              ? 'bg-extreme-green-500 text-black shadow-lg shadow-extreme-green-500/50 scale-105 border-extreme-green-500'
              : 'bg-extreme-black-200 hover:bg-extreme-black-100 text-white shadow-md hover:shadow-lg border-extreme-green-500/30 hover:border-extreme-green-500'
          }`}
        >
          <Package size={28} className="sm:w-8 sm:h-8 mb-2" />
          <span className="font-semibold text-sm sm:text-base text-center">
            Todos
          </span>
          <span className="text-xs mt-1 opacity-75">
            {Object.values(productCounts).reduce((a, b) => a + b, 0)}
          </span>
        </button>

        {categoryData.map((category) => (
          <button
            key={category.name}
            onClick={() => onCategoryClick(category.name)}
            className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-lg transition-all border ${
              selectedCategory === category.name
                ? 'bg-extreme-green-500 text-black shadow-lg shadow-extreme-green-500/50 scale-105 border-extreme-green-500'
                : 'bg-extreme-black-200 hover:bg-extreme-black-100 text-white shadow-md hover:shadow-lg border-extreme-green-500/30 hover:border-extreme-green-500'
            }`}
          >
            <div className="mb-2">{category.icon}</div>
            <span className="font-semibold text-sm sm:text-base text-center line-clamp-1">
              {category.name}
            </span>
            <span className="text-xs mt-1 opacity-75">{category.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
