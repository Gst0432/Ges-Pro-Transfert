-- Helper function to check if the current user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'is_super_admin'
    FROM auth.users
    WHERE id = auth.uid()
  )::BOOLEAN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Table: Profiles (stores public user data)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    username TEXT UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Table: Company Settings
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    tax_id TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own company settings" ON public.company_settings FOR ALL USING (auth.uid() = user_id);

-- Table: Clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own clients" ON public.clients FOR ALL USING (auth.uid() = user_id);

-- Table: Suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own suppliers" ON public.suppliers FOR ALL USING (auth.uid() = user_id);

-- Table: Product Categories
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own product categories" ON public.product_categories FOR ALL USING (auth.uid() = user_id);

-- Table: Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    quantity INT DEFAULT 0,
    purchase_price NUMERIC(10, 2) DEFAULT 0,
    sale_price NUMERIC(10, 2) DEFAULT 0,
    is_sellable BOOLEAN DEFAULT TRUE,
    purchase_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own products" ON public.products FOR ALL USING (auth.uid() = user_id);

-- Table: Sales
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    sale_date DATE NOT NULL,
    due_date DATE,
    total_amount NUMERIC(10, 2) NOT NULL,
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sales" ON public.sales FOR ALL USING (auth.uid() = user_id);

-- Table: Sale Items
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL
);
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage items of their own sales" ON public.sale_items FOR ALL
USING ( (SELECT user_id FROM public.sales WHERE id = sale_id) = auth.uid() );

-- Table: Purchase Orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    order_date DATE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own purchase orders" ON public.purchase_orders FOR ALL USING (auth.uid() = user_id);

-- Table: Purchase Order Items
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity_ordered INT NOT NULL,
    quantity_received INT DEFAULT 0,
    unit_price NUMERIC(10, 2) NOT NULL
);
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage items of their own purchase orders" ON public.purchase_order_items FOR ALL
USING ( (SELECT user_id FROM public.purchase_orders WHERE id = purchase_order_id) = auth.uid() );

-- Table: Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own expenses" ON public.expenses FOR ALL USING (auth.uid() = user_id);

-- Table: Documents (Invoices, Quotes, Receipts)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    expense_id UUID REFERENCES public.expenses(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'invoice', 'quote', 'receipt_sale', 'receipt_purchase', 'receipt_expense'
    document_number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT,
    document_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own documents" ON public.documents FOR ALL USING (auth.uid() = user_id);

-- Table: Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT, -- 'stock_alert', 'payment_due', etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Table: SaaS Plans
CREATE TABLE IF NOT EXISTS public.saas_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price_monthly NUMERIC(10, 2),
    price_yearly NUMERIC(10, 2),
    currency TEXT,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    api_url TEXT,
    trial_days INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access to plans" ON public.saas_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow super admins to manage plans" ON public.saas_plans FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Table: User Subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.saas_plans(id),
    status TEXT NOT NULL, -- 'active', 'trial', 'canceled', 'past_due'
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage all subscriptions" ON public.user_subscriptions FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Trigger function to update stock on sale
CREATE OR REPLACE FUNCTION update_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET quantity = quantity - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_sale_item_insert ON public.sale_items;
CREATE TRIGGER after_sale_item_insert
  AFTER INSERT ON public.sale_items
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_sale();

-- Trigger function to update stock on purchase reception
CREATE OR REPLACE FUNCTION update_stock_on_reception()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity_received > OLD.quantity_received THEN
    UPDATE public.products
    SET quantity = quantity + (NEW.quantity_received - OLD.quantity_received)
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_purchase_item_update ON public.purchase_order_items;
CREATE TRIGGER after_purchase_item_update
  AFTER UPDATE OF quantity_received ON public.purchase_order_items
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_reception();