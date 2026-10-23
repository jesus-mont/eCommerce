CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,
                          sku VARCHAR(255) NOT NULL UNIQUE,
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          category VARCHAR(255) NOT NULL,
                          price NUMERIC(12, 2) NOT NULL,
                          stock INT NOT NULL,
                          weight_kg NUMERIC(8, 3) NOT NULL,
                          is_active BOOLEAN NOT NULL DEFAULT TRUE,
                          version BIGINT,
                          created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                          updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);