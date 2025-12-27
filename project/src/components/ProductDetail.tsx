import { useState } from 'react';
import { Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { X, Package, Ruler, Tag, CheckCircle2, Hash, ShoppingCart, Plus, Minus, MessageCircle } from 'lucide-react';
import { formatPrice } from '../utils/currency';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export function ProductDetail({ product, onClose }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleWhatsAppShare = () => {
    const phoneNumber = '5491131889898';

    let message = `¡Hola! Me interesa este producto:\n\n`;
    message += `*${product.name}*\n`;
    message += `Precio: ${formatPrice(product.price)}\n`;
    if (product.sku) {
      message += `SKU: ${product.sku}\n`;
    }
    if (product.brand) {
      message += `Marca: ${product.brand}\n`;
    }
    message += `\n¿Está disponible? Me gustaría conocer más detalles.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-2xl font-bold text-gray-900">Detalles del Producto</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Precio</span>
                  <span className="text-3xl font-bold text-amber-600">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock disponible</span>
                  <span className={`text-lg font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-amber-100 text-amber-800">
                  {product.category}
                </span>
              </div>

              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                  <div
                    className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Especificaciones</h3>

                <div className="space-y-3">
                  {product.sku && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Hash size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">SKU / Código Interno</p>
                        <p className="text-gray-900 font-mono">{product.sku}</p>
                      </div>
                    </div>
                  )}

                  {product.brand && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Tag size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Marca</p>
                        <p className="text-gray-900">{product.brand}</p>
                      </div>
                    </div>
                  )}

                  {product.dimensions && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Ruler size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Dimensiones</p>
                        <p className="text-gray-900">{product.dimensions}</p>
                      </div>
                    </div>
                  )}

                  {product.compatibility && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle2 size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Compatibilidad</p>
                        <p className="text-gray-900 whitespace-pre-wrap">{product.compatibility}</p>
                      </div>
                    </div>
                  )}

                  {!product.sku && !product.brand && !product.dimensions && !product.compatibility && (
                    <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                      <Package size={20} className="text-gray-400" />
                      <p className="text-gray-500 text-sm">No hay especificaciones adicionales disponibles</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                {product.stock > 0 ? (
                  <>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <span className="text-gray-700 font-medium">Cantidad:</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleDecrement}
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <Minus size={20} />
                        </button>
                        <span className="w-12 text-center text-xl font-bold text-gray-900">
                          {quantity}
                        </span>
                        <button
                          onClick={handleIncrement}
                          disabled={quantity >= product.stock}
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className={`w-full font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                        addedToCart
                          ? 'bg-green-600 text-white'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      <ShoppingCart size={20} />
                      {addedToCart ? 'Agregado al carrito' : 'Agregar al carrito'}
                    </button>
                  </>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-700 font-semibold">Producto agotado</p>
                  </div>
                )}

                <button
                  onClick={handleWhatsAppShare}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} />
                  Consultar por WhatsApp
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
