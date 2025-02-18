-- Insert sample categories
INSERT INTO categories (name, parent_id, is_approved)
VALUES
    ('Fruits', NULL, 1),
    ('Vegetables', NULL, 1),
    ('Citrus Fruits', 1, 1),
    ('Leafy Vegetables', 2, 1),
    ('Tomatoes', 2, 1),
    ('Berries', 1, 1);
GO

--users
-- Insert sample users
-- INSERT INTO users (username, password, email, role)
-- VALUES
--     ('user1', 'password1', 'user1@example.com', 2),
--     ('user2', 'password2', 'user2@example.com', 2),
--     ('user3', 'password3', 'user3@example.com', 2),
--     ('user4', 'password4', 'user4@example.com', 2),
--     ('user5', 'password5', 'user5@example.com', 2),
--     ('user6', 'password6', 'user6@example.com', 2),
--     ('user7', 'password7', 'user7@example.com', 2),
--     ('user8', 'password8', 'user8@example.com', 2);
-- GO

-- --farmers
-- INSERT INTO users (username, password, email, role)
-- VALUES
--     ('farmer1', 'password1', 'farmer1@example.com', 3),
--     ('farmer2', 'password2', 'farmer2@example.com', 3),
--     ('farmer3', 'password3', 'farmer3@example.com', 3),
--     ('farmer4', 'password4', 'farmer4@example.com', 3),
--     ('farmer5', 'password5', 'farmer5@example.com', 3),
--     ('farmer6', 'password6', 'farmer6@example.com', 3),
--     ('farmer7', 'password7', 'farmer7@example.com', 3),
--     ('farmer8', 'password8', 'farmer8@example.com', 3);
-- GO

--uzivatelov je nutne vytvorit cez registraciu, kvoli hashovaniu hesiel

--products
INSERT INTO products (name, price, description, user_id, image, category_id, quantity)
VALUES
    ('Apple', 1.50, 'Fresh red apples', 8, 'apple.jpg', 1, 100),
    ('Orange', 1.20, 'Juicy oranges', 8, 'orange.jpg', 3, 150),
    ('Spinach', 2.00, 'Organic spinach', 9, 'spinach.jpg', 4, 200),
    ('Tomato', 1.00, 'Ripe tomatoes', 10, 'tomato.jpg', 5, 250),
    ('Strawberry', 3.00, 'Sweet strawberries', 11, 'strawberry.jpg', 6, 300),
    ('Carrot', 1.10, 'Crunchy carrots', 11, 'carrot.jpg', 2, 180),
    ('Lemon', 0.80, 'Sour lemons', 12, 'lemon.jpg', 3, 220),
    ('Lettuce', 1.30, 'Fresh lettuce', 12, 'lettuce.jpg', 4, 170);
GO

--events
INSERT INTO events (name, description, date, location, user_id)
VALUES
    ('Farmers Market', 'A local farmers market event', '2023-11-01', 'Town Square', 8),
    ('Organic Food Fair', 'An event showcasing organic foods', '2023-12-15', 'City Park', 9),
    ('Harvest Festival', 'Celebration of the harvest season', '2023-10-20', 'Community Center', 8),
    ('Spring Planting Workshop', 'Workshop on spring planting techniques', '2024-03-10', 'Botanical Garden', 10),
    ('Summer Fruit Festival', 'Festival featuring summer fruits', '2024-06-25', 'Beachfront', 11),
    ('Autumn Veggie Fest', 'Festival celebrating autumn vegetables', '2024-09-30', 'Farmers Field', 11),
    ('Winter Greens Expo', 'Expo showcasing winter greens', '2024-12-05', 'Convention Center', 12),
    ('Healthy Eating Seminar', 'Seminar on healthy eating habits', '2024-01-15', 'Health Center', 12);
GO