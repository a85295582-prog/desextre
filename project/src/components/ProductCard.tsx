import { ShoppingCart, MessageCircle, Plus, Package } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

function handleWhatsAppShare(e: React.MouseEvent, product: Product) {
  e.stopPropagation();
  const phoneNumber = '595975883322';

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
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addItem(product);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-extreme-black-200 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-extreme-green-500/20 transition-all duration-500 flex flex-col h-full cursor-pointer transform hover:-translate-y-2 border border-extreme-green-500/30"
    >
      <div className="h-40 sm:h-48 md:h-56 bg-gradient-to-br from-extreme-black-300 to-extreme-black-200 overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-extreme-green-500/50">
            <ShoppingCart size={40} className="sm:w-14 sm:h-14 opacity-50" />
          </div>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-extreme-green-600 to-extreme-green-700 text-black text-xs px-3 py-1.5 rounded-full font-bold shadow-lg backdrop-blur-sm animate-pulse">
            Pocas unidades
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
            Agotado
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-black bg-extreme-green-500 px-2 py-1 rounded-md uppercase tracking-wider">
            {product.category}
          </span>
          {product.brand && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Package size={12} />
              {product.brand}
            </span>
          )}
        </div>

        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white mb-4 line-clamp-2 flex-grow">
          {product.name}
        </h3>

        <div className="flex flex-col gap-3 mt-auto">
          <div className="flex items-center justify-between bg-extreme-black-300 border border-extreme-green-500/30 p-3 rounded-lg">
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Precio</div>
              <span className="text-xl sm:text-2xl font-black text-extreme-green-500">
                {formatPrice(product.price)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-0.5">Stock</div>
              <span className={`text-lg font-bold ${
                product.stock === 0 ? 'text-red-500' :
                product.stock < 10 ? 'text-extreme-green-400' :
                'text-extreme-green-500'
              }`}>
                {product.stock}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
             <button
    onClick={handleAddToCart}
    disabled={product.stock === 0}
    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
      product.stock === 0
        ? 'bg-extreme-black-300 text-gray-600 cursor-not-allowed border border-extreme-green-500/20'
        : 'bg-white text-black hover:bg-gray-100 hover:shadow-lg hover:shadow-green-500/50 transform hover:scale-105 shadow-md'
    }`}
  >
    <Plus size={16} />
    <span className="hidden sm:inline">Carrito</span>
  </button>
            <button
              onClick={(e) => handleWhatsAppShare(e, product)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-gray-100 text-green-600 text-sm font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-green-500/50 transform hover:scale-105


"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
