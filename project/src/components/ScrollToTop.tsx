import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          aria-label="Volver arriba"
          className="
            fixed bottom-8 left-8 z-40
            p-4 rounded-full
            bg-gradient-to-r from-green-600 to-emerald-600
            hover:from-green-700 hover:to-emerald-700
            text-white
            shadow-lg hover:shadow-2xl
            transition-all duration-300
            group
            animate-bounce-subtle
          "
        >
          <ArrowUp
            size={24}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        </button>
      )}
    </>
  );
}
