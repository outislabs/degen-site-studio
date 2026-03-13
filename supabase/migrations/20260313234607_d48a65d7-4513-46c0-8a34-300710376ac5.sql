ALTER TABLE public.sites ADD COLUMN domain_payment_status text NOT NULL DEFAULT 'unpaid';
ALTER TABLE public.sites ADD COLUMN domain_payment_id text;