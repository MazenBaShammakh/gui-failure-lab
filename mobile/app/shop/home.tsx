import AppHub from '@/components/nav/AppHub';

export default function ShopHome() {
  return (
    <AppHub
      title="Shop"
      tint="#2e7d32"
      items={[
        { label: 'Store', sublabel: 'Browse products & filter by price', emoji: '🛍️', href: '/shop' },
        { label: 'Flash deal', sublabel: 'Aurora Desk Lamp', emoji: '⚡', href: '/shop/deal' },
        { label: 'Listing', sublabel: 'Products & sale items', emoji: '🏷️', href: '/shop/listing' },
        { label: 'Featured product', sublabel: 'Air Max Pulse', emoji: '👟', href: '/shop/featured' },
        { label: 'Product details', sublabel: 'Item detail page', emoji: '📄', href: '/shop/details' },
        { label: 'Photo gallery', sublabel: 'Product images', emoji: '🖼️', href: '/shop/gallery' },
        { label: 'Quantity', sublabel: 'Adjust how many to buy', emoji: '🔢', href: '/shop/quantity' },
        { label: 'Choose colour', sublabel: 'Pick a colour variant', emoji: '🎨', href: '/shop/color' },
        { label: 'Browse categories', sublabel: 'Deals, New, Popular', emoji: '🧭', href: '/shop/browse' },
        { label: 'Cart', sublabel: 'Items in your cart', emoji: '🛒', href: '/shop/cart' },
        { label: 'Write a review', sublabel: 'Rate this product', emoji: '⭐', href: '/shop/review' },
        { label: 'Checkout', sublabel: 'Place your order', emoji: '💳', href: '/shop/checkout' },
        { label: 'Onboarding', sublabel: 'Intro carousel', emoji: '👋', href: '/shop/onboarding' },
        { label: 'Track Order', sublabel: 'Check delivery status', emoji: '📦', href: '/shop/track' },
        { label: 'Recommended', sublabel: 'Products picked for you', emoji: '✨', href: '/shop/recommended' },
      ]}
    />
  );
}
