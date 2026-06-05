import React, { useState } from 'react';
import { X } from 'lucide-react';

const messages = [
  '🌸 Free shipping on orders above ₹999',
  '✨ New Kanjivaram collection just arrived!',
  '🎁 Use code SAANVI10 for 10% off your first order',
  '💎 Authentic handloom sarees from India\'s finest weavers',
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-saree-charcoal via-saree-rose to-saree-crimson text-white text-xs sm:text-sm py-2 relative overflow-hidden">
      <div className="flex overflow-hidden">
        <div className="marquee-track gap-12">
          {[...messages, ...messages].map((msg, i) => (
            <span key={i} className="flex items-center gap-12 px-6 whitespace-nowrap font-medium tracking-wide">
              {msg}
              <span className="text-white/40">✦</span>
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
