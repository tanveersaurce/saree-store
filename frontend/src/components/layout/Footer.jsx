import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Twitter, MapPin, Phone, Mail, Heart } from 'lucide-react';

const footerLinks = {
  shop: [
    { name: 'New Arrivals', href: '/collections?filter=new' },
    { name: 'Best Sellers', href: '/collections?filter=bestseller' },
    { name: 'Bridal Collection', href: '/collections/bridal-sarees' },
    { name: 'Sale', href: '/sale' },
    { name: 'All Collections', href: '/collections' },
  ],
  help: [
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Care Instructions', href: '/care' },
    { name: 'Shipping Policy', href: '/shipping' },
    { name: 'Return & Refund', href: '/returns' },
    { name: 'Track Order', href: '/orders' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Weavers', href: '/weavers' },
    { name: 'Sustainability', href: '/sustainability' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact Us', href: '/contact' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-500' },
  { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-500' },
  { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-500' },
  { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-sky-400' },
];

export default function Footer() {
  return (
    <footer className="bg-saree-charcoal text-white mt-auto">
      {/* Newsletter */}
      <div className="bg-gradient-to-r from-saree-rose to-saree-crimson">
        <div className="page-container py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-1">Stay in the Loop 🌸</h3>
              <p className="text-white/80 text-sm">Get exclusive offers, new arrivals & styling tips right in your inbox.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 md:w-64 px-4 py-3 bg-white/20 border border-white/30 rounded-full text-white placeholder-white/60 text-sm outline-none focus:bg-white/30 transition-colors"
              />
              <button type="submit" className="px-5 py-3 bg-white text-saree-rose font-semibold rounded-full text-sm hover:bg-saree-blush transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="page-container py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex flex-col mb-4">
              <span className="font-display text-3xl font-bold text-saree-crimson">Saanvi</span>
              <span className="font-accent text-xs text-saree-gold tracking-[0.4em] uppercase -mt-1">Sarees</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Celebrating the timeless beauty of Indian handloom. Every saree tells a story — of craft, culture, and the women who wear them.
            </p>
            {/* Social */}
            <div className="flex gap-3 mb-6">
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 transition-all duration-200 ${color} hover:bg-white/20`}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            {/* Contact */}
            <div className="space-y-2.5">
              <a href="mailto:hello@sareesaanvi.com" className="flex items-center gap-2.5 text-gray-400 text-sm hover:text-saree-crimson transition-colors">
                <Mail size={14} className="text-saree-rose/60" /> hello@sareesaanvi.com
              </a>
              <a href="tel:+911800001234" className="flex items-center gap-2.5 text-gray-400 text-sm hover:text-saree-crimson transition-colors">
                <Phone size={14} className="text-saree-rose/60" /> +91 1800 001 234 (Toll Free)
              </a>
              <span className="flex items-center gap-2.5 text-gray-400 text-sm">
                <MapPin size={14} className="text-saree-rose/60" /> Kanchipuram, Tamil Nadu, India
              </span>
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Shop', links: footerLinks.shop },
            { title: 'Help & Info', links: footerLinks.help },
            { title: 'Company', links: footerLinks.company },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-gray-400 text-sm hover:text-saree-crimson transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} SareeSaanvi. All rights reserved. Made with{' '}
              <Heart size={10} className="inline text-saree-rose" fill="currentColor" /> in India.
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {['Visa', 'Mastercard', 'UPI', 'Razorpay', 'Net Banking'].map((method) => (
                <span key={method} className="px-2.5 py-1 bg-white/10 rounded text-gray-400 text-xs">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
