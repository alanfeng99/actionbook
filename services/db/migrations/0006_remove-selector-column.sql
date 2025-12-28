-- Migration: Remove legacy selector column, keep only selectors array
-- Step 1: Migrate data from selector to selectors (if selectors is null)
UPDATE "elements"
SET "selectors" = CASE
  WHEN "selector"->>'css' IS NOT NULL OR "selector"->>'xpath' IS NOT NULL THEN
    jsonb_build_array(
      CASE WHEN "selector"->>'css' IS NOT NULL THEN
        jsonb_build_object('type', 'css', 'value', "selector"->>'css', 'priority', 1, 'confidence', 0.75)
      END,
      CASE WHEN "selector"->>'xpath' IS NOT NULL THEN
        jsonb_build_object('type', 'xpath', 'value', "selector"->>'xpath', 'priority', 2, 'confidence', 0.6)
      END
    ) - null  -- Remove null entries
  ELSE '[]'::jsonb
END
WHERE "selectors" IS NULL;

-- Step 2: Set default for any remaining nulls
UPDATE "elements" SET "selectors" = '[]'::jsonb WHERE "selectors" IS NULL;

-- Step 3: Make selectors NOT NULL
ALTER TABLE "elements" ALTER COLUMN "selectors" SET NOT NULL;

-- Step 4: Drop the legacy selector column
ALTER TABLE "elements" DROP COLUMN "selector";
