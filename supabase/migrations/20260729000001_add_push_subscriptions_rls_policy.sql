-- Allow authenticated users to manage their own push subscriptions
CREATE POLICY "users_manage_own_push_subscriptions"
ON public.push_subscriptions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
