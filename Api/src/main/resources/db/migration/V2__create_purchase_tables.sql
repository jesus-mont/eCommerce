CREATE TABLE purchase_orders (
                                 id BIGSERIAL PRIMARY KEY,
                                 customer_email VARCHAR(255) NOT NULL,
                                 status VARCHAR(50) NOT NULL,
                                 total_amount NUMERIC(12, 2) NOT NULL,
                                 created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                                 updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE order_items (
                             id BIGSERIAL PRIMARY KEY,
                             purchase_order_id BIGINT NOT NULL,
                             product_id BIGINT NOT NULL,
                             sku VARCHAR(100) NOT NULL,
                             quantity INT NOT NULL,
                             price NUMERIC(12, 2) NOT NULL,
                             CONSTRAINT fk_order_items_purchase_order
                                 FOREIGN KEY (purchase_order_id)
                                     REFERENCES purchase_orders(id)
                                     ON DELETE CASCADE
);

CREATE INDEX idx_purchase_orders_email ON purchase_orders(customer_email);
CREATE INDEX idx_order_items_order_id ON order_items(purchase_order_id);