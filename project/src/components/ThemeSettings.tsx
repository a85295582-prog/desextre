import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Palette, Save, Plus, Trash2, Check } from 'lucide-react';
import { showToastSuccess, showToastError } from '../utils/sweetalert';

interface SiteTheme {
  id: string;
  theme_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_gradient_from: string;
  background_gradient_to: string;
  header_background: string;
  button_gradient_from: string;
  button_gradient_to: string;
  custom_css: string | null;
  active: boolean;
}

export function ThemeSettings() {
  const [themes, setThemes] = useState<SiteTheme[]>([]);
  const [activeTheme, setActiveTheme] = useState<SiteTheme | null>(null);
  const [editingTheme, setEditingTheme] = useState<SiteTheme | null>(null);
  const [newThemeName, setNewThemeName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('site_theme_settings')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setThemes(data || []);
      const active = data?.find(t => t.active);
      setActiveTheme(active || null);
    } catch (error) {
      console.error('Error fetching themes:', error);
      showToastError('Error al cargar los temas');
    } finally {
      setLoading(false);
    }
  };

  const activateTheme = async (themeId: string) => {
    try {
      await supabase.from('site_theme_settings').update({ active: false }).neq('id', themeId);

      const { error } = await supabase
        .from('site_theme_settings')
        .update({ active: true })
        .eq('id', themeId);

      if (error) throw error;

      showToastSuccess('Tema activado correctamente');
      fetchThemes();
      window.location.reload();
    } catch (error) {
      console.error('Error activating theme:', error);
      showToastError('Error al activar el tema');
    }
  };

  const saveTheme = async () => {
    if (!editingTheme) return;

    try {
      const { error } = await supabase
        .from('site_theme_settings')
        .update({
          theme_name: editingTheme.theme_name,
          primary_color: editingTheme.primary_color,
          secondary_color: editingTheme.secondary_color,
          accent_color: editingTheme.accent_color,
          background_gradient_from: editingTheme.background_gradient_from,
          background_gradient_to: editingTheme.background_gradient_to,
          header_background: editingTheme.header_background,
          button_gradient_from: editingTheme.button_gradient_from,
          button_gradient_to: editingTheme.button_gradient_to,
          custom_css: editingTheme.custom_css,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTheme.id);

      if (error) throw error;

      showToastSuccess('Tema guardado correctamente');
      setEditingTheme(null);
      fetchThemes();

      if (editingTheme.active) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      showToastError('Error al guardar el tema');
    }
  };

  const createNewTheme = async () => {
    if (!newThemeName.trim()) {
      showToastError('Por favor ingresa un nombre para el tema');
      return;
    }

    try {
      const { error } = await supabase.from('site_theme_settings').insert({
        theme_name: newThemeName,
        active: false,
      });

      if (error) throw error;

      showToastSuccess('Tema creado correctamente');
      setNewThemeName('');
      fetchThemes();
    } catch (error) {
      console.error('Error creating theme:', error);
      showToastError('Error al crear el tema');
    }
  };

  const deleteTheme = async (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme?.active) {
      showToastError('No puedes eliminar el tema activo');
      return;
    }

    try {
      const { error } = await supabase.from('site_theme_settings').delete().eq('id', themeId);

      if (error) throw error;

      showToastSuccess('Tema eliminado correctamente');
      fetchThemes();
    } catch (error) {
      console.error('Error deleting theme:', error);
      showToastError('Error al eliminar el tema');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Palette size={28} className="text-amber-600" />
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Temas</h2>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Crear Nuevo Tema</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Nombre del tema (ej: Verano, Black Friday)"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={createNewTheme}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all"
          >
            <Plus size={20} />
            Crear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`bg-white rounded-xl shadow-md p-6 border-2 ${
              theme.active ? 'border-green-500' : 'border-transparent'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">{theme.theme_name}</h3>
                {theme.active && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    <Check size={14} />
                    Activo
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {!theme.active && (
                  <>
                    <button
                      onClick={() => setEditingTheme(theme)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => activateTheme(theme.id)}
                      className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Activar
                    </button>
                    <button
                      onClick={() => deleteTheme(theme.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
                {theme.active && (
                  <button
                    onClick={() => setEditingTheme(theme)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-24">Color Principal:</span>
                <div
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: theme.primary_color }}
                />
                <span className="text-sm font-mono">{theme.primary_color}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-24">Botones:</span>
                <div
                  className="w-16 h-8 rounded"
                  style={{
                    background: `linear-gradient(to right, ${theme.button_gradient_from}, ${theme.button_gradient_to})`,
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-24">Fondo:</span>
                <div
                  className="w-16 h-8 rounded"
                  style={{
                    background: `linear-gradient(to right, ${theme.background_gradient_from}, ${theme.background_gradient_to})`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingTheme && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                Editar Tema: {editingTheme.theme_name}
              </h3>
              <button
                onClick={() => setEditingTheme(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Tema
                </label>
                <input
                  type="text"
                  value={editingTheme.theme_name}
                  onChange={(e) =>
                    setEditingTheme({ ...editingTheme, theme_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color Principal
                  </label>
                  <input
                    type="color"
                    value={editingTheme.primary_color}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, primary_color: e.target.value })
                    }
                    className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color Secundario
                  </label>
                  <input
                    type="color"
                    value={editingTheme.secondary_color}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, secondary_color: e.target.value })
                    }
                    className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fondo - Color Inicio
                  </label>
                  <input
                    type="color"
                    value={editingTheme.background_gradient_from}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        background_gradient_from: e.target.value,
                      })
                    }
                    className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fondo - Color Fin
                  </label>
                  <input
                    type="color"
                    value={editingTheme.background_gradient_to}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, background_gradient_to: e.target.value })
                    }
                    className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Botón - Color Inicio
                  </label>
                  <input
                    type="color"
                    value={editingTheme.button_gradient_from}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, button_gradient_from: e.target.value })
                    }
                    className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Botón - Color Fin
                  </label>
                  <input
                    type="color"
                    value={editingTheme.button_gradient_to}
                    onChange={(e) =>
                      setEditingTheme({ ...editingTheme, button_gradient_to: e.target.value })
                    }
                    className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CSS Personalizado (Opcional)
                </label>
                <textarea
                  value={editingTheme.custom_css || ''}
                  onChange={(e) =>
                    setEditingTheme({ ...editingTheme, custom_css: e.target.value })
                  }
                  rows={6}
                  placeholder=".custom-class { color: red; }"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={saveTheme}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all"
              >
                <Save size={20} />
                Guardar Cambios
              </button>
              <button
                onClick={() => setEditingTheme(null)}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
