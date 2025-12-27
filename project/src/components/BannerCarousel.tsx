import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  category?: string;
  show_title?: boolean;
  show_shadow?: boolean;
}

interface BannerCarouselProps {
  onCategoryClick?: (category: string) => void;
}

export function BannerCarousel({ onCategoryClick }: BannerCarouselProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  async function fetchBanners() {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  }

  function handlePrevious() {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }

  function handleBannerClick(banner: Banner) {
    if (banner.category && onCategoryClick) {
      onCategoryClick(banner.category);
    } else if (banner.link_url) {
      window.open(banner.link_url, '_blank');
    }
  }

  if (loading || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const showTitle = currentBanner.show_title ?? true;
  const showShadow = currentBanner.show_shadow ?? true;

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[450px] overflow-hidden rounded-lg shadow-lg group">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 cursor-pointer"
        style={{ backgroundImage: `url(${currentBanner.image_url})` }}
        onClick={() => handleBannerClick(currentBanner)}
      >
        {showShadow && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        )}
        {showTitle && (
          <div className="absolute inset-0">
            <div className="h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 animate-fade-in drop-shadow-lg">
                {currentBanner.title}
              </h2>
              {currentBanner.description && (
                <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3 drop-shadow-lg">
                  {currentBanner.description}
                </p>
              )}
              {(currentBanner.link_url || currentBanner.category) && (
                <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-colors w-fit text-sm sm:text-base">
                  Ver más
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Banner anterior"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Banner siguiente"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-6 sm:w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Ir al banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
