export interface Tenant {
  id: number;
  name: string;
  slug: string;
  plan?: string;
  tagline?: string;
  // Backend returns `phone` and `email`
  phone?: string;
  email?: string;
  // Aliases for backwards compat in components
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  city?: string;
  country?: string;
  business_hours?: string;
  business_hours_start?: string;
  business_hours_end?: string;
  business_days?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_primary: string;
  text_secondary: string;
  nav_background: string;
  footer_background: string;
  border_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  dark_primary: string;
  dark_background: string;
  dark_surface: string;
  dark_text: string;
  dark_nav: string;
  font_family_heading: string;
  font_family_body: string;
  font_size_base: string;
  font_weight_heading: string;
  border_radius_base: string;
  nav_style: string;
  dark_mode_enabled: boolean;
  custom_css?: string;
  logo?: string;
  logo_url?: string;
  favicon?: string;
  favicon_url?: string;
  css_vars: Record<string, string>;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  is_verified: boolean;
  role?: string;
}

export interface Property {
  id: number;
  reference_id: string;
  title: string;
  slug: string;
  description: string;
  property_type: string;
  property_type_display: string;
  listing_type: string;
  status: string;
  status_display: string;
  price: string;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  area_sqm?: number;
  parking_spaces: number;
  address: string;
  city: string;
  area?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  features: string[];
  is_featured: boolean;
  virtual_tour_url?: string;
  views_count: number;
  inquiry_count: number;
  images: PropertyImage[];
  primary_image?: string;
  assigned_agent?: AgentSummary;
  created_at: string;
}

export interface PropertyImage {
  id: number;
  image: string;
  caption?: string;
  is_primary: boolean;
  order: number;
}

export interface AgentSummary {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: object;
  featured_image?: string;
  author: AgentSummary;
  category?: Category;
  tags: Tag[];
  is_featured: boolean;
  is_published: boolean;
  views_count: number;
  read_time_minutes: number;
  published_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface TeamMember {
  id: number;
  name: string;
  title: string;
  bio?: string;
  specialties: string[];
  years_experience?: number;
  photo_url?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  order: number;
  is_featured: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  title?: string;
  quote: string;
  rating: number;
  photo_url?: string;
  location?: string;
  is_featured: boolean;
  order: number;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  property?: number;
  source: string;
  status: string;
  priority: string;
  assigned_agent?: AgentSummary;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}
