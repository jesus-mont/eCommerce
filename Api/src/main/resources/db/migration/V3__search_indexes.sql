CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE FUNCTION immutable_unaccent(text) RETURNS text
    LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
    AS $$ SELECT public.unaccent('public.unaccent', $1) $$;

UPDATE products SET version = 0 WHERE version IS NULL;
ALTER TABLE products ALTER COLUMN version SET NOT NULL;

CREATE INDEX idx_products_name_trgm ON products USING GIN (immutable_unaccent(lower(name)) gin_trgm_ops);
CREATE INDEX idx_products_description_trgm ON products USING GIN (immutable_unaccent(lower(coalesce(description, ''))) gin_trgm_ops);
CREATE INDEX idx_products_sku_trgm ON products USING GIN (immutable_unaccent(lower(sku)) gin_trgm_ops);
CREATE INDEX idx_products_category_trgm ON products USING GIN (immutable_unaccent(lower(category)) gin_trgm_ops);
