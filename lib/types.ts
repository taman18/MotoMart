export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type OrderStatus = "pending" | "confirmed" | "dispatched" | "delivered" | "cancelled";
export type Category =
  | "Brakes"
  | "Engine Parts"
  | "Electrical"
  | "Filters"
  | "Body Parts"
  | "Tyres & Tubes"
  | "Oils & Lubricants";

export type BikeBrand =
  | "Honda"
  | "Hero"
  | "Bajaj"
  | "TVS"
  | "Yamaha"
  | "Suzuki"
  | "Royal Enfield"
  | "Universal";

export interface Part {
  id: string;
  name: string;
  sku: string;
  category: Category;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  minStock: number;
  images: string[];
  compatibleBikes: string[];
  brand: BikeBrand;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isSale: boolean;
}

export interface CartItem {
  part: Part;
  quantity: number;
}

export interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  pincode: string;
  city: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}
