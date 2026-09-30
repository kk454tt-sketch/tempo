-- Persistent UPI checkout storage. Payment records never live in browser storage or SQLite.
CREATE TABLE IF NOT EXISTS public.payment_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  amount_paise INTEGER CHECK (amount_paise IS NULL OR amount_paise > 0),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  active BOOLEAN NOT NULL DEFAULT false,
  entitlement TEXT NOT NULL CHECK (entitlement IN ('pro_interactive', 'lifetime_website')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (NOT active OR amount_paise IS NOT NULL)
);

INSERT INTO public.payment_products (id,name,description,amount_paise,currency,active,entitlement)
VALUES ('pro-interactive','Pro Interactive','Unlock the Pro Interactive features for one selected website.',49900,'INR',true,'pro_interactive')
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,amount_paise=EXCLUDED.amount_paise,currency=EXCLUDED.currency,active=true,entitlement=EXCLUDED.entitlement,updated_at=now();

ALTER TABLE public.event_websites ADD COLUMN IF NOT EXISTS pro_interactive_enabled BOOLEAN NOT NULL DEFAULT false;
-- Preserve access for existing published EnrollDesk sites; newly created sites require a paid order.
UPDATE public.event_websites SET pro_interactive_enabled=true WHERE template_id='enrolldesk-01' AND status='published';

CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  website_id UUID NOT NULL REFERENCES public.event_websites(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.payment_products(id),
  product_name TEXT NOT NULL,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING','VERIFYING','PAID','FAILED','EXPIRED','MANUAL_REVIEW')),
  product_status TEXT NOT NULL DEFAULT 'LOCKED' CHECK (product_status IN ('LOCKED','APPROVED','DELIVERED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_owner ON public.payment_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_orders_inbox ON public.payment_orders(payment_status, expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_orders_website ON public.payment_orders(website_id, product_id);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.payment_orders(id),
  transaction_reference TEXT NOT NULL UNIQUE,
  amount_paise INTEGER NOT NULL,
  payment_time TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'gmail',
  verification_status TEXT NOT NULL CHECK (verification_status IN ('VERIFIED','REJECTED','DUPLICATE','MANUAL_REVIEW')),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.processed_payment_notifications (
  gmail_message_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  transaction_reference TEXT,
  amount_paise INTEGER,
  order_id UUID REFERENCES public.payment_orders(id),
  outcome TEXT NOT NULL CHECK (outcome IN ('VERIFIED','REVIEW','DUPLICATE','UNKNOWN','IGNORED'))
);

CREATE TABLE IF NOT EXISTS public.payment_manual_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.payment_orders(id),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL CHECK (length(trim(reason)) BETWEEN 5 AND 500),
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_notification_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.payment_orders(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('customer','admin')),
  delivery_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (delivery_status IN ('PENDING','SENT')),
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  UNIQUE(order_id,recipient_type)
);

CREATE TABLE IF NOT EXISTS public.payment_scan_lock (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  locked_until TIMESTAMPTZ NOT NULL DEFAULT '-infinity',
  gmail_next_page_token TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.payment_scan_lock (id,locked_until) VALUES (true,'-infinity') ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.payment_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_payment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_manual_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_notification_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_scan_lock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active checkout products are visible" ON public.payment_products;
CREATE POLICY "Active checkout products are visible" ON public.payment_products FOR SELECT TO authenticated USING (active = true AND amount_paise IS NOT NULL);
DROP POLICY IF EXISTS "Owners can read their own orders" ON public.payment_orders;
CREATE POLICY "Owners can read their own orders" ON public.payment_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- There are intentionally no client write/read policies for internal payment metadata,
-- processed Gmail messages, manual audit rows, or the scanner lock. Server code uses service role.
REVOKE ALL ON public.payment_transactions, public.processed_payment_notifications, public.payment_manual_approvals, public.payment_notification_outbox, public.payment_scan_lock FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.payment_products, public.payment_orders FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.verify_upi_payment(
  p_gmail_message_id TEXT,
  p_order_id TEXT,
  p_transaction_reference TEXT,
  p_amount_paise INTEGER,
  p_payment_time TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(outcome TEXT, order_uuid UUID, customer_email TEXT, product_name TEXT, amount_paise INTEGER, public_order_id TEXT, owner_id UUID, website_uuid UUID)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  target public.payment_orders%ROWTYPE;
  duplicate_found BOOLEAN;
  result TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM public.processed_payment_notifications WHERE gmail_message_id = p_gmail_message_id) THEN
    RETURN QUERY SELECT 'IGNORED'::TEXT,NULL::UUID,NULL::TEXT,NULL::TEXT,NULL::INTEGER,NULL::TEXT,NULL::UUID,NULL::UUID;
    RETURN;
  END IF;

  SELECT * INTO target FROM public.payment_orders WHERE payment_orders.order_id = upper(p_order_id) FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.processed_payment_notifications(gmail_message_id,transaction_reference,amount_paise,outcome)
    VALUES (p_gmail_message_id,p_transaction_reference,p_amount_paise,'UNKNOWN') ON CONFLICT DO NOTHING;
    RETURN QUERY SELECT 'UNKNOWN'::TEXT,NULL::UUID,NULL::TEXT,NULL::TEXT,p_amount_paise::INTEGER,NULL::TEXT,NULL::UUID,NULL::UUID;
    RETURN;
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.payment_transactions WHERE transaction_reference = p_transaction_reference) INTO duplicate_found;
  IF duplicate_found THEN
    INSERT INTO public.processed_payment_notifications(gmail_message_id,transaction_reference,amount_paise,order_id,outcome)
    VALUES (p_gmail_message_id,p_transaction_reference,p_amount_paise,target.id,'DUPLICATE') ON CONFLICT DO NOTHING;
    RETURN QUERY SELECT 'DUPLICATE'::TEXT,target.id,target.customer_email,target.product_name,target.amount_paise,target.order_id,target.user_id,target.website_id;
    RETURN;
  END IF;

  IF p_transaction_reference IS NULL OR p_transaction_reference = '' OR target.payment_status NOT IN ('PENDING','VERIFYING')
     OR target.amount_paise <> p_amount_paise
     OR target.expires_at < now() THEN
    result := 'REVIEW';
    UPDATE public.payment_orders SET payment_status='MANUAL_REVIEW',product_status='LOCKED' WHERE id=target.id AND payment_status <> 'PAID';
    INSERT INTO public.payment_transactions(order_id,transaction_reference,amount_paise,payment_time,verification_status)
    VALUES (target.id,COALESCE(NULLIF(p_transaction_reference,''),'unparsed-'||p_gmail_message_id),p_amount_paise,p_payment_time,'MANUAL_REVIEW')
    ON CONFLICT (transaction_reference) DO NOTHING;
  ELSE
    result := 'VERIFIED';
    INSERT INTO public.payment_transactions(order_id,transaction_reference,amount_paise,payment_time,verification_status)
    VALUES (target.id,p_transaction_reference,p_amount_paise,p_payment_time,'VERIFIED');
    UPDATE public.payment_orders SET payment_status='PAID',product_status='APPROVED',paid_at=now() WHERE id=target.id;
    UPDATE public.event_websites SET pro_interactive_enabled=true WHERE id=target.website_id AND user_id=target.user_id;
    INSERT INTO public.payment_notification_outbox(order_id,recipient_type) VALUES(target.id,'customer'),(target.id,'admin') ON CONFLICT DO NOTHING;
  END IF;
  IF result='REVIEW' THEN
    INSERT INTO public.payment_notification_outbox(order_id,recipient_type) VALUES(target.id,'admin') ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.processed_payment_notifications(gmail_message_id,transaction_reference,amount_paise,order_id,outcome)
  VALUES (p_gmail_message_id,p_transaction_reference,p_amount_paise,target.id,result) ON CONFLICT DO NOTHING;
  RETURN QUERY SELECT result,target.id,target.customer_email,target.product_name,target.amount_paise,target.order_id,target.user_id,target.website_id;
END;
$$;
REVOKE ALL ON FUNCTION public.verify_upi_payment(TEXT,TEXT,TEXT,INTEGER,TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_upi_payment(TEXT,TEXT,TEXT,INTEGER,TIMESTAMPTZ) TO service_role;

CREATE OR REPLACE FUNCTION public.approve_payment_manually(p_order_id TEXT,p_admin_id UUID,p_reason TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target public.payment_orders%ROWTYPE;
BEGIN
  IF length(trim(p_reason)) NOT BETWEEN 5 AND 500 THEN RAISE EXCEPTION 'A review reason is required'; END IF;
  SELECT * INTO target FROM public.payment_orders WHERE order_id=upper(p_order_id) AND payment_status='MANUAL_REVIEW' FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  INSERT INTO public.payment_manual_approvals(order_id,admin_id,reason) VALUES(target.id,p_admin_id,trim(p_reason));
  UPDATE public.payment_orders SET payment_status='PAID',product_status='APPROVED',paid_at=now() WHERE id=target.id;
  UPDATE public.event_websites SET pro_interactive_enabled=true WHERE id=target.website_id AND user_id=target.user_id;
  INSERT INTO public.payment_notification_outbox(order_id,recipient_type) VALUES(target.id,'customer'),(target.id,'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.approve_payment_manually(TEXT,UUID,TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_payment_manually(TEXT,UUID,TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.acquire_payment_scan_lock(p_lease_seconds INTEGER DEFAULT 50)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE affected INTEGER;
BEGIN
  INSERT INTO public.payment_scan_lock(id,locked_until) VALUES(true,'-infinity') ON CONFLICT(id) DO NOTHING;
  UPDATE public.payment_scan_lock SET locked_until=now()+make_interval(secs=>LEAST(GREATEST(p_lease_seconds,1),300)),updated_at=now()
    WHERE id=true AND locked_until < now();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected = 1;
END;
$$;
REVOKE ALL ON FUNCTION public.acquire_payment_scan_lock(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_payment_scan_lock(INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION public.create_pro_interactive_order(p_user_id UUID,p_customer_name TEXT,p_customer_email TEXT,p_website_id UUID)
RETURNS TABLE(order_uuid UUID, public_order_id TEXT, website_uuid UUID, product_uuid TEXT, product_name TEXT, amount_paise INTEGER, payment_status TEXT, product_status TEXT, created_at TIMESTAMPTZ, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_site public.event_websites%ROWTYPE;
DECLARE target_product public.payment_products%ROWTYPE;
DECLARE new_order_id TEXT;
DECLARE created public.payment_orders%ROWTYPE;
BEGIN
  SELECT * INTO target_site FROM public.event_websites WHERE id=p_website_id AND user_id=p_user_id AND template_id='enrolldesk-01' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Choose a Pro Interactive website owned by your account'; END IF;
  IF target_site.pro_interactive_enabled THEN RAISE EXCEPTION 'Pro Interactive is already enabled for this website'; END IF;
  SELECT * INTO target_product FROM public.payment_products WHERE id='pro-interactive' AND active=true AND amount_paise IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pro Interactive checkout is not available'; END IF;

  UPDATE public.payment_orders SET payment_status='EXPIRED' WHERE website_id=p_website_id AND user_id=p_user_id AND product_id=target_product.id
    AND payment_status='PENDING' AND expires_at <= now();
  SELECT po.* INTO created FROM public.payment_orders AS po WHERE po.website_id=p_website_id AND po.user_id=p_user_id AND po.product_id=target_product.id
    AND po.payment_status IN ('PENDING','VERIFYING') AND po.expires_at > now() ORDER BY po.created_at DESC LIMIT 1;
  IF FOUND THEN
    RETURN QUERY SELECT created.id,created.order_id,created.website_id,created.product_id,created.product_name,created.amount_paise,created.payment_status,created.product_status,created.created_at,created.expires_at;
    RETURN;
  END IF;

  new_order_id := 'ORD-'||to_char(now() AT TIME ZONE 'UTC','YYYYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
  INSERT INTO public.payment_orders(order_id,user_id,customer_name,customer_email,website_id,product_id,product_name,amount_paise,currency,payment_status,product_status,expires_at)
  VALUES(new_order_id,p_user_id,COALESCE(NULLIF(trim(p_customer_name),''),split_part(p_customer_email,'@',1)),p_customer_email,target_site.id,target_product.id,target_product.name,target_product.amount_paise,'INR','PENDING','LOCKED',now()+interval '20 minutes')
  RETURNING * INTO created;
  RETURN QUERY SELECT created.id,created.order_id,created.website_id,created.product_id,created.product_name,created.amount_paise,created.payment_status,created.product_status,created.created_at,created.expires_at;
END;
$$;
REVOKE ALL ON FUNCTION public.create_pro_interactive_order(UUID,TEXT,TEXT,UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_pro_interactive_order(UUID,TEXT,TEXT,UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_pro_interactive_payment(p_order_id TEXT,p_user_id UUID)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_status TEXT;
BEGIN
  UPDATE public.payment_orders SET payment_status=CASE WHEN expires_at <= now() THEN 'EXPIRED' ELSE 'VERIFYING' END
    WHERE order_id=upper(p_order_id) AND user_id=p_user_id AND payment_status='PENDING'
    RETURNING payment_status INTO current_status;
  IF current_status IS NOT NULL THEN RETURN current_status; END IF;
  SELECT payment_status INTO current_status FROM public.payment_orders WHERE order_id=upper(p_order_id) AND user_id=p_user_id;
  RETURN current_status;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_pro_interactive_payment(TEXT,UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_pro_interactive_payment(TEXT,UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.expire_pro_interactive_orders()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE affected INTEGER;
BEGIN
  UPDATE public.payment_orders SET payment_status='EXPIRED' WHERE payment_status IN ('PENDING','VERIFYING') AND expires_at <= now();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;
REVOKE ALL ON FUNCTION public.expire_pro_interactive_orders() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_pro_interactive_orders() TO service_role;

CREATE OR REPLACE FUNCTION public.require_paid_pro_interactive_website()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.pro_interactive_enabled IS TRUE AND COALESCE(auth.role(),'') <> 'service_role' THEN
    IF TG_OP='INSERT' THEN
      RAISE EXCEPTION 'Pro Interactive can only be enabled after backend payment verification';
    ELSIF OLD.pro_interactive_enabled IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'Pro Interactive can only be enabled after backend payment verification';
    END IF;
  END IF;
  IF NEW.template_id='enrolldesk-01' AND NEW.status='published' AND NEW.pro_interactive_enabled IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Purchase Pro Interactive before publishing this website';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS enforce_pro_interactive_payment_before_publish ON public.event_websites;
CREATE TRIGGER enforce_pro_interactive_payment_before_publish
  BEFORE INSERT OR UPDATE OF status,template_id,pro_interactive_enabled ON public.event_websites
  FOR EACH ROW EXECUTE FUNCTION public.require_paid_pro_interactive_website();
