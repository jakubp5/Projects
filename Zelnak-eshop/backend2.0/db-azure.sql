DROP TABLE IF EXISTS user_events;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS attributes;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
GO


-- Create the users table
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(255) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT GETDATE(),
    role INT NOT NULL
);
GO

-- Create the categories table
CREATE TABLE categories (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    parent_id INT NULL,
    is_approved BIT NOT NULL, 
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);
GO

-- Create the attributes table
CREATE TABLE attributes (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    is_required BIT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
GO

-- Create the products table
CREATE TABLE products (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    image NVARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
	category_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (category_id) REFERENCES categories(id)
);
GO

-- Create the orders table
CREATE TABLE orders (
    id INT PRIMARY KEY IDENTITY(1,1),
    buyer_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    status NVARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (buyer_id) REFERENCES users(id)
);
GO


-- Create the order_items table
CREATE TABLE order_items (
    id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    seller_id INT NOT NULL,
    quantity INT NOT NULL,
    status NVARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);
GO

-- Create the reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL,
    review NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
GO

-- Create the events table
CREATE TABLE events (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    date DATE NOT NULL,
    location NVARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

-- Create the user_events table
CREATE TABLE user_events (
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);
GO

CREATE TRIGGER trg_update_order_status
ON order_items
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @order_id INT;

    -- Get the order_id from the updated order_items
    SELECT @order_id = order_id
    FROM inserted;

    -- Check if all order items for the order are approved
    IF NOT EXISTS (
        SELECT 1
        FROM order_items
        WHERE order_id = @order_id
        AND status != 'Approved'
    )
    BEGIN
        -- Update the order status to 'Finished'
        UPDATE orders
        SET status = 'Finished'
        WHERE id = @order_id;
    END
END;

