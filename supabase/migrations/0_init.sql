
--
-- Tables
--

CREATE TABLE "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "updated_at" timestamp with time zone,
    "phone" "text",
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "profiles_username_key" UNIQUE ("username")
);

CREATE TABLE "public"."company_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_name" "text",
    "address" "text",
    "phone" "text",
    "email" "text",
    "tax_id" "text",
    "logo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "company_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "company_settings_user_id_key" UNIQUE ("user_id")
);

CREATE TABLE "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "name" "text" NOT NULL,
    "phone" "text",
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "clients_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "name" "text" NOT NULL,
    "contact_person" "text",
    "email" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "address" "text",
    "notes" "text",
    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "suppliers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."product_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "product_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "name" "text" NOT NULL,
    "sku" "text",
    "quantity" integer DEFAULT 0,
    "sale_price" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "category_id" "uuid",
    "purchase_price" numeric,
    "supplier_id" "uuid",
    "purchase_type" "text" DEFAULT 'unit'::"text",
    "is_sellable" boolean DEFAULT true,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE SET NULL,
    CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE SET NULL,
    CONSTRAINT "products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."sales" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "client_id" "uuid",
    "sale_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "total_amount" numeric NOT NULL,
    "status" "text" DEFAULT 'unpaid'::"text" NOT NULL,
    "amount_paid" numeric DEFAULT 0,
    "due_date" "date",
    CONSTRAINT "sales_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sales_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL,
    CONSTRAINT "sales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."sale_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sale_id" "uuid",
    "product_id" "uuid",
    "quantity" integer NOT NULL,
    "unit_price" numeric NOT NULL,
    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sale_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL,
    CONSTRAINT "sale_items_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE CASCADE
);

-- Add other tables similarly...

--
-- Functions
--

CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT COALESCE((raw_user_meta_data->>'is_super_admin')::boolean, false)
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, phone)
  VALUES (NEW.id, NEW.email, NEW.phone);
  
  INSERT INTO public.company_settings (user_id, company_name)
  VALUES (NEW.id, 'Mon Entreprise');

  -- Check for the admin key in the user metadata passed during sign-up
  IF (NEW.raw_user_meta_data->>'admin_key') = 'SUPER_SECRET_ADMIN_KEY' THEN
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || '{"is_super_admin": true}'::jsonb
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_welcome_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.notifications (user_id, title, message)
  VALUES (
    NEW.id,
    'Bienvenue sur Afinex!',
    'Nous sommes ravis de vous avoir parmi nous. Explorez les fonctionnalités pour commencer.'
  );
  RETURN NEW;
END;
$function$
;

--
-- Policies
--

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Company Settings
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own company settings" ON public.company_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Company settings are publicly viewable." ON public.company_settings FOR SELECT USING (true);


-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent marquer leurs notifications comme lues" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent gérer leurs propres clients et les su" ON public.clients FOR ALL USING ((auth.uid() = user_id) OR is_super_admin());

-- Suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent gérer leurs propres fournisseurs et l" ON public.suppliers FOR ALL USING ((auth.uid() = user_id) OR is_super_admin());

-- Product Categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent gérer leurs propres catégories" ON public.product_categories FOR ALL USING ((auth.uid() = user_id) OR is_super_admin());

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent gérer leurs propres produits et les s" ON public.products FOR ALL USING ((auth.uid() = user_id) OR is_super_admin());

-- Sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent gérer leurs propres ventes et les sup" ON public.sales FOR ALL USING ((auth.uid() = user_id) OR is_super_admin());

-- Sale Items
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent gérer leurs propres articles de vente" ON public.sale_items FOR ALL USING (((auth.uid() IN ( SELECT s.user_id FROM sales s WHERE (s.id = sale_items.sale_id))) OR is_super_admin()));


-- Storage
CREATE POLICY "Public logos are viewable by everyone." ON storage.objects FOR SELECT USING (bucket_id = 'company-logos');
CREATE POLICY "Authenticated users can upload a logo." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company-logos' AND auth.uid() = (storage.foldername(name))[1]::uuid);
CREATE POLICY "Users can update their own logo." ON storage.objects FOR UPDATE USING (bucket_id = 'company-logos' AND auth.uid() = (storage.foldername(name))[1]::uuid);
CREATE POLICY "Users can delete their own logo." ON storage.objects FOR DELETE USING (bucket_id = 'company-logos' AND auth.uid() = (storage.foldername(name))[1]::uuid);

--
-- Triggers
--
CREATE TRIGGER on_new_user AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER on_new_user_notification AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.create_welcome_notification();

