import { PromotionalSection as PromotionalSectionType } from '../lib/supabase';

interface PromotionalSectionProps {
  section: PromotionalSectionType;
  onCategoryClick?: (category: string) => void;
}

export function PromotionalSection({ section, onCategoryClick }: PromotionalSectionProps) {
  function handleClick() {
    if (section.category && onCategoryClick) {
      onCategoryClick(section.category);
    } else if (section.link_url) {
      window.open(section.link_url, '_blank');
    }
  }

  const getLayoutClasses = () => {
    switch (section.section_type) {
      case 'full_width':
        return 'w-full h-64 sm:h-80 md:h-96';
      case 'half_width':
        return 'w-full md:w-1/2 h-56 sm:h-72 md:h-80';
      case 'grid_2':
        return 'w-full md:w-1/2 h-48 sm:h-64';
      case 'grid_3':
        return 'w-full md:w-1/3 h-40 sm:h-56';
      default:
        return 'w-full h-64';
    }
  };

  const isClickable = section.category || section.link_url;

  return (
    <div
      className={`${getLayoutClasses()} rounded-lg overflow-hidden shadow-lg ${
        isClickable ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''
      }`}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="relative w-full h-full bg-gray-200">
        {section.image_url && (
          <img
            src={section.image_url}
            alt={section.title || 'Promotional section'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {(section.title || section.description) && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent flex items-center">
            <div className="px-6 sm:px-8 lg:px-12 max-w-xl">
              {section.title && (
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                  {section.title}
                </h3>
              )}
              {section.description && (
                <p className="text-sm sm:text-base lg:text-lg text-white/90 line-clamp-2">
                  {section.description}
                </p>
              )}
              {isClickable && (
                <button className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm sm:text-base">
                  Ver más
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
