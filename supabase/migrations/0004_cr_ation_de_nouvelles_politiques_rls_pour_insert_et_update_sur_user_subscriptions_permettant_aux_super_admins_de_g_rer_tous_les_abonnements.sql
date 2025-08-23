-- Allow authenticated users to insert their own subscription, or Super Admins to insert any subscription
CREATE POLICY "Super admins can insert any subscription" ON public.user_subscriptions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_super_admin(auth.uid()));

-- Allow authenticated users to update their own subscription, or Super Admins to update any subscription
CREATE POLICY "Super admins can update any subscription" ON public.user_subscriptions
FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));