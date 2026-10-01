-- Birthday guestbook entries and creator media belong in Supabase.
ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES public.event_websites(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL CHECK (char_length(guest_name) BETWEEN 1 AND 120),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guestbook_entries_website_created
  ON public.guestbook_entries (website_id, created_at DESC);

ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests can read entries on published sites"
  ON public.guestbook_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.event_websites w
    WHERE w.id = website_id AND w.status = 'published'
  ));

CREATE POLICY "Guests can post to published sites"
  ON public.guestbook_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.event_websites w
    WHERE w.id = website_id AND w.status = 'published'
  ));

CREATE POLICY "Owners can remove guestbook entries"
  ON public.guestbook_entries FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.event_websites w
    WHERE w.id = website_id AND w.user_id = auth.uid()
  ));

CREATE OR REPLACE FUNCTION public.cast_portal_superlative_vote(p_slug TEXT, p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  updated_votes JSONB;
BEGIN
  IF length(p_key) = 0 OR length(p_key) > 100 THEN
    RAISE EXCEPTION 'Invalid vote key';
  END IF;
  INSERT INTO public.portal_hubs (slug, superlative_votes)
  VALUES (lower(trim(p_slug)), jsonb_build_object(p_key, 1))
  ON CONFLICT (slug) DO UPDATE
    SET superlative_votes = jsonb_set(
      COALESCE(public.portal_hubs.superlative_votes, '{}'::jsonb),
      ARRAY[p_key],
      to_jsonb(COALESCE((public.portal_hubs.superlative_votes->>p_key)::INTEGER, 0) + 1),
      true
    ), updated_at = now()
  RETURNING superlative_votes INTO updated_votes;
  RETURN updated_votes;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cast_portal_superlative_vote(TEXT, TEXT) TO anon, authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tempo-event-media', 'tempo-event-media', true, 10485760,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760;

CREATE POLICY "Anyone can read event media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tempo-event-media');

CREATE POLICY "Authenticated users can upload event media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tempo-event-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can delete their event media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'tempo-event-media' AND (storage.foldername(name))[1] = auth.uid()::text);
