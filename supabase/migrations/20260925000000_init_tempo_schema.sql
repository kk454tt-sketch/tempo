-- ====================================================================
-- TEMPO DATABASE SCHEMA & ROW LEVEL SECURITY MIGRATION
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  preview_image TEXT,
  badge TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. EVENT WEBSITES TABLE
CREATE TABLE IF NOT EXISTS public.event_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES public.templates(id),
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'expired', 'archived')),
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_lifetime BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMPTZ
);

-- 4. RSVPS TABLE
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES public.event_websites(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  attendance TEXT NOT NULL DEFAULT 'accept' CHECK (attendance IN ('accept', 'decline')),
  meal_preference TEXT,
  dietary_notes TEXT,
  song_request TEXT,
  plus_ones INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_event_websites_user_id ON public.event_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_event_websites_slug ON public.event_websites(slug);
CREATE INDEX IF NOT EXISTS idx_event_websites_status ON public.event_websites(status);
CREATE INDEX IF NOT EXISTS idx_rsvps_website_id ON public.rsvps(website_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Templates Policies (Public read for active templates)
CREATE POLICY "Public can view active templates"
  ON public.templates FOR SELECT
  USING (is_active = true);

-- Event Websites Policies
-- 1. SELECT: Owner can view all their websites (draft/published); Public can ONLY view published websites.
CREATE POLICY "Owners can view all their websites or anyone can view published websites"
  ON public.event_websites FOR SELECT
  USING (
    auth.uid() = user_id
    OR status = 'published'
  );

-- 2. INSERT: Authenticated users can create websites for themselves only.
CREATE POLICY "Users can create their own websites"
  ON public.event_websites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE: Users can update their own websites only.
CREATE POLICY "Users can update their own websites"
  ON public.event_websites FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. DELETE: Users can delete their own websites only.
CREATE POLICY "Users can delete their own websites"
  ON public.event_websites FOR DELETE
  USING (auth.uid() = user_id);

-- RSVPs Policies
-- 1. INSERT: Guests can submit RSVPs to published websites
CREATE POLICY "Anyone can submit RSVP to a published website"
  ON public.rsvps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.event_websites
      WHERE public.event_websites.id = rsvps.website_id
      AND public.event_websites.status = 'published'
    )
  );

-- 2. SELECT: Only the website owner can view RSVPs for their websites
CREATE POLICY "Website owners can view RSVPs for their websites"
  ON public.rsvps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.event_websites
      WHERE public.event_websites.id = rsvps.website_id
      AND public.event_websites.user_id = auth.uid()
    )
  );

-- ====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- SEED INITIAL TEMPLATES
-- ====================================================================

INSERT INTO public.templates (id, name, category, description, preview_image, badge, is_active)
VALUES
  (
    'wedding-01',
    'Timeless',
    'wedding',
    'Minimalist typography meets full-bleed candid photography. Perfect for modern couples.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDrXhj_85XcFOKhkG4qY7qNgs75JdniIqqg054JAtSrKnln4teC7WRqqkzY48kGBbruY_4_cUhIArt9PE7A-kerr7mTPbUseCy9pU_VKItPqaxSXkZcMvMRZTXBNMSs9qHUm03eKWeoq-PYbeLR6r4ytLMvrK2knfksVMuwfAmphOJlY65goBMpd0GGc71snh-0EgvcSsqPoAeDE35RBSBUzN2LG7CkRU5WHzXAmu0inpXr1MuQdUTffA',
    'Save the Date · RSVP',
    true
  ),
  (
    'birthday-01',
    'Emma''s 25th',
    'birthday',
    'Vibrant, social celebration page with guest RSVP, photo dropzone, and venue map.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAuxVFfqJZlMyHEYGEJrEOx56kqF4pi-hChJHaV3Zxxi1h2KhXofNbMnt04LPd82qCHPTyU6snUwv2S7WLty4lwO20ZpH8myV67VKNSnoiyAWxa40_9ENHnQnHnggYbi_hPloEhzGFiG4lqKd2xKsFA9MR7YTeLy6rfd1z9Ae9Ip3agpGdR0zXO_SsHSaXzyFo-rEczPnhc9P-MlnPGBEDV8bjyWV8Y3wrkXZLGcFu002ngCg5EKqepyg',
    'Let''s celebrate together',
    true
  ),
  (
    'opening-01',
    'The Coffee House',
    'opening',
    'Handcrafted story page, menu teaser, and launch invitation for boutique business milestones.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCEzE92AaCFKTI-e_Mliy5h_SNTyTviGF5R2lEJqBC0jd-eVV_bpYVdhaPdOvxaJyRw_wixRCvgyQos3ZY0GwtzjmbLzuI1oCmbPpLMrYXrsu-J33NjeUGlfMff0Xr0S6Pk5_fxYhdLNZxhFUCBl6Z8dJ9BLEk9go_487lT8_BRf0oCAlzdcbPk_3tvCc1Xul0P1JuOdAwq5yr6YdNdDyrIfFI63C12L8HDPAYfblH2tqaaCD6nI1zptQ',
    'Grand Opening Event',
    true
  ),
  (
    'party-01',
    'Evening With Friends',
    'party',
    'Warm, candlelit invitation with menu preview, BYOB guidelines, and curated playlist link.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBw0PLAY1Q56NO4RJlZjSOP-IRzbuBCOxRNgu0MTd1kic_aEHTz9BQjQH3lMJsIPkyd0n11lMIzf9f06-xyZGz7ZsRfPwW_LuylJcDI0WrLBNlbozD-sieBWUAE67YTjjkIlzVS--ZSe_nIRsVndWdiAYMu_9i0vOkbd3enG4r_JgGXWighkJlg9iKm-z_ggl9JnXUi1mwkS9pTbQaP02qXu_ZMf0BOokzHQMG7vRQALwUDp378-D-VJA',
    'Intimate Gathering',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  preview_image = EXCLUDED.preview_image,
  badge = EXCLUDED.badge,
  is_active = EXCLUDED.is_active;
