-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema networklab
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema networklab
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `networklab` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `networklab` ;

-- -----------------------------------------------------
-- Table `networklab`.`institutions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`institutions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('university', 'research_center', 'company', 'government') NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `website` VARCHAR(500) NULL DEFAULT NULL,
  `logo_url` VARCHAR(500) NULL DEFAULT NULL,
  `country` VARCHAR(100) NULL DEFAULT NULL,
  `city` VARCHAR(100) NULL DEFAULT NULL,
  `address` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 21
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`suppliers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`suppliers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `website` VARCHAR(255) NULL DEFAULT NULL,
  `country` VARCHAR(100) NULL DEFAULT NULL,
  `city` VARCHAR(100) NULL DEFAULT NULL,
  `address` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `avatar_url` VARCHAR(500) NULL DEFAULT NULL,
  `bio` TEXT NULL DEFAULT NULL,
  `phone` VARCHAR(20) NULL DEFAULT NULL,
  `is_verified` TINYINT(1) NULL DEFAULT '0',
  `verification_token` VARCHAR(255) NULL DEFAULT NULL,
  `reset_token` VARCHAR(255) NULL DEFAULT NULL,
  `reset_token_expiry` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `supplier_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE,
  INDEX `fk_users_supplier` (`supplier_id` ASC) VISIBLE,
  CONSTRAINT `fk_users_supplier`
    FOREIGN KEY (`supplier_id`)
    REFERENCES `networklab`.`suppliers` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
AUTO_INCREMENT = 16
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`laboratories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`laboratories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `institution_id` INT NOT NULL,
  `director_id` INT NOT NULL,
  `location` VARCHAR(255) NULL DEFAULT NULL,
  `contact_email` VARCHAR(255) NULL DEFAULT NULL,
  `website` VARCHAR(500) NULL DEFAULT NULL,
  `research_areas` JSON NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `institution_id` (`institution_id` ASC) VISIBLE,
  INDEX `director_id` (`director_id` ASC) VISIBLE,
  CONSTRAINT `laboratories_ibfk_1`
    FOREIGN KEY (`institution_id`)
    REFERENCES `networklab`.`institutions` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `laboratories_ibfk_2`
    FOREIGN KEY (`director_id`)
    REFERENCES `networklab`.`users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`equipment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`equipment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `laboratory_id` INT NOT NULL,
  `model` VARCHAR(255) NULL DEFAULT NULL,
  `manufacturer` VARCHAR(255) NULL DEFAULT NULL,
  `specifications` JSON NULL DEFAULT NULL,
  `status` ENUM('available', 'in_use', 'maintenance', 'out_of_service') NULL DEFAULT 'available',
  `hourly_rate` DECIMAL(10,2) NULL DEFAULT NULL,
  `requires_training` TINYINT(1) NULL DEFAULT '0',
  `max_reservation_hours` INT NULL DEFAULT '24',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `laboratory_id` (`laboratory_id` ASC) VISIBLE,
  CONSTRAINT `equipment_ibfk_1`
    FOREIGN KEY (`laboratory_id`)
    REFERENCES `networklab`.`laboratories` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`equipment_reservations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`equipment_reservations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `equipment_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `start_time` TIMESTAMP NOT NULL,
  `end_time` TIMESTAMP NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') NULL DEFAULT 'pending',
  `purpose` TEXT NULL DEFAULT NULL,
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `equipment_id` (`equipment_id` ASC) VISIBLE,
  INDEX `user_id` (`user_id` ASC) VISIBLE,
  CONSTRAINT `equipment_reservations_ibfk_1`
    FOREIGN KEY (`equipment_id`)
    REFERENCES `networklab`.`equipment` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `equipment_reservations_ibfk_2`
    FOREIGN KEY (`user_id`)
    REFERENCES `networklab`.`users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name` (`name` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`institution_users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`institution_users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `institution_id` INT NULL DEFAULT NULL,
  `role_id` INT NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `user_id` (`user_id` ASC) VISIBLE,
  INDEX `institution_id` (`institution_id` ASC) VISIBLE,
  INDEX `role_id` (`role_id` ASC) VISIBLE,
  CONSTRAINT `institution_users_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `networklab`.`users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `institution_users_ibfk_2`
    FOREIGN KEY (`institution_id`)
    REFERENCES `networklab`.`institutions` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `institution_users_ibfk_3`
    FOREIGN KEY (`role_id`)
    REFERENCES `networklab`.`roles` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 12
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`opportunities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`opportunities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `type` ENUM('internship', 'thesis', 'research_position', 'collaboration') NOT NULL,
  `laboratory_id` INT NOT NULL,
  `supervisor_id` INT NOT NULL,
  `requirements` TEXT NULL DEFAULT NULL,
  `duration` VARCHAR(100) NULL DEFAULT NULL,
  `deadline` DATE NULL DEFAULT NULL,
  `is_active` TINYINT(1) NULL DEFAULT '1',
  `application_count` INT NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `laboratory_id` (`laboratory_id` ASC) VISIBLE,
  INDEX `supervisor_id` (`supervisor_id` ASC) VISIBLE,
  CONSTRAINT `opportunities_ibfk_1`
    FOREIGN KEY (`laboratory_id`)
    REFERENCES `networklab`.`laboratories` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `opportunities_ibfk_2`
    FOREIGN KEY (`supervisor_id`)
    REFERENCES `networklab`.`users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`supplier_requests`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`supplier_requests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `supplier_id` INT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` TIMESTAMP NULL DEFAULT NULL,
  `reviewed_by` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `user_id` (`user_id` ASC) VISIBLE,
  INDEX `supplier_id` (`supplier_id` ASC) VISIBLE,
  INDEX `reviewed_by` (`reviewed_by` ASC) VISIBLE,
  CONSTRAINT `supplier_requests_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `networklab`.`users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `supplier_requests_ibfk_2`
    FOREIGN KEY (`supplier_id`)
    REFERENCES `networklab`.`suppliers` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `supplier_requests_ibfk_3`
    FOREIGN KEY (`reviewed_by`)
    REFERENCES `networklab`.`users` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`supplies`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`supplies` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `category` ENUM('reagent', 'consumable', 'equipment_part', 'safety') NOT NULL,
  `supplier_id` INT NULL DEFAULT NULL,
  `unit` ENUM('ml', 'mg', 'g', 'kg', 'unit', 'box', 'package') NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `quantity_available` INT NULL DEFAULT '0',
  `min_quantity` INT NULL DEFAULT '0',
  `expiration_date` DATE NULL DEFAULT NULL,
  `storage_conditions` VARCHAR(255) NULL DEFAULT NULL,
  `safety_info` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `supplier_id` (`supplier_id` ASC) VISIBLE,
  CONSTRAINT `supplies_ibfk_1`
    FOREIGN KEY (`supplier_id`)
    REFERENCES `networklab`.`users` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`supply_listings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`supply_listings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `supply_id` INT NOT NULL,
  `seller_id` INT NOT NULL,
  `quantity_available` INT NOT NULL,
  `price_per_unit` DECIMAL(10,2) NOT NULL,
  `is_available` TINYINT(1) NULL DEFAULT '1',
  `expiration_date` DATE NULL DEFAULT NULL,
  `location` VARCHAR(255) NULL DEFAULT NULL,
  `can_deliver` TINYINT(1) NULL DEFAULT '0',
  `delivery_radius_km` INT NULL DEFAULT '0',
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `supply_id` (`supply_id` ASC) VISIBLE,
  INDEX `seller_id` (`seller_id` ASC) VISIBLE,
  CONSTRAINT `supply_listings_ibfk_1`
    FOREIGN KEY (`supply_id`)
    REFERENCES `networklab`.`supplies` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `supply_listings_ibfk_2`
    FOREIGN KEY (`seller_id`)
    REFERENCES `networklab`.`users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

USE `networklab`;

DELIMITER $$
USE `networklab`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `networklab`.`after_user_insert`
AFTER INSERT ON `networklab`.`users`
FOR EACH ROW
BEGIN
  INSERT INTO institution_users (user_id, institution_id, role_id)
  VALUES (NEW.id, NULL, 1); -- rol_id = 1 (student), sin institución
END$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
