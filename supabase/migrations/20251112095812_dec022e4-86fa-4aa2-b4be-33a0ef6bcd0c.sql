-- Add is_free column to scenarios table to track free test scenarios
ALTER TABLE public.scenarios
ADD COLUMN is_free boolean DEFAULT false NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.scenarios.is_free IS 'Indicates if this is a free test scenario (first scenario for a user)';