-- 002_harden_seller_rls.sql
--
-- Problem: the policies in 001 let a signed-in seller write ANY column of their
-- own rows through Supabase's public REST API (the anon key is in the browser):
--
--   * "Sellers view/edit own profile" was FOR ALL with no column limits, and the
--     INSERT policies accepted any `status`, so a seller could run
--         UPDATE sellers SET status = 'active' ...        -- self-approve
--         INSERT INTO kyc_submissions (status) VALUES ('approved') ...
--     and skip U-Shop's KYC review entirely.
--   * stores.sanity_store_id could be re-pointed at another seller's store.
--
-- Fix: sellers may only create rows in the review-pending state, and only
-- U-Shop (the service role: admin app / server code) may change review state.
-- Run this once in the Supabase SQL editor (safe to re-run).

BEGIN;

-- ---------------------------------------------------------------- sellers --
DROP POLICY IF EXISTS "Sellers view/edit own profile" ON public.sellers;
DROP POLICY IF EXISTS "Sellers insert own profile" ON public.sellers;
DROP POLICY IF EXISTS "Sellers view own profile" ON public.sellers;
DROP POLICY IF EXISTS "Sellers update own profile" ON public.sellers;

CREATE POLICY "Sellers view own profile" ON public.sellers
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Sellers insert own profile" ON public.sellers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = auth_user_id AND status = 'pending_review');

CREATE POLICY "Sellers update own profile" ON public.sellers
  FOR UPDATE TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);
-- (no DELETE policy: a seller cannot delete their own record, which cascades to
--  their store and KYC history)

-- ----------------------------------------------------------------- stores --
DROP POLICY IF EXISTS "Sellers insert own store" ON public.stores;
CREATE POLICY "Sellers insert own store" ON public.stores
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'pending_review'
    AND seller_id IN (SELECT id FROM public.sellers WHERE auth_user_id = auth.uid())
  );

-- ---------------------------------------------------------- kyc submissions --
DROP POLICY IF EXISTS "Sellers insert own kyc submissions" ON public.kyc_submissions;
CREATE POLICY "Sellers insert own kyc submissions" ON public.kyc_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    status IN ('pending', 'submitted')
    AND seller_id IN (SELECT id FROM public.sellers WHERE auth_user_id = auth.uid())
  );

-- --------------------------------------------- review state is service-only --
-- Defence in depth for UPDATEs, which RLS cannot restrict per column.
-- `auth.role()` is 'authenticated' for an end-user JWT and 'service_role' for the
-- server key, so server code is unaffected.
CREATE OR REPLACE FUNCTION public.guard_review_state()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.role() = 'authenticated' THEN
    -- Allowed: unchanged, or a rejected seller re-submitting for review.
    IF NEW.status IS DISTINCT FROM OLD.status
       AND NOT (OLD.status = 'rejected' AND NEW.status = 'pending_review') THEN
      RAISE EXCEPTION 'status can only be changed by U-Shop review'
        USING ERRCODE = '42501';
    END IF;

    IF TG_TABLE_NAME = 'stores'
       AND OLD.sanity_store_id IS NOT NULL
       AND NEW.sanity_store_id IS DISTINCT FROM OLD.sanity_store_id THEN
      RAISE EXCEPTION 'sanity_store_id cannot be changed'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_sellers_review_state ON public.sellers;
CREATE TRIGGER guard_sellers_review_state
  BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.guard_review_state();

DROP TRIGGER IF EXISTS guard_stores_review_state ON public.stores;
CREATE TRIGGER guard_stores_review_state
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.guard_review_state();

-- Two stores must never claim the same Sanity document.
CREATE UNIQUE INDEX IF NOT EXISTS uq_stores_sanity_store_id
  ON public.stores (sanity_store_id)
  WHERE sanity_store_id IS NOT NULL;

COMMIT;

-- Verify (run as a signed-in seller, e.g. from the browser console with the anon
-- client): each of these must now FAIL.
--   await supabase.from('sellers').update({ status: 'active' }).eq('auth_user_id', uid)
--   await supabase.from('stores').update({ status: 'active' }).eq('id', storeId)
--   await supabase.from('kyc_submissions').insert({ ..., status: 'approved' })
