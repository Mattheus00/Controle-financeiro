-- Marcas globais, regras por usuário e bucket público de logos.

CREATE TABLE public.merchant_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_path text,
  category_slug text,
  aliases text[] NOT NULL DEFAULT '{}',
  website text,
  background_color text,
  foreground_color text,
  is_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_merchant_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  merchant_pattern text NOT NULL,
  custom_name text,
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  custom_icon text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_merchant_rules_user_pattern UNIQUE (user_id, merchant_pattern)
);

CREATE INDEX idx_merchant_brands_slug ON public.merchant_brands (slug);
CREATE INDEX idx_merchant_brands_active ON public.merchant_brands (is_active);
CREATE INDEX idx_user_merchant_rules_user_id ON public.user_merchant_rules (user_id);

CREATE TRIGGER trg_merchant_brands_updated_at BEFORE UPDATE ON public.merchant_brands
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER trg_user_merchant_rules_updated_at BEFORE UPDATE ON public.user_merchant_rules
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

ALTER TABLE public.merchant_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_merchant_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY merchant_brands_select ON public.merchant_brands
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY user_merchant_rules_select_own ON public.user_merchant_rules
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY user_merchant_rules_insert_own ON public.user_merchant_rules
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY user_merchant_rules_update_own ON public.user_merchant_rules
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_merchant_rules_delete_own ON public.user_merchant_rules
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-assets',
  'brand-assets',
  true,
  524288,
  ARRAY['image/svg+xml', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY brand_assets_public_read ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'brand-assets');

INSERT INTO public.merchant_brands
  (name, slug, logo_path, category_slug, aliases, website, background_color, foreground_color, is_verified)
