-- ========= ENUMS =========
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');
CREATE TYPE public.property_status AS ENUM ('draft', 'ready', 'published');

-- ========= USER ROLES =========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========= UPDATED_AT TRIGGER =========
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ========= PROPERTIES =========
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  title TEXT NOT NULL DEFAULT 'Nuovo immobile',
  slug TEXT UNIQUE,
  reference_code TEXT UNIQUE,

  property_type TEXT,
  contract_type TEXT,

  price NUMERIC(12,2),
  price_on_request BOOLEAN NOT NULL DEFAULT false,

  municipality TEXT,
  area_zone TEXT,
  address TEXT,
  province TEXT,
  region TEXT DEFAULT 'Toscana',
  country TEXT DEFAULT 'Italia',

  size_sqm INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,

  energy_class TEXT,
  condition TEXT,

  panoramic_view BOOLEAN NOT NULL DEFAULT false,
  historic_property BOOLEAN NOT NULL DEFAULT false,
  garden BOOLEAN NOT NULL DEFAULT false,
  terrace BOOLEAN NOT NULL DEFAULT false,
  balcony BOOLEAN NOT NULL DEFAULT false,
  garage BOOLEAN NOT NULL DEFAULT false,
  cellar BOOLEAN NOT NULL DEFAULT false,
  elevator BOOLEAN NOT NULL DEFAULT false,
  furnished BOOLEAN NOT NULL DEFAULT false,

  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),

  short_notes TEXT,
  internal_notes TEXT,

  status public.property_status NOT NULL DEFAULT 'draft'
);

CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_municipality ON public.properties(municipality);

GRANT SELECT ON public.properties TO anon;
GRANT SELECT ON public.properties TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Public can read published properties"
  ON public.properties FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins read all properties"
  ON public.properties FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert properties"
  ON public.properties FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update properties"
  ON public.properties FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete properties"
  ON public.properties FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ========= PROPERTY IMAGES =========
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_images_property ON public.property_images(property_id, sort_order);

GRANT SELECT ON public.property_images TO anon;
GRANT SELECT ON public.property_images TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.property_images TO authenticated;
GRANT ALL ON public.property_images TO service_role;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read images of published properties"
  ON public.property_images FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_images.property_id AND p.status = 'published'
  ));

CREATE POLICY "Admins read all images"
  ON public.property_images FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage images"
  ON public.property_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- one cover per property
CREATE OR REPLACE FUNCTION public.ensure_single_cover()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_cover THEN
    UPDATE public.property_images
      SET is_cover = false
      WHERE property_id = NEW.property_id AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_single_cover
  AFTER INSERT OR UPDATE OF is_cover ON public.property_images
  FOR EACH ROW WHEN (NEW.is_cover)
  EXECUTE FUNCTION public.ensure_single_cover();

-- ========= PROPERTY FEATURES (narrative params) =========
CREATE TABLE public.property_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  feature_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_features_property ON public.property_features(property_id);

GRANT SELECT ON public.property_features TO anon;
GRANT SELECT ON public.property_features TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.property_features TO authenticated;
GRANT ALL ON public.property_features TO service_role;
ALTER TABLE public.property_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read features of published"
  ON public.property_features FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_features.property_id AND p.status = 'published'
  ));

CREATE POLICY "Admins read all features"
  ON public.property_features FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage features"
  ON public.property_features FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========= PROPERTY DESCRIPTIONS =========
CREATE TABLE public.property_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL UNIQUE REFERENCES public.properties(id) ON DELETE CASCADE,
  generated_description TEXT,
  edited_description TEXT,
  tone_of_voice TEXT,
  language TEXT NOT NULL DEFAULT 'it',
  length_preference TEXT,
  seo_focus TEXT,
  generated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.property_descriptions TO anon;
GRANT SELECT ON public.property_descriptions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.property_descriptions TO authenticated;
GRANT ALL ON public.property_descriptions TO service_role;
ALTER TABLE public.property_descriptions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_descriptions_updated_at
  BEFORE UPDATE ON public.property_descriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Public read descriptions of published"
  ON public.property_descriptions FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_descriptions.property_id AND p.status = 'published'
  ));

CREATE POLICY "Admins read all descriptions"
  ON public.property_descriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage descriptions"
  ON public.property_descriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========= STORAGE POLICIES for property-images bucket =========
CREATE POLICY "Public can view property images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'property-images');

CREATE POLICY "Admins upload property images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update property images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'property-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete property images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'property-images' AND public.has_role(auth.uid(), 'admin'));