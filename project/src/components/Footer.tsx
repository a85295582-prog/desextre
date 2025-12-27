import { useEffect, useState } from 'react';
import { Phone, Globe, Lock, Store, Mail, MapPin, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FooterProps {
  onAdminClick?: () => void;
  showAdminButton?: boolean;
  isAdminView?: boolean;
}

interface FooterData {
  company_name: string;
  company_description: string;
  address: string;
  phone: string;
  email: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  whatsapp_number: string;
  copyright_text: string;
}

export function Footer({ onAdminClick, showAdminButton = false, isAdminView = false }: FooterProps) {
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  useEffect(() => {
    fetchFooterData();
  }, []);

  async function fetchFooterData() {
    try {
      const { data, error } = await supabase
        .from('footer_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setFooterData(data);
      }
    } catch (error) {
      console.error('Error fetching footer data:', error);
    }
  }
  const hasCustomData = footerData && (
    footerData.company_name ||
    footerData.phone ||
    footerData.email ||
    footerData.address ||
    footerData.facebook_url ||
    footerData.instagram_url ||
    footerData.twitter_url ||
    footerData.whatsapp_number
  );

  return (
    <footer className="bg-extreme-black-200 text-white mt-auto relative border-t border-extreme-green-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasCustomData && footerData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {footerData.company_name && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-extreme-green-500">{footerData.company_name}</h3>
                {footerData.company_description && (
                  <p className="text-gray-400 text-sm mb-4">{footerData.company_description}</p>
                )}
                {(footerData.facebook_url || footerData.instagram_url || footerData.twitter_url || footerData.whatsapp_number) && (
                  <div className="flex gap-3">
                    {footerData.facebook_url && (
                      <a
                        href={footerData.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-extreme-green-500 transition-colors"
                      >
                        <Facebook size={20} />
                      </a>
                    )}
                    {footerData.instagram_url && (
                      <a
                        href={footerData.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-extreme-green-500 transition-colors"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {footerData.twitter_url && (
                      <a
                        href={footerData.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-extreme-green-500 transition-colors"
                      >
                        <Twitter size={20} />
                      </a>
                    )}
                    {footerData.whatsapp_number && (
                      <a
                        href={`https://wa.me/${footerData.whatsapp_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-extreme-green-500 transition-colors"
                      >
                        <MessageCircle size={20} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold mb-4 text-extreme-green-500">Contacto</h3>
              <div className="space-y-3 text-sm">
                {footerData.phone && (
                  <a
                    href={`tel:${footerData.phone}`}
                    className="flex items-center gap-2 text-gray-400 hover:text-extreme-green-500 transition-colors"
                  >
                    <Phone size={18} />
                    <span>{footerData.phone}</span>
                  </a>
                )}
                {footerData.email && (
                  <a
                    href={`mailto:${footerData.email}`}
                    className="flex items-center gap-2 text-gray-400 hover:text-extreme-green-500 transition-colors"
                  >
                    <Mail size={18} />
                    <span>{footerData.email}</span>
                  </a>
                )}
                {footerData.address && (
                  <div className="flex items-start gap-2 text-gray-400">
                    <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                    <span>{footerData.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-extreme-green-500/20">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Creado por CRISMAR</span>
              <img
                src="/cm_negro.png"
                alt="CRISMAR"
                className="h-8 w-auto brightness-0 invert"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm">
            <a
              href="tel:+595985515652"
              className="flex items-center gap-2 text-gray-300 hover:text-extreme-green-500 transition-colors"
            >
              <Phone size={18} />
              <span>+595 985 515 652</span>
            </a>
            <a
              href="https://crismar.com.py"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-extreme-green-500 transition-colors"
            >
              <Globe size={18} />
              <span>crismar.com.py</span>
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>{footerData?.copyright_text || `© ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.`}</p>
        </div>
      </div>

      {showAdminButton && onAdminClick && (
        <button
          onClick={onAdminClick}
          className="absolute bottom-4 right-4 text-gray-500 hover:text-gray-400 text-xs transition-colors z-50"
        >
          {isAdminView ? 'Tienda' : 'Admin'}
        </button>
      )}
    </footer>
  );
}
