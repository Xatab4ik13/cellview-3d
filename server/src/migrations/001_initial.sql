-- ============================================
-- Kladovka78 — Начальная схема базы данных
-- Этап 1: Ячейки, Клиенты, Аренда, Платежи
-- ============================================

CREATE DATABASE IF NOT EXISTS kladovka78
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kladovka78;

-- ============================================
-- 1. Ячейки хранения
-- ============================================
CREATE TABLE IF NOT EXISTS cells (
  id VARCHAR(36) PRIMARY KEY,
  number INT NOT NULL UNIQUE,
  width DECIMAL(5,2) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  depth DECIMAL(5,2) NOT NULL,
  area DECIMAL(6,2) NOT NULL,
  volume DECIMAL(6,2) NOT NULL,
  floor INT NOT NULL DEFAULT 1,
  tier INT NOT NULL DEFAULT 1 COMMENT 'Ярус (1 = нижний, 2 = верхний)',
  price_per_month INT NOT NULL COMMENT 'Цена в рублях за месяц',
  status ENUM('available', 'reserved', 'occupied') NOT NULL DEFAULT 'available',
  reserved_until DATETIME NULL COMMENT 'До какого времени действует бронь',
  has_socket BOOLEAN NOT NULL DEFAULT FALSE,
  has_shelves BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_cells_status (status),
  INDEX idx_cells_number (number)
) ENGINE=InnoDB;

-- ============================================
-- 2. Фотографии ячеек
-- ============================================
CREATE TABLE IF NOT EXISTS cell_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cell_id VARCHAR(36) NOT NULL,
  url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (cell_id) REFERENCES cells(id) ON DELETE CASCADE,
  INDEX idx_photos_cell (cell_id)
) ENGINE=InnoDB;

-- ============================================
-- 3. Клиенты
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('individual', 'company') NOT NULL DEFAULT 'individual',
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NULL,
  telegram VARCHAR(100) NULL,
  -- Для физ. лиц
  passport_series VARCHAR(10) NULL,
  passport_number VARCHAR(10) NULL,
  -- Для компаний
  company_name VARCHAR(255) NULL,
  inn VARCHAR(12) NULL,
  ogrn VARCHAR(15) NULL,
  contact_person VARCHAR(255) NULL,
  -- Метаданные
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_customers_phone (phone),
  INDEX idx_customers_type (type)
) ENGINE=InnoDB;

-- ============================================
-- 4. Аренда
-- ============================================
CREATE TABLE IF NOT EXISTS rentals (
  id VARCHAR(36) PRIMARY KEY,
  cell_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_months INT NOT NULL COMMENT 'Срок аренды в месяцах',
  monthly_price INT NOT NULL COMMENT 'Цена за месяц (с учётом скидки)',
  discount_percent INT NOT NULL DEFAULT 0 COMMENT 'Процент скидки (5/10/15)',
  total_amount INT NOT NULL COMMENT 'Итоговая сумма',
  auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (cell_id) REFERENCES cells(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_rentals_cell (cell_id),
  INDEX idx_rentals_customer (customer_id),
  INDEX idx_rentals_status (status),
  INDEX idx_rentals_dates (start_date, end_date)
) ENGINE=InnoDB;

-- ============================================
-- 5. Платежи
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  rental_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  amount INT NOT NULL COMMENT 'Сумма в рублях',
  payment_method ENUM('cash', 'card', 'online', 'transfer') NOT NULL DEFAULT 'online',
  status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  external_id VARCHAR(255) NULL COMMENT 'ID в платёжной системе (ЮKassa и т.д.)',
  paid_at DATETIME NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (rental_id) REFERENCES rentals(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_payments_rental (rental_id),
  INDEX idx_payments_status (status)
) ENGINE=InnoDB;

-- ============================================
-- 6. Админы (CRM-пользователи)
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'manager') NOT NULL DEFAULT 'manager',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 7. Документы сайта (оферта, политика и т.д.)
-- ============================================
CREATE TABLE IF NOT EXISTS site_documents (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  file_url VARCHAR(500) NULL COMMENT 'Ссылка на PDF файл',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 8. Настройки сайта (Hero, SEO и т.д.)
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
