-- ====================================================================
-- ENROLLDESK TEMPLATE & PORTAL HUBS REALTIME DATABASE TABLE
-- ====================================================================

-- 1. Insert EnrollDesk Pro Interactive template into public.templates
INSERT INTO public.templates (id, name, category, description, preview_image, badge, is_active)
VALUES (
  'enrolldesk-01',
  'EnrollDesk',
  'student',
  'Dynamic student cohort & classmate hub with search, hobby matching, notices board, custom forms, and memory wall.',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
  'Pro Interactive · Full Functions',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  preview_image = EXCLUDED.preview_image,
  badge = EXCLUDED.badge,
  is_active = EXCLUDED.is_active;

-- 2. PORTAL HUBS TABLE (Database storage for classmates, notices, shoutouts, polls)
CREATE TABLE IF NOT EXISTS public.portal_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  website_id UUID REFERENCES public.event_websites(id) ON DELETE CASCADE,
  hub_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  superlative_votes JSONB NOT NULL DEFAULT '{}'::jsonb,
  study_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_portal_hubs_slug ON public.portal_hubs(slug);
CREATE INDEX IF NOT EXISTS idx_portal_hubs_website_id ON public.portal_hubs(website_id);

-- Enable RLS
ALTER TABLE public.portal_hubs ENABLE ROW LEVEL SECURITY;

-- Everyone can view portal hub data for published student hubs
CREATE POLICY "Public can view portal hub data"
  ON public.portal_hubs FOR SELECT
  USING (true);

-- Anyone can insert or update portal hub data (for classmate registration, voting, memories)
CREATE POLICY "Anyone can insert portal hubs"
  ON public.portal_hubs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update portal hubs"
  ON public.portal_hubs FOR UPDATE
  USING (true)
  WITH CHECK (true);
