-- Inventory & Procurement Management System schema
-- MySQL 8.0+ compatible DDL generated from the Django models.
-- This file defines the custom application tables used by the project.

DROP TABLE IF EXISTS `inventory_payment`;
DROP TABLE IF EXISTS `inventory_purchaseorderitem`;
DROP TABLE IF EXISTS `inventory_purchaseorder`;
DROP TABLE IF EXISTS `inventory_approval`;
DROP TABLE IF EXISTS `inventory_purchaserequest`;
DROP TABLE IF EXISTS `inventory_stocktransaction`;
DROP TABLE IF EXISTS `inventory_quotation`;
DROP TABLE IF EXISTS `inventory_supplier`;
DROP TABLE IF EXISTS `inventory_item`;
DROP TABLE IF EXISTS `inventory_unit`;
DROP TABLE IF EXISTS `inventory_category`;
DROP TABLE IF EXISTS `core_user`;
DROP TABLE IF EXISTS `core_role`;
DROP TABLE IF EXISTS `core_department`;

CREATE TABLE `core_department` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_department_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `core_role` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_role_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `core_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `password` VARCHAR(128) NOT NULL,
  `last_login` DATETIME NULL DEFAULT NULL,
  `is_superuser` TINYINT(1) NOT NULL,
  `first_name` VARCHAR(150) NOT NULL,
  `last_name` VARCHAR(150) NOT NULL,
  `is_staff` TINYINT(1) NOT NULL,
  `is_active` TINYINT(1) NOT NULL,
  `date_joined` DATETIME NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `employee_id` VARCHAR(50) NOT NULL,
  `department_id` BIGINT NULL DEFAULT NULL,
  `role_id` BIGINT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_user_email_unique` (`email`),
  KEY `core_user_department_id_3a5b1d0b` (`department_id`),
  KEY `core_user_role_id_f1be71a3` (`role_id`),
  CONSTRAINT `core_user_department_id_fk` FOREIGN KEY (`department_id`) REFERENCES `core_department` (`id`) ON DELETE SET NULL,
  CONSTRAINT `core_user_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `core_role` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inventory_category` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_category_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inventory_unit` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `symbol` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_unit_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inventory_item` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(100) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `category_id` BIGINT NULL DEFAULT NULL,
  `unit_id` BIGINT NULL DEFAULT NULL,
  `reorder_level` INT UNSIGNED NOT NULL,
  `current_stock` INT UNSIGNED NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `is_active` TINYINT(1) NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_item_sku_unique` (`sku`),
  KEY `inventory_item_category_id_3d8d4cf7` (`category_id`),
  KEY `inventory_item_unit_id_5f612d7b` (`unit_id`),
  CONSTRAINT `inventory_item_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `inventory_category` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inventory_item_unit_id_fk` FOREIGN KEY (`unit_id`) REFERENCES `inventory_unit` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inventory_supplier` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `contact_person` VARCHAR(100) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `address` LONGTEXT NOT NULL,
  `tax_id` VARCHAR(100) NOT NULL,
  `performance_notes` LONGTEXT NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inventory_quotation` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `supplier_id` BIGINT NOT NULL,
  `item_id` BIGINT NOT NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `lead_time_days` INT UNSIGNED NOT NULL,
  `valid_until` DATE NULL DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_quotation_supplier_id_07da3ed2` (`supplier_id`),
  KEY `inventory_quotation_item_id_9fce154f` (`item_id`),
  CONSTRAINT `inventory_quotation_supplier_id_fk` FOREIGN KEY (`supplier_id`) REFERENCES `inventory_supplier` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_quotation_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `inventory_item` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inventory_stocktransaction` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `item_id` BIGINT NOT NULL,
  `transaction_type` VARCHAR(20) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `reference` VARCHAR(200) NOT NULL,
  `notes` LONGTEXT NOT NULL,
  `created_by_id` BIGINT NULL DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_stocktransaction_item_id_ebc2f8e5` (`item_id`),
  KEY `inventory_stocktransaction_created_by_id_9af84d1b` (`created_by_id`),
  CONSTRAINT `inventory_stocktransaction_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `inventory_item` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_stocktransaction_created_by_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `core_user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inventory_purchaserequest` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `item_id` BIGINT NOT NULL,
  `requested_by_id` BIGINT NULL DEFAULT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `justification` LONGTEXT NOT NULL,
  `priority` VARCHAR(20) NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_purchaserequest_item_id_9f4e5f6c` (`item_id`),
  KEY `inventory_purchaserequest_requested_by_id_6b1bb5f6` (`requested_by_id`),
  CONSTRAINT `inventory_purchaserequest_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `inventory_item` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_purchaserequest_requested_by_id_fk` FOREIGN KEY (`requested_by_id`) REFERENCES `core_user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inventory_approval` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `purchase_request_id` BIGINT NOT NULL,
  `approved_by_id` BIGINT NULL DEFAULT NULL,
  `action` VARCHAR(20) NOT NULL,
  `comments` LONGTEXT NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_approval_purchase_request_id_1d464c7e` (`purchase_request_id`),
  KEY `inventory_approval_approved_by_id_8d65c823` (`approved_by_id`),
  CONSTRAINT `inventory_approval_purchase_request_id_fk` FOREIGN KEY (`purchase_request_id`) REFERENCES `inventory_purchaserequest` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_approval_approved_by_id_fk` FOREIGN KEY (`approved_by_id`) REFERENCES `core_user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inventory_purchaseorder` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `supplier_id` BIGINT NOT NULL,
  `order_number` VARCHAR(100) NOT NULL,
  `total_amount` DECIMAL(14,2) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_purchaseorder_order_number_unique` (`order_number`),
  KEY `inventory_purchaseorder_supplier_id_16c65216` (`supplier_id`),
  CONSTRAINT `inventory_purchaseorder_supplier_id_fk` FOREIGN KEY (`supplier_id`) REFERENCES `inventory_supplier` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inventory_purchaseorderitem` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `purchase_order_id` BIGINT NOT NULL,
  `item_id` BIGINT NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_purchaseorderitem_purchase_order_id_2d95f8f6` (`purchase_order_id`),
  KEY `inventory_purchaseorderitem_item_id_933f4d39` (`item_id`),
  CONSTRAINT `inventory_purchaseorderitem_purchase_order_id_fk` FOREIGN KEY (`purchase_order_id`) REFERENCES `inventory_purchaseorder` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_purchaseorderitem_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `inventory_item` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `inventory_payment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `purchase_order_id` BIGINT NOT NULL,
  `bill_number` VARCHAR(100) NOT NULL,
  `bill_date` DATE NOT NULL,
  `total_amount` DECIMAL(14,2) NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `created_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_payment_purchase_order_id_8fe0b5d5` (`purchase_order_id`),
  CONSTRAINT `inventory_payment_purchase_order_id_fk` FOREIGN KEY (`purchase_order_id`) REFERENCES `inventory_purchaseorder` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

