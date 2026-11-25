/**
 * Hand-written to match supabase/migrations/0001_init.sql and 0002_analytics.sql.
 * Replace it with the real generated file at any time: npm run types
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      events: {
        Row: {
          campaign: string | null;
          content: string | null;
          created_at: string;
          device: string | null;
          id: number;
          product_id: string;
          session_id: string | null;
          source: string | null;
          store_country: string | null;
          term: string | null;
          type: string;
          visitor_country: string;
        };
        Insert: {
          campaign?: string | null;
          content?: string | null;
          created_at?: string;
          device?: string | null;
          id?: never;
          product_id: string;
          session_id?: string | null;
          source?: string | null;
          store_country?: string | null;
          term?: string | null;
          type: string;
          visitor_country?: string;
        };
        Update: {
          campaign?: string | null;
          content?: string | null;
          created_at?: string;
          device?: string | null;
          id?: never;
          product_id?: string;
          session_id?: string | null;
          source?: string | null;
          store_country?: string | null;
          term?: string | null;
          type?: string;
          visitor_country?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_links: {
        Row: {
          country_code: string;
          currency: string;
          id: string;
          in_stock: boolean;
          price: number | null;
          product_id: string;
          updated_at: string;
          url: string;
        };
        Insert: {
          country_code: string;
          currency: string;
          id?: string;
          in_stock?: boolean;
          price?: number | null;
          product_id: string;
          updated_at?: string;
          url: string;
        };
        Update: {
          country_code?: string;
          currency?: string;
          id?: string;
          in_stock?: boolean;
          price?: number | null;
          product_id?: string;
          updated_at?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_links_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category_id: string | null;
          created_at: string;
          description: string | null;
          gallery_urls: string[];
          id: string;
          image_url: string | null;
          is_featured: boolean;
          is_published: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          gallery_urls?: string[];
          id?: string;
          image_url?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          gallery_urls?: string[];
          id?: string;
          image_url?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      store_settings: {
        Row: {
          affiliate_tag: string | null;
          country_code: string;
          updated_at: string;
        };
        Insert: {
          affiliate_tag?: string | null;
          country_code: string;
          updated_at?: string;
        };
        Update: {
          affiliate_tag?: string | null;
          country_code?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      analytics_campaign_countries: {
        Args: { days?: number; p_campaign: string; tz?: string };
        Returns: { clicks: number; country: string; views: number }[];
      };
      analytics_campaigns: {
        Args: { days?: number; tz?: string };
        Returns: {
          campaign: string;
          click_rate: number;
          clicks: number;
          content: string | null;
          top_country: string | null;
          views: number;
        }[];
      };
      analytics_devices: {
        Args: { days?: number; p_product?: string; tz?: string };
        Returns: { clicks: number; device: string; views: number }[];
      };
      analytics_sources: {
        Args: { days?: number; p_product?: string; tz?: string };
        Returns: { clicks: number; source_label: string; views: number }[];
      };
      analytics_summary: {
        Args: { days?: number; p_product?: string; tz?: string };
        Returns: {
          out_of_stock_products: number;
          top_country: string;
          total_clicks: number;
          total_views: number;
        }[];
      };
      analytics_window_start: {
        Args: { days: number; tz?: string };
        Returns: string;
      };
      clicks_by_country: {
        Args: { days?: number; p_product?: string; tz?: string };
        Returns: { clicks: number; visitor_country: string }[];
      };
      clicks_over_time: {
        Args: { days?: number; p_product?: string; tz?: string };
        Returns: { clicks: number; day: string; views: number }[];
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      product_analytics: {
        Args: { days?: number; product_id: string; tz?: string };
        Returns: {
          clicks: number;
          has_link: boolean;
          in_stock: boolean;
          link_store: string;
          views: number;
          visitor_country: string;
        }[];
      };
      reorder_categories: {
        Args: { p_ids: string[] };
        Returns: undefined;
      };
      top_products: {
        Args: { days?: number; lim?: number; tz?: string };
        Returns: {
          clicks: number;
          name: string;
          product_id: string;
          stock_status: string;
          top_country: string;
          views: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
