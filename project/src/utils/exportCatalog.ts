import { Product } from '../lib/supabase';
import { showToastError, showToastSuccess } from './sweetalert';
import { formatPrice } from './currency';

async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22120%22 height=%22120%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%239ca3af%22 font-size=%2214%22%3ESin imagen%3C/text%3E%3C/svg%3E';
  }
}

export function exportToCSV(products: Product[]) {
  const headers = ['SKU', 'Nombre', 'Marca', 'Categoría', 'Precio', 'Stock', 'Descripción', 'Dimensiones', 'Compatibilidad'];

  const csvContent = [
    headers.join(','),
    ...products.map(p => [
      p.sku || '',
      `"${p.name.replace(/"/g, '""')}"`,
      p.brand || '',
      p.category,
      formatPrice(p.price).replace(/₲\s/, ''),
      p.stock,
      `"${p.description.replace(/"/g, '""')}"`,
      p.dimensions ? `"${p.dimensions.replace(/"/g, '""')}"` : '',
      p.compatibility ? `"${p.compatibility.replace(/"/g, '""')}"` : '',
    ].join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `catalogo_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportToPDF(products: Product[]) {
  try {
    showToastSuccess('Generando PDF con imágenes...');

    const logoBase64 = await imageUrlToBase64('/extreme_png.png');

    const productsWithImages = await Promise.all(
      products.map(async (p) => ({
        ...p,
        base64Image: p.image_url ? await imageUrlToBase64(p.image_url) : null,
      }))
    );

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      showToastError('Por favor, permite ventanas emergentes para exportar a PDF');
      return;
    }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Catálogo - EXTREME PERFORMANCE</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 30px;
            background: #0a0a0a;
            color: #e5e5e5;
          }

          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #39ff14;
          }

          .logo {
            max-width: 250px;
            height: auto;
            margin: 0 auto 20px;
            display: block;
          }

          h1 {
            color: #39ff14;
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .date {
            color: #9ca3af;
            font-size: 14px;
            margin-bottom: 10px;
          }

          .total-products {
            color: #d1d5db;
            font-size: 16px;
            font-weight: 600;
          }

          .products-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 25px;
            margin-top: 30px;
          }

          .product-card {
            border: 2px solid #39ff14;
            border-radius: 12px;
            padding: 20px;
            background: #1a1a1a;
            page-break-inside: avoid;
            transition: all 0.3s ease;
          }

          .product-header {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
          }

          .product-image {
            width: 120px;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #39ff14;
            flex-shrink: 0;
            background: #0a0a0a;
          }

          .product-info {
            flex: 1;
            min-width: 0;
          }

          .product-name {
            font-size: 16px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 8px;
            line-height: 1.3;
          }

          .product-meta {
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-size: 12px;
            margin-bottom: 8px;
          }

          .meta-item {
            color: #9ca3af;
          }

          .meta-label {
            font-weight: 600;
            color: #d1d5db;
          }

          .product-price {
            font-size: 20px;
            font-weight: 700;
            color: #39ff14;
            margin-top: 8px;
          }

          .product-description {
            font-size: 12px;
            color: #9ca3af;
            line-height: 1.5;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #39ff14;
          }

          .product-specs {
            display: flex;
            gap: 15px;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #39ff14;
            flex-wrap: wrap;
          }

          .spec-item {
            font-size: 11px;
            background: #39ff14;
            padding: 4px 10px;
            border-radius: 6px;
            color: #000000;
            font-weight: 600;
          }

          .stock-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            margin-top: 8px;
          }

          .stock-available {
            background: #39ff14;
            color: #000000;
          }

          .stock-low {
            background: #fbbf24;
            color: #000000;
          }

          .stock-out {
            background: #ef4444;
            color: #ffffff;
          }

          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #39ff14;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }

          @media print {
            body {
              padding: 20px;
            }

            .product-card {
              break-inside: avoid;
            }

            .products-grid {
              gap: 20px;
            }

            @page {
              margin: 1.5cm;
              size: A4;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoBase64}" alt="EXTREME PERFORMANCE" class="logo" />
          <h1>Catálogo de Productos</h1>
          <p class="date">Generado el ${new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p class="total-products">${products.length} productos en total</p>
        </div>

        <div class="products-grid">
          ${productsWithImages.map(p => `
            <div class="product-card">
              <div class="product-header">
                <img
                  src="${p.base64Image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22120%22 height=%22120%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%239ca3af%22 font-size=%2214%22%3ESin imagen%3C/text%3E%3C/svg%3E'}"
                  alt="${p.name}"
                  class="product-image"
                />
                <div class="product-info">
                  <h2 class="product-name">${p.name}</h2>
                  <div class="product-meta">
                    ${p.sku ? `<div class="meta-item"><span class="meta-label">SKU:</span> ${p.sku}</div>` : ''}
                    ${p.brand ? `<div class="meta-item"><span class="meta-label">Marca:</span> ${p.brand}</div>` : ''}
                    <div class="meta-item"><span class="meta-label">Categoría:</span> ${p.category}</div>
                  </div>
                  <div class="product-price">${formatPrice(p.price)}</div>
                  <span class="stock-badge ${p.stock === 0 ? 'stock-out' : p.stock < 5 ? 'stock-low' : 'stock-available'}">
                    ${p.stock === 0 ? 'Sin stock' : p.stock < 5 ? `Stock bajo (${p.stock})` : `En stock (${p.stock})`}
                  </span>
                </div>
              </div>
              ${p.description ? `<p class="product-description">${p.description}</p>` : ''}
              ${p.dimensions || p.compatibility ? `
                <div class="product-specs">
                  ${p.dimensions ? `<div class="spec-item">📏 ${p.dimensions}</div>` : ''}
                  ${p.compatibility ? `<div class="spec-item">🔧 ${p.compatibility}</div>` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div class="footer">
          <p>Catálogo generado automáticamente • EXTREME PERFORMANCE</p>
          <p>Todos los precios y disponibilidad están sujetos a cambios sin previo aviso</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    showToastError('Error al generar el PDF');
  }
}
