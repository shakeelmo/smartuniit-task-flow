
-- First, let's check what policies already exist (this won't change anything, just for information)
-- Then add only the policies that might be missing

-- Try to create the missing policies, ignoring if they already exist
DO $$
BEGIN
    -- Try to create the update policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile"
          ON public.profiles
          FOR UPDATE
          USING (auth.uid() = id);
    END IF;

    -- Try to create the insert policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
          ON public.profiles
          FOR INSERT
          WITH CHECK (auth.uid() = id);
    END IF;

    -- Try to create the delete policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can delete their own profile'
    ) THEN
        CREATE POLICY "Users can delete their own profile"
          ON public.profiles
          FOR DELETE
          USING (auth.uid() = id);
    END IF;
END
$$;
