-- Create database
CREATE DATABASE mamas_african_taste;

-- Menu Items Table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    available BOOLEAN DEFAULT true,
    image_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    delivery_notes TEXT,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20),
    payment_intent_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL
);

-- Insert sample data
INSERT INTO menu_items (name, description, price, category, available) VALUES
('Jollof Rice & Chicken', 'Fragrant rice cooked in rich tomato stew with grilled chicken and plantains', 16.99, 'rice', true),
('Fufu & Egusi Soup', 'Pounded cassava with traditional melon seed soup and assorted meat', 18.99, 'soup', true),
('Puff Puff & Beans', 'Soft golden fried dough balls served with black-eyed pea stew', 12.99, 'snacks', true),
('Suya Platter', 'Spicy grilled beef skewers with onions and tomatoes', 14.99, 'snacks', true),
('Fufu Corn & Khati Khati', 'Traditional corn fufu with rich vegetable soup', 17.99, 'soup', true);