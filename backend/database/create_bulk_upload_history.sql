-- Create table to store bulk upload history
CREATE TABLE IF NOT EXISTS bulk_upload_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  original_filename VARCHAR(255) NOT NULL,
  upload_type ENUM('import', 'delete') DEFAULT 'import',
  
  -- File paths for reports
  accepted_file_path VARCHAR(500),
  rejected_file_path VARCHAR(500),
  deleted_file_path VARCHAR(500),
  not_found_file_path VARCHAR(500),
  
  -- Statistics
  total_rows INT DEFAULT 0,
  accepted_count INT DEFAULT 0,
  rejected_count INT DEFAULT 0,
  saved_count INT DEFAULT 0,
  updated_count INT DEFAULT 0,
  deleted_count INT DEFAULT 0,
  not_found_count INT DEFAULT 0,
  
  -- File info for download
  accepted_file_available BOOLEAN DEFAULT FALSE,
  rejected_file_available BOOLEAN DEFAULT FALSE,
  deleted_file_available BOOLEAN DEFAULT FALSE,
  not_found_file_available BOOLEAN DEFAULT FALSE,
  
  -- Admin who uploaded
  admin_id INT,
  
  -- Status
  status ENUM('processing', 'completed', 'failed') DEFAULT 'completed',
  error_message TEXT,
  
  INDEX idx_upload_date (upload_date DESC),
  INDEX idx_upload_type (upload_type),
  INDEX idx_status (status),
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
