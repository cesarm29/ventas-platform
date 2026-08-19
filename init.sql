-- VentasPlatform - Neon PostgreSQL Schema
-- Run this in Neon SQL Editor after creating the database

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL
);

-- Demo users are created automatically by DataSeeder on backend startup.
-- The password hashes below are only used for initial DB setup via Neon SQL Editor.

-- Demo products
INSERT INTO products (name, description, category, price, stock) VALUES
('Laptop HP Pavilion', 'Laptop 15.6 pulgadas, 16GB RAM, 512GB SSD', 'Electronica', 899.99, 25),
('Mouse Logitech MX', 'Mouse inalambrico ergonomico', 'Accesorios', 79.99, 150),
('Teclado Mecanico RGB', 'Teclado gaming switches azules', 'Accesorios', 129.99, 80),
('Monitor Samsung 27"', 'Monitor 4K UHD IPS 27 pulgadas', 'Electronica', 449.99, 30),
('Silla Ergonomica', 'Silla de oficina lumbar ajustable', 'Muebles', 299.99, 45),
('Audifonos Sony WH', 'Audifonos bluetooth cancelacion de ruido', 'Electronica', 199.99, 60),
('Webcam HD 1080p', 'Camara web con microfono integrado', 'Accesorios', 59.99, 200),
('Disco Duro SSD 1TB', 'SSD NVMe lectura 3500MB/s', 'Electronica', 109.99, 100),
('Escritorio Gamer', 'Escritorio con soporte para monitor y accesorios', 'Muebles', 249.99, 35),
('Cable HDMI 2.1', 'Cable HDMI 4K 120Hz 2 metros', 'Accesorios', 19.99, 500),
('Parlante JBL Flip', 'Parlante bluetooth resistente al agua', 'Electronica', 119.99, 75),
('Impresora Epson', 'Impresora multifuncion wifi', 'Electronica', 179.99, 40);
