import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Product } from '../lib/supabase';
import { ProductCard } from './ProductCard';

interface CategoryProductSectionProps {
  category: string;
  products: Product[];
  onCategoryClick: (category: string) => void;
  onProductClick: (product: Product) => void;
  autoScroll?: boolean;
  scrollInterval?: number;
}

export function CategoryProductSection({
  category,
  products,
  onCategoryClick,
  onProductClick,
  autoScroll = true,
  scrollInterval = 5000,
}: CategoryProductSectionProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!autoScroll || isHovered || products.length === 0) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;

        if (scrollPosition >= maxScroll) {
          setScrollPosition(0);
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const newPosition = Math.min(scrollPosition + 300, maxScroll);
          setScrollPosition(newPosition);
          container.scrollTo({ left: newPosition, behavior: 'smooth' });
        }
      }
    }, scrollInterval);

    return () => clearInterval(interval);
  }, [scrollPosition, autoScroll, isHovered, products.length, scrollInterval]);

  if (products.length === 0) return null;

  function handleScroll(direction: 'left' | 'right') {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = 300;
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);

    setScrollPosition(newPosition);
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
  }

  return (
    <div
      className="mb-12 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white px-1">
          {category}
        </h2>
        <button
          onClick={() => onCategoryClick(category)}
          className="flex items-center gap-2 text-white hover:text-gray-200 font-semibold transition-colors group"
        >
          <span>Ver todos</span> 
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          disabled={scrollPosition === 0}
        >
          <ChevronLeft size={24} />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-hidden scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-48 sm:w-56">
              <ProductCard
                product={product}
                onClick={() => onProductClick(product)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          disabled={scrollContainerRef.current && scrollPosition >= (scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth)}
        >
          <ChevronRight size={24} />
        </button>
      </div>

     
    </div>
  );
}
