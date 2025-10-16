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
AUTO_INCREMENT = 22
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
  `created_via` ENUM('public','admin') NOT NULL DEFAULT 'public',
  `supplier_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE,
  INDEX `fk_users_supplier` (`supplier_id` ASC) VISIBLE,
  CONSTRAINT `fk_users_supplier`
    FOREIGN KEY (`supplier_id`)
    REFERENCES `networklab`.`suppliers` (`id`)
    ON DELETE SET NULL)
ENGINE = InnoDB
AUTO_INCREMENT = 20
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
  `director_id` INT NULL DEFAULT NULL,
  `location` VARCHAR(255) NULL DEFAULT NULL,
  `contact_email` VARCHAR(255) NULL DEFAULT NULL,
  `website` VARCHAR(500) NULL DEFAULT NULL,
  `research_areas` TEXT NULL DEFAULT NULL,
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
AUTO_INCREMENT = 9
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
  `user_id` INT NULL DEFAULT NULL,
  `model` VARCHAR(255) NULL DEFAULT NULL,
  `manufacturer` VARCHAR(255) NULL DEFAULT NULL,
  `status` ENUM('available', 'in_use', 'maintenance', 'out_of_service') NOT NULL DEFAULT 'available',
  `requires_training` TINYINT(1) NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_equipment_laboratory` (`laboratory_id` ASC) VISIBLE,
  INDEX `idx_equipment_user` (`user_id` ASC) VISIBLE,
  CONSTRAINT `equipment_ibfk_1`
    FOREIGN KEY (`laboratory_id`)
    REFERENCES `networklab`.`laboratories` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_equipment_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `networklab`.`users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 6
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
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`organization_users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`organization_users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `institution_id` INT NULL DEFAULT NULL,
  `role_id` INT NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `organization_type` ENUM('institution', 'provider') NOT NULL DEFAULT 'institution',
  `organization_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `user_id` (`user_id` ASC) VISIBLE,
  INDEX `institution_id` (`institution_id` ASC) VISIBLE,
  INDEX `role_id` (`role_id` ASC) VISIBLE,
  INDEX `idx_org_type_id` (`organization_type` ASC, `organization_id` ASC) VISIBLE,
  CONSTRAINT `organization_users_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `networklab`.`users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `organization_users_ibfk_2`
    FOREIGN KEY (`institution_id`)
    REFERENCES `networklab`.`institutions` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `organization_users_ibfk_3`
    FOREIGN KEY (`role_id`)
    REFERENCES `networklab`.`roles` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 18
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `provider_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `category` VARCHAR(100) NULL DEFAULT NULL,
  `unit` VARCHAR(50) NULL DEFAULT NULL,
  `base_price` DECIMAL(12,2) NULL DEFAULT NULL,
  `quantity_available` INT NULL DEFAULT '0',
  `is_active` TINYINT(1) NULL DEFAULT '1',
  `metadata` JSON NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_products_provider` (`provider_id` ASC) VISIBLE,
  CONSTRAINT `fk_products_suppliers`
    FOREIGN KEY (`provider_id`)
    REFERENCES `networklab`.`suppliers` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `networklab`.`product_images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `networklab`.`product_images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `url` VARCHAR(1024) NOT NULL,
  `metadata` JSON NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_product_images_product` (`product_id` ASC) VISIBLE,
  CONSTRAINT `fk_product_images_product`
    FOREIGN KEY (`product_id`)
    REFERENCES `networklab`.`products` (`id`)
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
  -- Sólo asignar la relación por defecto si el usuario fue creado desde el registro público
  IF NEW.created_via = 'public' THEN
    INSERT INTO organization_users (user_id, institution_id, role_id, organization_type, organization_id)
    VALUES (NEW.id, NULL, 1, 'institution', NULL);
  END IF;
END$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
