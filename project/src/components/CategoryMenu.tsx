import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { Category, Subcategory } from '../lib/supabase';

interface CategoryMenuProps {
  categories: Category[];
  subcategories: Subcategory[];
  onCategorySelect: (categoryName: string) => void;
  onSubcategorySelect: (subcategoryId: string, categoryName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryMenu({
  categories,
  subcategories,
  onCategorySelect,
  onSubcategorySelect,
  isOpen,
  onClose,
}: CategoryMenuProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  function toggleCategory(categoryId: string) {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  }

  function getSubcategoriesForCategory(categoryId: string) {
    return subcategories.filter((sub) => sub.category_id === categoryId);
  }

  function handleCategoryClick(category: Category) {
    onCategorySelect(category.name);
    onClose();
  }

  function handleSubcategoryClick(subcategory: Subcategory, categoryName: string) {
    onSubcategorySelect(subcategory.id, categoryName);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div
        ref={menuRef}
        className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Categorías</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => {
              onCategorySelect('all');
              onClose();
            }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-amber-50 transition-colors border border-gray-200 mb-3 font-semibold text-gray-900"
          >
            Todas las categorías
          </button>

          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay categorías disponibles
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => {
                const isExpanded = expandedCategories.has(category.id);
                const subcats = getSubcategoriesForCategory(category.id);
                const hasSubcategories = subcats.length > 0;

                return (
                  <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleCategoryClick(category)}
                        className="flex-1 text-left px-4 py-3 hover:bg-amber-50 transition-colors font-semibold text-gray-900"
                      >
                        {category.name}
                        {hasSubcategories && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({subcats.length})
                          </span>
                        )}
                      </button>
                      {hasSubcategories && (
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="px-3 py-3 hover:bg-gray-100 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown size={20} className="text-gray-600" />
                          ) : (
                            <ChevronRight size={20} className="text-gray-600" />
                          )}
                        </button>
                      )}
                    </div>

                    {isExpanded && hasSubcategories && (
                      <div className="bg-gray-50 border-t border-gray-200">
                        {subcats.map((subcat) => (
                          <button
                            key={subcat.id}
                            onClick={() => handleSubcategoryClick(subcat, category.name)}
                            className="w-full text-left px-8 py-2 hover:bg-amber-50 transition-colors text-sm text-gray-700 border-b border-gray-200 last:border-b-0"
                          >
                            {subcat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
