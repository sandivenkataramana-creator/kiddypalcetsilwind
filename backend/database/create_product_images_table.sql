-- Create product_images table for storing multiple product images
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_sort_order (sort_order)
);

-- If the table already exists with different columns, uncomment and run:
-- ALTER TABLE product_images ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;
-- ALTER TABLE product_images ADD COLUMN sort_order INT DEFAULT 0;
-- ALTER TABLE product_images ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
