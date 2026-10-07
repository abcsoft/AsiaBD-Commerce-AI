/**
 * Demo / sample products used across the app:
 * - one-click "try a sample" in tool forms
 * - the interactive generator preview on the landing page
 * - demo-mode generation output
 */

export interface SampleProduct {
  id: string;
  label: string;
  name: string;
  category: string;
  features: string;
  targetCustomer: string;
  keywords: string;
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 'shoes',
    label: 'Shoes',
    name: 'AeroStride Everyday Running Shoes',
    category: "Men's athletic footwear",
    features:
      'Breathable knit upper, memory-foam insole, anti-slip rubber outsole, lightweight 260g design',
    targetCustomer:
      'Runners, gym-goers, and commuters who want comfortable shoes for daily wear',
    keywords: 'running shoes, lightweight sneakers, breathable athletic shoes',
  },
  {
    id: 'skincare',
    label: 'Skincare',
    name: 'GlowDrop Vitamin C Serum',
    category: 'Facial serums & treatments',
    features:
      '15% vitamin C, hyaluronic acid, fragrance-free formula, 30ml amber bottle, suitable for daily use',
    targetCustomer:
      'Skincare enthusiasts aged 20-40 dealing with dull or uneven skin tone',
    keywords: 'vitamin c serum, brightening serum, hydrating face serum',
  },
  {
    id: 'electronics',
    label: 'Electronics',
    name: 'PulseBeat Wireless Earbuds',
    category: 'Consumer audio & accessories',
    features:
      'Bluetooth 5.3, 32-hour battery with charging case, IPX5 water resistance, ENC dual-mic calls',
    targetCustomer:
      'Students and commuters who want reliable wireless audio at a fair price',
    keywords: 'wireless earbuds, bluetooth earphones, dual-mic earbuds',
  },
  {
    id: 'home-decor',
    label: 'Home decor',
    name: 'TerraNest Ceramic Vase Set',
    category: 'Home decoration & living',
    features:
      'Set of 3 matte-glazed ceramic vases, heights 8/6/4 inch, neutral earth tones, watertight',
    targetCustomer:
      'Home decor shoppers styling modern living rooms and shelves',
    keywords: 'ceramic vase set, modern home decor, minimalist vases',
  },
];

export function getSampleProduct(id: string | null | undefined) {
  return SAMPLE_PRODUCTS.find((p) => p.id === id) ?? null;
}