VALUES
  ('Netflix', 'netflix', '/brands/netflix.svg', 'assinaturas', ARRAY['netflix','netflix.com','netflix entretenimento','netflix entretenimento brasil','netflix servicos'], 'https://www.netflix.com', '#141414', '#E50914', true),
  ('Spotify', 'spotify', '/brands/spotify.svg', 'assinaturas', ARRAY['spotify','spotify.com'], 'https://www.spotify.com', '#191414', '#1DB954', true),
  ('Uber', 'uber', '/brands/uber.svg', 'transporte', ARRAY['uber','uber trip','uber do brasil','help.uber.com'], 'https://www.uber.com', '#000000', '#FFFFFF', true),
  ('99', '99', '/brands/99.svg', 'transporte', ARRAY['99','99app','99 pop','99food'], 'https://99app.com', '#FFDD00', '#000000', true),
  ('iFood', 'ifood', '/brands/ifood.svg', 'alimentacao', ARRAY['ifood','ifood.com','ifood.com.br'], 'https://www.ifood.com.br', '#EA1D2C', '#FFFFFF', true),
  ('Amazon', 'amazon', '/brands/amazon.svg', 'compras', ARRAY['amazon','amazon.com','amazon.com.br','amzn'], 'https://www.amazon.com.br', '#FFFFFF', '#FF9900', true),
  ('Mercado Livre', 'mercado-livre', '/brands/mercado-livre.svg', 'compras', ARRAY['mercado livre','mercadolivre','mercado libre','mercadolibre'], 'https://www.mercadolivre.com.br', '#FFE600', '#2D3277', true),
  ('Nubank', 'nubank', '/brands/nubank.svg', 'outros', ARRAY['nubank','nu pagamentos','nu bank'], 'https://nubank.com.br', '#820AD1', '#FFFFFF', true),
  ('Inter', 'inter', '/brands/inter.svg', 'outros', ARRAY['banco inter','bancointer','inter pag'], 'https://www.bancointer.com.br', '#FF7A00', '#FFFFFF', true),
  ('PicPay', 'picpay', '/brands/picpay.svg', 'outros', ARRAY['picpay','pic pay'], 'https://picpay.com', '#21C25E', '#FFFFFF', true),
  ('Mercado Pago', 'mercado-pago', '/brands/mercado-pago.svg', 'outros', ARRAY['mercado pago','mercadopago'], 'https://www.mercadopago.com.br', '#009EE3', '#FFFFFF', true),
  ('Smart Fit', 'smart-fit', '/brands/smart-fit.svg', 'academia', ARRAY['smart fit','smartfit','academia smart fit'], NULL, '#000000', '#FFFFFF', true),
  ('Claro', 'claro', '/brands/claro.svg', 'telefone', ARRAY['claro','claro brasil'], 'https://www.claro.com.br', '#DA291C', '#FFFFFF', true),
  ('Vivo', 'vivo', '/brands/vivo.svg', 'telefone', ARRAY['vivo','telefonica vivo'], 'https://www.vivo.com.br', '#660099', '#FFFFFF', true),
  ('TIM', 'tim', '/brands/tim.svg', 'telefone', ARRAY['tim','tim brasil','tim live'], 'https://www.tim.com.br', '#004C97', '#FFFFFF', true),
  ('Google', 'google', '/brands/google.svg', 'assinaturas', ARRAY['google','google one','google.com'], 'https://www.google.com', '#FFFFFF', '#4285F4', true),
  ('Apple', 'apple', '/brands/apple.svg', 'assinaturas', ARRAY['apple','apple.com','icloud','apple icloud'], 'https://www.apple.com', '#000000', '#FFFFFF', true),
  ('Microsoft', 'microsoft', '/brands/microsoft.svg', 'assinaturas', ARRAY['microsoft','microsoft 365','xbox game pass'], 'https://www.microsoft.com', '#FFFFFF', '#737373', true),
  ('Steam', 'steam', '/brands/steam.svg', 'lazer', ARRAY['steam','steampowered'], 'https://store.steampowered.com', '#171A21', '#FFFFFF', true),
  ('PlayStation', 'playstation', '/brands/playstation.svg', 'lazer', ARRAY['playstation','psn','playstation network','sony playstation'], 'https://www.playstation.com', '#003791', '#FFFFFF', true),
  ('Xbox', 'xbox', '/brands/xbox.svg', 'lazer', ARRAY['xbox','xbox.com'], 'https://www.xbox.com', '#107C10', '#FFFFFF', true),
  ('YouTube', 'youtube', '/brands/youtube.svg', 'assinaturas', ARRAY['youtube','youtube.com','youtube premium'], 'https://www.youtube.com', '#FF0000', '#FFFFFF', true),
  ('Disney+', 'disney-plus', '/brands/disney-plus.svg', 'assinaturas', ARRAY['disney+','disney plus','disneyplus'], 'https://www.disneyplus.com', '#113CCF', '#FFFFFF', true),
  ('Prime Video', 'prime-video', '/brands/prime-video.svg', 'assinaturas', ARRAY['prime video','amazon prime video','amazon prime'], 'https://www.primevideo.com', '#00A8E1', '#FFFFFF', true),
  ('Max', 'max', '/brands/max.svg', 'assinaturas', ARRAY['hbo max','hbomax','max.com'], 'https://www.max.com', '#002BE7', '#FFFFFF', true),
  ('Shopee', 'shopee', '/brands/shopee.svg', 'compras', ARRAY['shopee','shopee.com.br'], 'https://shopee.com.br', '#EE4D2D', '#FFFFFF', true),
  ('Shein', 'shein', '/brands/shein.svg', 'compras', ARRAY['shein','shein.com'], 'https://www.shein.com', '#000000', '#FFFFFF', true),
  ('McDonald''s', 'mcdonalds', '/brands/mcdonalds.svg', 'alimentacao', ARRAY['mcdonalds','mc donalds','mcdonald''s'], 'https://www.mcdonalds.com.br', '#FFBC0D', '#DA291C', true),
  ('Burger King', 'burger-king', '/brands/burger-king.svg', 'alimentacao', ARRAY['burger king','burgerking','bk'], 'https://www.burgerking.com.br', '#D62300', '#FFAA00', true),
  ('Starbucks', 'starbucks', '/brands/starbucks.svg', 'alimentacao', ARRAY['starbucks'], 'https://www.starbucks.com.br', '#006241', '#FFFFFF', true),
  ('Carrefour', 'carrefour', '/brands/carrefour.svg', 'mercado', ARRAY['carrefour'], 'https://www.carrefour.com.br', '#004E9F', '#FFFFFF', true),
  ('Assaí', 'assai', NULL, 'mercado', ARRAY['assai','assai atacadista'], NULL, NULL, NULL, true),
  ('Atacadão', 'atacadao', NULL, 'mercado', ARRAY['atacadao','atacadão'], NULL, NULL, NULL, true),
  ('Drogasil', 'drogasil', NULL, 'saude', ARRAY['drogasil'], NULL, NULL, NULL, true),
  ('Droga Raia', 'droga-raia', NULL, 'saude', ARRAY['droga raia','drogaraia'], NULL, NULL, NULL, true),
  ('Cemig', 'cemig', NULL, 'energia', ARRAY['cemig','companhia energetica de minas'], NULL, NULL, NULL, true),
  ('OpenAI', 'openai', '/brands/openai.svg', 'assinaturas', ARRAY['openai','chatgpt','chat gpt'], 'https://openai.com', '#10A37F', '#FFFFFF', true),
  ('iCloud', 'icloud', '/brands/icloud.svg', 'assinaturas', ARRAY['icloud.com','apple icloud+'], 'https://www.icloud.com', '#3693F3', '#FFFFFF', true),
  ('Magazine Luiza', 'magalu', '/brands/magalu.svg', 'compras', ARRAY['magalu','magazine luiza','magazine luiza sa'], 'https://www.magazineluiza.com.br', '#0086FF', '#FFFFFF', true),
  ('Itaú', 'itau', '/brands/itau.svg', 'outros', ARRAY['itau','banco itau','itaú'], 'https://www.itau.com.br', '#EC7000', '#FFFFFF', true),
  ('Bradesco', 'bradesco', '/brands/bradesco.svg', 'outros', ARRAY['bradesco','banco bradesco'], 'https://www.bradesco.com.br', '#CC092F', '#FFFFFF', true),
  ('Rappi', 'rappi', '/brands/rappi.svg', 'alimentacao', ARRAY['rappi'], 'https://www.rappi.com.br', '#FF441F', '#FFFFFF', true),
  ('Shell', 'shell', '/brands/shell.svg', 'combustivel', ARRAY['shell','shell box'], 'https://www.shell.com.br', '#FBCE07', '#DD1D21', true),
  ('Ipiranga', 'ipiranga', NULL, 'combustivel', ARRAY['ipiranga','posto ipiranga'], NULL, NULL, NULL, true),
  ('Petrobras', 'petrobras', '/brands/petrobras.svg', 'combustivel', ARRAY['petrobras','posto petrobras'], 'https://petrobras.com.br', '#00A859', '#FFFFFF', true);

UPDATE public.merchant_brands
SET logo_path = NULL
WHERE slug NOT IN (
  'netflix','spotify','uber','ifood','nubank','picpay','mercado-pago','vivo',
  'google','apple','steam','playstation','youtube','max','shopee','mcdonalds',
  'burger-king','starbucks','carrefour','icloud','shell'
);
