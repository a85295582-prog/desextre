import { useEffect, useState } from 'react';
import { supabase, Category, Subcategory } from '../lib/supabase';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubcategories() {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  }

  function toggleItem(itemId: string) {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  }

  function getSubcategoriesForParent(categoryId: string, parentId: string | null): Subcategory[] {
    if (parentId) {
      return subcategories.filter((sub) => sub.parent_id === parentId);
    }
    return subcategories.filter((sub) => sub.category_id === categoryId && !sub.parent_id);
  }

  function countAllSubcategories(categoryId: string): number {
    return subcategories.filter(sub => sub.category_id === categoryId).length;
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta categoría y todas sus subcategorías?')) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      await fetchCategories();
      await fetchSubcategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  async function handleDeleteSubcategory(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta subcategoría y sus subcategorías anidadas?')) return;

    try {
      const { error } = await supabase.from('subcategories').delete().eq('id', id);
      if (error) throw error;
      await fetchSubcategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
    }
  }

  function handleAddSubcategory(categoryId: string, parentId: string | null = null) {
    setSelectedCategoryId(categoryId);
    setSelectedParentId(parentId);
    setEditingSubcategory(null);
    setShowSubcategoryForm(true);
  }

  function renderSubcategories(categoryId: string, parentId: string | null, level: number = 0) {
    const subcats = getSubcategoriesForParent(categoryId, parentId);

    return subcats.map((subcat) => {
      const isExpanded = expandedItems.has(subcat.id);
      const children = getSubcategoriesForParent(categoryId, subcat.id);
      const hasChildren = children.length > 0;

      return (
        <div key={subcat.id} className="space-y-2">
          <div
            className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
            style={{ marginLeft: `${level * 24}px` }}
          >
            <div className="flex items-center gap-2 flex-1">
              {hasChildren ? (
                <button
                  onClick={() => toggleItem(subcat.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <div className="w-4" />
              )}
              <span className="text-sm font-medium text-gray-900">{subcat.name}</span>
              {hasChildren && (
                <span className="text-xs text-gray-500">({children.length})</span>
              )}
              {!subcat.is_active && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Inactiva
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddSubcategory(categoryId, subcat.id)}
                className="theme-text-primary hover:opacity-70 p-1 hover:bg-gray-100 rounded transition-colors"
                title="Agregar subcategoría"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => {
                  setEditingSubcategory(subcat);
                  setSelectedCategoryId(subcat.category_id);
                  setSelectedParentId(subcat.parent_id || null);
                  setShowSubcategoryForm(true);
                }}
                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDeleteSubcategory(subcat.id)}
                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {isExpanded && hasChildren && (
            <div>{renderSubcategories(categoryId, subcat.id, level + 1)}</div>
          )}
        </div>
      );
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 theme-border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Categorías y Subcategorías</h3>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowCategoryForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 theme-button-gradient theme-hover-primary text-white font-semibold rounded-lg transition-colors text-sm"
        >
          <Plus size={16} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No hay categorías registradas</p>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 theme-button-gradient theme-hover-primary text-white font-semibold rounded-lg transition-colors"
          >
            <Plus size={16} />
            <span>Agregar primera categoría</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => {
            const isExpanded = expandedItems.has(category.id);
            const totalSubs = countAllSubcategories(category.id);
            const rootSubs = getSubcategoriesForParent(category.id, null);

            return (
              <div key={category.id} className="bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleItem(category.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{category.name}</h4>
                        <span className="text-xs text-gray-500">
                          ({totalSubs} subcategorías)
                        </span>
                        {!category.is_active && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Inactiva
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddSubcategory(category.id, null)}
                      className="theme-text-primary hover:opacity-70 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Agregar subcategoría"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setShowCategoryForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {isExpanded && rootSubs.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="space-y-2">{renderSubcategories(category.id, null, 0)}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
          onSuccess={() => {
            fetchCategories();
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      {showSubcategoryForm && (
        <SubcategoryForm
          subcategory={editingSubcategory}
          categoryId={selectedCategoryId}
          parentId={selectedParentId}
          categories={categories}
          subcategories={subcategories}
          onClose={() => {
            setShowSubcategoryForm(false);
            setEditingSubcategory(null);
            setSelectedCategoryId('');
            setSelectedParentId(null);
          }}
          onSuccess={() => {
            fetchSubcategories();
            setShowSubcategoryForm(false);
            setEditingSubcategory(null);
            setSelectedCategoryId('');
            setSelectedParentId(null);
          }}
        />
      )}
    </div>
  );
}

interface CategoryFormProps {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

function CategoryForm({ category, onClose, onSuccess }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || 'Package',
    order_position: category?.order_position?.toString() || '0',
    is_active: category?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        order_position: parseInt(formData.order_position),
        is_active: formData.is_active,
      };

      if (category) {
        const { error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([data]);
        if (error) throw error;
      }

      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar la categoría';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {category ? 'Editar Categoría' : 'Nueva Categoría'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden
              </label>
              <input
                type="number"
                value={formData.order_position}
                onChange={(e) => setFormData({ ...formData, order_position: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="flex items-center h-10">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Activa</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 theme-button-gradient theme-hover-primary text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : category ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface SubcategoryFormProps {
  subcategory: Subcategory | null;
  categoryId: string;
  parentId: string | null;
  categories: Category[];
  subcategories: Subcategory[];
  onClose: () => void;
  onSuccess: () => void;
}

function SubcategoryForm({
  subcategory,
  categoryId,
  parentId,
  categories,
  subcategories,
  onClose,
  onSuccess,
}: SubcategoryFormProps) {
  const [formData, setFormData] = useState({
    category_id: subcategory?.category_id || categoryId,
    parent_id: subcategory?.parent_id || parentId || '',
    name: subcategory?.name || '',
    order_position: subcategory?.order_position?.toString() || '0',
    is_active: subcategory?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const level = parentId ? (subcategories.find(s => s.id === parentId)?.level || 0) + 1 : 0;

  function getAvailableParents(catId: string): Subcategory[] {
    const filtered = subcategories.filter((sub) =>
      sub.category_id === catId &&
      (!subcategory || sub.id !== subcategory.id)
    );
    return filtered;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data: Record<string, string | number | boolean | null> = {
        name: formData.name,
        order_position: parseInt(formData.order_position),
        is_active: formData.is_active,
        level: level,
      };

      if (formData.parent_id) {
        data.parent_id = formData.parent_id;
        data.category_id = formData.category_id;
      } else {
        data.category_id = formData.category_id;
        data.parent_id = null;
      }

      if (subcategory) {
        const { error } = await supabase
          .from('subcategories')
          .update(data)
          .eq('id', subcategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('subcategories').insert([data]);
        if (error) throw error;
      }

      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar la subcategoría';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const availableParents = getAvailableParents(formData.category_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {subcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría principal *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => {
                setFormData({ ...formData, category_id: e.target.value, parent_id: '' });
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {formData.category_id && availableParents.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategoría padre (opcional)
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Ninguna (nivel raíz)</option>
                {availableParents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {'  '.repeat(parent.level || 0)} {parent.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden
              </label>
              <input
                type="number"
                value={formData.order_position}
                onChange={(e) => setFormData({ ...formData, order_position: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="flex items-center h-10">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Activa</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 theme-button-gradient theme-hover-primary text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : subcategory ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
