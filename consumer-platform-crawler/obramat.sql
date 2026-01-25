-- MySQL dump 10.13  Distrib 9.5.0, for macos15.4 (arm64)
--
-- Host: 127.0.0.1    Database: obramat
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `obramat`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `obramat` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `obramat`;

--
-- Table structure for table `product_availability`
--

DROP TABLE IF EXISTS `product_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_availability` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `store_city` varchar(255) DEFAULT NULL,
  `store_name` varchar(255) DEFAULT NULL,
  `availability_text` varchar(255) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_product_store` (`product_id`,`store_city`,`store_name`),
  CONSTRAINT `product_availability_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_availability`
--

LOCK TABLES `product_availability` WRITE;
/*!40000 ALTER TABLE `product_availability` DISABLE KEYS */;
INSERT INTO `product_availability` VALUES (3,2,'Badalona','Obramat Badalona','11',11),(4,1,'Badalona','Obramat Badalona','9',9),(5,5,'Badalona','Obramat Badalona','12',12),(6,6,'Badalona','Obramat Badalona','3',3),(7,7,'Badalona','Obramat Badalona','3',3),(8,8,'Badalona','Obramat Badalona','27',27),(9,9,'Badalona','Obramat Badalona','6',6),(10,10,'Badalona','Obramat Badalona','27',27),(11,11,'Badalona','Obramat Badalona','70',70),(12,12,'Badalona','Obramat Badalona','83',83),(13,13,'Badalona','Obramat Badalona','16',16),(14,14,'Badalona','Obramat Badalona','53',53),(15,15,'Badalona','Obramat Badalona','46',46),(16,16,'Badalona','Obramat Badalona','8',8),(17,17,'Badalona','Obramat Badalona','19',19),(18,18,'Badalona','Obramat Badalona','19',19),(19,19,'Badalona','Obramat Badalona','39',39),(20,20,'Badalona','Obramat Badalona','10',10),(21,21,'Badalona','Obramat Badalona','11',11),(22,22,'Badalona','Obramat Badalona','27',27),(23,23,'Badalona','Obramat Badalona','63',63),(24,24,'Badalona','Obramat Badalona','40',40);
/*!40000 ALTER TABLE `product_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_availability_history`
--

DROP TABLE IF EXISTS `product_availability_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_availability_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `store_city` varchar(255) DEFAULT NULL,
  `store_name` varchar(255) DEFAULT NULL,
  `availability_text` varchar(255) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_avail_hist_product_time` (`product_id`,`recorded_at`),
  CONSTRAINT `product_availability_history_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_availability_history`
--

LOCK TABLES `product_availability_history` WRITE;
/*!40000 ALTER TABLE `product_availability_history` DISABLE KEYS */;
INSERT INTO `product_availability_history` VALUES (1,1,'Badalona','Obramat Badalona','9',9,'2025-12-24 20:56:42'),(2,2,'Badalona','Obramat Badalona','11',11,'2025-12-24 21:01:51'),(3,2,'Badalona','Obramat Badalona','11',11,'2025-12-24 21:03:12'),(4,1,'Badalona','Obramat Badalona','9',9,'2025-12-24 21:03:21'),(5,5,'Badalona','Obramat Badalona','12',12,'2025-12-24 21:03:29'),(6,6,'Badalona','Obramat Badalona','3',3,'2025-12-24 21:03:37'),(7,7,'Badalona','Obramat Badalona','3',3,'2025-12-24 21:03:46'),(8,8,'Badalona','Obramat Badalona','27',27,'2025-12-24 21:03:54'),(9,9,'Badalona','Obramat Badalona','6',6,'2025-12-24 21:04:02'),(10,10,'Badalona','Obramat Badalona','27',27,'2025-12-24 21:04:10'),(11,11,'Badalona','Obramat Badalona','70',70,'2025-12-24 21:04:19'),(12,12,'Badalona','Obramat Badalona','83',83,'2025-12-24 21:04:27'),(13,13,'Badalona','Obramat Badalona','16',16,'2025-12-24 21:04:35'),(14,14,'Badalona','Obramat Badalona','53',53,'2025-12-24 21:04:43'),(15,15,'Badalona','Obramat Badalona','46',46,'2025-12-24 21:09:34'),(16,16,'Badalona','Obramat Badalona','8',8,'2025-12-24 21:09:43'),(17,17,'Badalona','Obramat Badalona','19',19,'2025-12-24 21:09:50'),(18,18,'Badalona','Obramat Badalona','19',19,'2025-12-24 21:09:58'),(19,19,'Badalona','Obramat Badalona','39',39,'2025-12-24 21:10:06'),(20,20,'Badalona','Obramat Badalona','10',10,'2025-12-24 21:10:14'),(21,21,'Badalona','Obramat Badalona','11',11,'2025-12-24 21:10:22'),(22,22,'Badalona','Obramat Badalona','27',27,'2025-12-24 21:10:29'),(23,23,'Badalona','Obramat Badalona','63',63,'2025-12-24 21:10:37'),(24,24,'Badalona','Obramat Badalona','40',40,'2025-12-24 21:10:45');
/*!40000 ALTER TABLE `product_availability_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_documents`
--

DROP TABLE IF EXISTS `product_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `url` varchar(512) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_product_doc` (`product_id`,`url`),
  CONSTRAINT `product_documents_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_documents`
--

LOCK TABLES `product_documents` WRITE;
/*!40000 ALTER TABLE `product_documents` DISABLE KEYS */;
INSERT INTO `product_documents` VALUES (1,1,'https://media.adeo.com/media/4539587/media.pdf'),(2,2,'https://media.adeo.com/media/4539746/media.pdf'),(5,5,'https://media.adeo.com/media/4528136/media.pdf'),(6,6,'https://media.adeo.com/media/4545934/media.pdf'),(7,7,'https://media.adeo.com/media/4551857/media.pdf'),(8,8,'https://media.adeo.com/media/4551822/media.pdf'),(9,9,'https://media.adeo.com/media/4548632/media.pdf'),(10,10,'https://media.adeo.com/media/4532618/media.pdf'),(11,11,'https://media.adeo.com/media/4548265/media.pdf'),(12,12,'https://media.adeo.com/media/4788903/media.pdf'),(13,15,'https://media.adeo.com/media/4529662/media.pdf'),(14,16,'https://media.adeo.com/media/4538229/media.pdf'),(15,17,'https://media.adeo.com/media/4540814/media.pdf'),(16,20,'https://media.adeo.com/media/4705656/media.pdf'),(17,21,'https://media.adeo.com/media/4889177/media.pdf'),(18,23,'https://media.adeo.com/media/4542237/media.pdf'),(19,24,'https://media.adeo.com/media/4541654/media.pdf');
/*!40000 ALTER TABLE `product_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `url` varchar(512) NOT NULL,
  `position` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_product_image` (`product_id`,`url`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'https://media.adeo.com/media/4515703/media.jpg',0),(2,1,'https://media.adeo.com/media/4515702/media.jpg',1),(3,2,'https://media.adeo.com/media/4420336/media.jpg',0),(4,2,'https://media.adeo.com/media/4441361/media.jpg',1),(5,2,'https://media.adeo.com/media/4439050/media.jpg',2),(6,2,'https://media.adeo.com/media/4431275/media.jpg',3),(7,2,'https://media.adeo.com/media/4430694/media.jpg',4),(8,2,'https://media.adeo.com/media/4428940/media.jpg',5),(9,2,'https://media.adeo.com/media/4427030/media.jpg',6),(10,2,'https://media.adeo.com/media/4441721/media.jpg',7),(21,5,'https://media.adeo.com/media/4414405/media.jpg',0),(22,5,'https://media.adeo.com/media/4441310/media.jpg',1),(23,5,'https://media.adeo.com/media/4439009/media.jpg',2),(24,5,'https://media.adeo.com/media/4434884/media.jpg',3),(25,5,'https://media.adeo.com/media/4426693/media.jpg',4),(26,5,'https://media.adeo.com/media/5131961/media.jpeg',5),(27,5,'https://media.adeo.com/media/4434884/media.jpeg',6),(28,5,'https://media.adeo.com/media/4426693/media.jpeg',7),(29,6,'https://media.adeo.com/media/4416156/media.jpg',0),(30,6,'https://media.adeo.com/media/4430791/media.jpg',1),(31,6,'https://media.adeo.com/media/4428155/media.jpg',2),(32,6,'https://media.adeo.com/media/4427207/media.jpg',3),(33,6,'https://media.adeo.com/media/4424752/media.jpg',4),(34,6,'https://media.adeo.com/media/4440548/media.jpg',5),(35,6,'https://media.adeo.com/media/4440018/media.jpg',6),(36,6,'https://media.adeo.com/media/4436888/media.jpg',7),(37,6,'https://media.adeo.com/media/4436540/media.jpg',8),(38,6,'https://media.adeo.com/media/4432514/media.jpg',9),(39,6,'https://www.obramat.es/cdp-site/6.53.0/static/images/common/loader.svg',10),(40,7,'https://media.adeo.com/media/4413448/media.jpg',0),(41,7,'https://media.adeo.com/media/4435690/media.jpg',1),(42,7,'https://media.adeo.com/media/4423906/media.jpg',2),(43,7,'https://media.adeo.com/media/4429887/media.jpg',3),(44,7,'https://media.adeo.com/media/4434242/media.jpg',4),(45,7,'https://media.adeo.com/media/4817712/media.jpg',5),(46,7,'https://media.adeo.com/media/4817521/media.jpg',6),(47,7,'https://media.adeo.com/media/5131961/media.jpeg',7),(48,7,'https://media.adeo.com/media/4434242/media.jpeg',8),(49,7,'https://media.adeo.com/media/4435690/media.jpeg',9),(50,8,'https://media.adeo.com/media/4404900/media.jpg',0),(51,8,'https://media.adeo.com/media/4434551/media.jpg',1),(52,8,'https://media.adeo.com/media/4430660/media.jpg',2),(53,8,'https://media.adeo.com/media/4424925/media.jpg',3),(54,8,'https://media.adeo.com/media/4423534/media.jpg',4),(55,9,'https://media.adeo.com/media/4410516/media.jpg',0),(56,9,'https://media.adeo.com/media/4440512/media.jpg',1),(57,9,'https://media.adeo.com/media/4439958/media.jpg',2),(58,9,'https://media.adeo.com/media/4439659/media.jpg',3),(59,9,'https://media.adeo.com/media/4438179/media.jpg',4),(60,9,'https://media.adeo.com/media/4436036/media.jpg',5),(61,9,'https://media.adeo.com/media/4432701/media.jpg',6),(62,9,'https://media.adeo.com/media/4432356/media.jpg',7),(63,9,'https://media.adeo.com/media/4427107/media.jpg',8),(64,9,'https://www.obramat.es/cdp-site/6.53.0/static/images/common/loader.svg',9),(65,10,'https://media.adeo.com/media/4405522/media.jpg',0),(66,11,'https://media.adeo.com/media/4402003/media.jpg',0),(67,12,'https://media.adeo.com/media/4416717/media.jpg',0),(68,12,'https://media.adeo.com/media/4439514/media.jpg',1),(69,12,'https://media.adeo.com/media/4436535/media.jpg',2),(70,12,'https://media.adeo.com/media/4435351/media.jpg',3),(71,12,'https://media.adeo.com/media/4429095/media.jpg',4),(72,13,'https://media.adeo.com/media/4430588/media.jpg',0),(73,13,'https://media.adeo.com/media/4438655/media.jpg',1),(74,13,'https://media.adeo.com/media/4432856/media.jpg',2),(75,13,'https://media.adeo.com/media/4406302/media.jpg',3),(76,14,'https://media.adeo.com/media/4411756/media.jpg',0),(77,14,'https://media.adeo.com/media/4427291/media.jpg',1),(78,14,'https://media.adeo.com/media/4440250/media.jpg',2),(79,15,'https://media.adeo.com/media/4410554/media.jpg',0),(80,16,'https://media.adeo.com/media/4404061/media.jpg',0),(81,17,'https://media.adeo.com/media/4420935/media.jpg',0),(82,17,'https://media.adeo.com/media/4428250/media.jpg',1),(83,18,'https://media.adeo.com/media/4405915/media.jpg',0),(84,19,'https://media.adeo.com/media/4405446/media.jpg',0),(85,20,'https://media.adeo.com/media/4959016/media.jpg',0),(86,20,'https://media.adeo.com/media/4959023/media.jpg',1),(87,21,'https://media.adeo.com/media/4890872/media.png',0),(88,22,'https://media.adeo.com/media/4404800/media.jpg',0),(89,22,'https://media.adeo.com/media/4817524/media.jpg',1),(90,23,'https://media.adeo.com/media/4395869/media.jpg',0),(91,24,'https://media.adeo.com/media/4411675/media.jpg',0);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_price_history`
--

DROP TABLE IF EXISTS `product_price_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_price_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `price_text` varchar(64) DEFAULT NULL,
  `currency` varchar(8) DEFAULT 'EUR',
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_price_hist_product_time` (`product_id`,`recorded_at`),
  CONSTRAINT `product_price_history_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_price_history`
--

LOCK TABLES `product_price_history` WRITE;
/*!40000 ALTER TABLE `product_price_history` DISABLE KEYS */;
INSERT INTO `product_price_history` VALUES (1,1,140.00,'140','EUR','2025-12-24 20:56:42'),(2,2,164.00,'164','EUR','2025-12-24 21:01:51'),(3,2,164.00,'164','EUR','2025-12-24 21:03:12'),(4,1,140.00,'140','EUR','2025-12-24 21:03:21'),(5,5,139.00,'139','EUR','2025-12-24 21:03:29'),(6,6,171.00,'171','EUR','2025-12-24 21:03:37'),(7,7,346.00,'346','EUR','2025-12-24 21:03:46'),(8,8,76.00,'76','EUR','2025-12-24 21:03:54'),(9,9,50.00,'50','EUR','2025-12-24 21:04:02'),(10,10,19.00,'19','EUR','2025-12-24 21:04:10'),(11,11,12.00,'12','EUR','2025-12-24 21:04:19'),(12,12,5.00,'5','EUR','2025-12-24 21:04:27'),(13,13,12.00,'12','EUR','2025-12-24 21:04:35'),(14,14,7.00,'7','EUR','2025-12-24 21:04:43'),(15,15,49.00,'49','EUR','2025-12-24 21:09:34'),(16,16,31.00,'31','EUR','2025-12-24 21:09:43'),(17,17,55.00,'55','EUR','2025-12-24 21:09:50'),(18,18,35.00,'35','EUR','2025-12-24 21:09:58'),(19,19,38.00,'38','EUR','2025-12-24 21:10:06'),(20,20,69.00,'69','EUR','2025-12-24 21:10:14'),(21,21,119.00,'119','EUR','2025-12-24 21:10:22'),(22,22,87.00,'87','EUR','2025-12-24 21:10:29'),(23,23,36.00,'36','EUR','2025-12-24 21:10:37'),(24,24,48.00,'48','EUR','2025-12-24 21:10:45');
/*!40000 ALTER TABLE `product_price_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `source_url` varchar(512) NOT NULL,
  `title` text,
  `description` text,
  `price` decimal(12,2) DEFAULT NULL,
  `price_text` varchar(64) DEFAULT NULL,
  `currency` varchar(8) DEFAULT 'EUR',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `source_url` (`source_url`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'https://www.obramat.es/productos/sierra-calar-bateria-brushless-18v-bosch-gst-18v-95-b-25087500.html','SIERRA CALAR BATERÍA BRUSHLESS 18V BOSCH GST 18V-95 B','Sierra calar batería Brushless 18V Bosch GST 18V-95 B. 0-3.000c.p.m. No incluye cargador ni baterías. Pendular en 4 niveles (órbita) para priorizar la rapidez del corte o la precisión/limpieza del corte. Profundidad de corte máximo en madera 95mm. Longitud de carrera 26mm. Velocidad variable. Interfaz de aspiración para una conexión eficaz de aspiración del polvo. Luz LED. ● Tipo de inseción de la hoja: ”T”● Sistema de fijación de la hoja: rápida. Cambio de hoja por sistema SDS. ● Peso: 1,6Kg● Ventajas del producto: Potente motor Brushless sin escobillas garantiza mayor duración de la herramienta y excelente autonomía.● Uso recomendado: ideal para realizar cortes curvos y transversales en madera maciza, tablero de aglomerado y compuestos de madera, así como en materiales más gruesos o duros.● Accesorios incluidos: 1 hoja de sierra y 1 conexión para aspirador.',140.00,'140','EUR','2025-12-24 20:56:42','2025-12-24 20:56:42'),(2,'https://www.obramat.es/productos/atornillador-placa-de-yeso-a-bateria-brushless-18v-dewalt-dcf620n-xj-25055718.html','ATORNILLADOR PLACA DE YESO A BATERIA BRUSHLESS 18V DEWALT DCF620N-XJ','Atornillador placa de yeso a batería Brushless 18V Dewalt DCF620N-XJ. Inserción hexagonal 6,35mm. 4.400r.p.m. No incluye cargador ni baterías. Luz LED de trabajo. Gatillo con bloqueo. Torque Máximo 30/5 Nm. ● Peso: 1,48Kg. ● Ventajas de producto: .Diseño compacto y peso reducido para trabajos sin fatiga muscular en la muñeca. ● Uso recomendado: Atornillado intensivo en instalaciones de tabiquería de catón yeso.',164.00,'164','EUR','2025-12-24 21:01:51','2025-12-24 21:01:51'),(5,'https://www.obramat.es/productos/taladro-percutor-bateria-makita-dhp453rfx8-18v-3ah-25022742.html','TALADRO PERCUTOR BATERÍA MAKITA DHP453RFX8 18V 3AH','Taladro percutor batería Makita DHP453RFX8 18V 3Ah. Portabrocas plástico 13mm. 2 velocidades 0-400 / 0-1.300r.p.m. 42Nm de par de giro. 1 batería de 3Ah. ● Peso: 2Kg.● Ventajas del producto: Velocidad regulable que proporciona un control facíl y preciso de las r.p.m. Con engranajes metálicos para una mayor durabilidad de la herramienta. ● Uso recomendado: Taladrado y atornillado uso intensivo.● Accesorios incluidos: 1 batería, cargador.',139.00,'139','EUR','2025-12-24 21:03:29','2025-12-24 21:03:29'),(6,'https://www.obramat.es/productos/martillo-combinado-bateria-brushless-dewalt-18v-2-6j-25046591.html','MARTILLO COMBINADO BATERÍA BRUSHLESS DEWALT 18V 2.6J','Martillo combinado batería Brushless Dewalt DCH133N-XJ 18V 2.6J. SDS Plus. Velocidad variable 0-1.550r.p.m. / 0-5.680i.p.m. No incluye cargador ni baterías. 2 modos de trabajo. Máximos de perforación: homigón 26mm, metal 13mm, madera 30mm. ● Motor: Horizontal. ● Peso: 2.3Kg● Ventajas del producto: Motor sin escobillas ofrece una mayor durabilidad. ● Uso recomendado: Trabajos intensivo de instalaciones que requieren perforación media (pasamuros, canalizaciones medias, luminarias, instalaciones de fachadas...). Ideal para perforaciones de anclajes en hormigón y ladrillo desde 4mm hasta 26mm.● Accesorios incluidos: Empuñadura multi-posición.',171.00,'171','EUR','2025-12-24 21:03:37','2025-12-24 21:03:37'),(7,'https://www.obramat.es/productos/martillo-demoledor-makita-hm0870c-1100w-sds-max-10029616.html','MARTILLO DEMOLEDOR MAKITA HM0870C 1100W SDS-MAX','Martillo demoledor Makita HM0870C 1100W SDS-MAX. 2.650i.p.m. Peso 5.1Kg. Con regulador de velocidad y velocidad variable. Cuerpo de motor vertical.● Ventajas: Regulador de la posición del cincel e indicador de mantenimiento que avisa del cambio de escobilla o avería. ● Uso recomendado: Demolición intensiva tabiquería y pequeñas demoliciones de pavimentos.● Accesorios incluidos: Maletín, empuñadura y tubo de grasa.',346.00,'346','EUR','2025-12-24 21:03:46','2025-12-24 21:03:46'),(8,'https://www.obramat.es/productos/taladro-percutor-bosch-gsb600-600w-10790262.html','TALADRO PERCUTOR BOSCH GSB600 600W','Taladro percutor Bosch GSB 13 RE 600W. Portabrocas automático de 13mm. Velocidad variable con regulador 0 - 2.800r.p.m. Par de giro nominal 1,8Nm. 44.800i.p.m. Ø de perforación en hormigon 13mm, mampostería 15mm y madera 25mm. Con regulador de velocidad y portabrocas metálico.● Peso: 1,8Kg.● Ventajas del producto: Control fácil y preciso de la velocidad, ajuste de las r.p.m. según trabajo a realizar y mayor durabilidad y agarre de la broca.● Uso recomendado: Taladrado intensivo en madera, metal y mampostería● Accesorios incluidos: Tope profundidad y empuñadura.',76.00,'76','EUR','2025-12-24 21:03:54','2025-12-24 21:03:54'),(9,'https://www.obramat.es/productos/bateria-makita-bl1830-3ah-12102120.html','BATERIA MAKITA BL1830 3AH','Batería Makita BL1830 3Ah. Con indicador de nivel de carga. Tiempo de carga aprox. 24 min. con un cargador rápido. Batería LI-ion. ● Peso: 0.64Kg. ● Ventajas producto: Carga rápida.',50.00,'50','EUR','2025-12-24 21:04:02','2025-12-24 21:04:02'),(10,'https://www.obramat.es/productos/conjunto-kit-cierre-puerta-corredera-20mm-canto-redondo-muletilla-pulido-25033988.html','CONJUNTO KIT CIERRE PUERTA CORREDERA 20MM CANTO REDONDO MULETILLA PULIDO','Conjunto para puertas correderas compuesto por :- Cerradura con cerradero fabricado en zamak con entrada de 50 mm, nueca de 8 mm y canto redondo ½.-Condena y desbloqueo fabricado en zamak-Uñero fabricado en zamak a colocar en el canto de la puerta y utilizado como tirador.Acabado pulido. La condena y desbloqueo accionan el gancho de la cerradura con una vuelta. La fijación se realiza mediante tirafondos en el caso de la cerradura. La condena y desbloqueo se fijan a presión, mediante pegamento y mediante tornillo. El uñero se fija mediante presión y pegamento',19.00,'19','EUR','2025-12-24 21:04:10','2025-12-24 21:04:10'),(11,'https://www.obramat.es/productos/condena-descondena-cuadrada-aluminio-50-mm-negro-niquel-25033997.html','CONDENA/DESCONDENA CUADRADA ALUMINIO 50 MM NEGRO/NIQUEL','Condena/\n  des condena de roseta cuadrada realizada en aluminio y acabado en negro/\n  níquel de 50 mm. Ideal para las puertas de baño',12.00,'12','EUR','2025-12-24 21:04:19','2025-12-24 21:04:19'),(12,'https://www.obramat.es/productos/cerradura-vaiven-mueble-empotrar-120mm-laton-10517731.html','CERRADURA VAIVEN MUEBLE EMPOTRAR 120MM LATÓN','Cerradura vaiven mueble empotrar 120mm latón. Ideal para asegurar la privacidad y funcionalidad de tus muebles.\n\nTipo: mueble.\nMaterial: latón.\nAcabado: latón.\nMedidas/Dimensiones: eje de 120mm.\nModelo: cerradura para muebles.\nVentajas del Producto: este tipo de cerradura es reversible y se adapta a diferentes necesidades, facilitando su instalación en distintos tipos de muebles.',5.00,'5','EUR','2025-12-24 21:04:27','2025-12-24 21:04:27'),(13,'https://www.obramat.es/productos/juego-6-destornilladores-mixtos-kenston-1570534.html','JUEGO 6 DESTORNILLADORES MIXTOS KENSTON','Juego 6 destornilladores mixtos: Philips PH1x100mm, PH2x125mm, PH3x150mm. Hoja de cromo vanadio.',12.00,'12','EUR','2025-12-24 21:04:35','2025-12-24 21:04:35'),(14,'https://www.obramat.es/productos/juego-6-destornilladores-de-precision-kenston-25037181.html','JUEGO 6 DESTORNILLADORES DE PRECISIÓN KENSTON','Juego de destornilladores de precisión de 6 unidades; Acabado satinado de la hoja Cr-V; Dos destornilladores planos, dos Phillips y dos de estrella.',7.00,'7','EUR','2025-12-24 21:04:43','2025-12-24 21:04:43'),(15,'https://www.obramat.es/productos/cronotermostato-wifi-para-empotrar-10793895.html','CRONOTERMOSTATO WIFI PARA EMPOTRAR','Cronotermostato WIFI digital que permite comunicación Wifi con App para gestión remota. Compatible con Alexa. Pantalla LCD con retroiluminación que permite la visualización de la temperatura ambiente y la temperatura de ajuste. Programación configurable en 6 intervalos diarios. Rango de ajuste de temperatura de 5ºC a 35ºC.',49.00,'49','EUR','2025-12-24 21:09:34','2025-12-24 21:09:34'),(16,'https://www.obramat.es/productos/termostato-digital-orkli-10477712.html','TERMOSTATO DIGITAL ORKLI','Termostato digital modelo ON/OFF que permite la regulación de la temperatura de calefacción mediante control manual de la misma. Muestra además, la temperatura ambiente. Intervalo de ajuste de temperatura de 10ºC a 30ºC. Temperatura de funcionamiento de 0ºC a 45ºC. Intervalo de humedad 5-95% de humedad relativa sin condensado. Grado de protección IP20.',31.00,'31','EUR','2025-12-24 21:09:43','2025-12-24 21:09:43'),(17,'https://www.obramat.es/productos/cronotermostato-semanal-orkli-10477740.html','CRONOTERMOSTATO SEMANAL ORKLI','Cronotermostato digital que permite la regulacion de temperatura tanto en calefaccion como refrigeracion diaria en intervalos de media hora, posibilidad de configurar dos tipos de temperatura en cada modo de funcionamiento (calefaccion o refrigeracion). Regulación de temperatura de 5ºC a 30ºC.',55.00,'55','EUR','2025-12-24 21:09:50','2025-12-24 21:09:50'),(18,'https://www.obramat.es/productos/monomando-fregadero-gerontologico-10572296.html','MONOMANDO FREGADERO GERONTOLOGICO','Los monomandos de cocina, tienen muchas ventajas: permiten una mayor precisión en la regulación del caudal de agua, ya que con un solo gesto vertical es posible ajustar la cantidad de acuerdo con las necesidades de cada aplicación, lo que permite al mismo tiempo ahorrar una gran cantidad de agua. Además de ser más cómodo y útil, evita las quemaduras.\nSus dos discos cerámicos que alberga en su interior y que incrementan la durabilidad del grifo, además de necesitar un menor mantenimiento que el resto de tipologías de grifos.',35.00,'35','EUR','2025-12-24 21:09:58','2025-12-24 21:09:58'),(19,'https://www.obramat.es/productos/monomando-fregadero-encimera-kirkland-10787770.html','MONOMANDO FREGADERO ENCIMERA KIRKLAND','Los monomandos de cocina, tienen muchas ventajas: permiten una mayor precisión en la regulación del caudal de agua, ya que con un solo gesto vertical es posible ajustar la cantidad de acuerdo con las necesidades de cada aplicación, lo que permite al mismo tiempo ahorrar una gran cantidad de agua. Además de ser más cómodo y útil, evita las quemaduras.\nSus dos discos cerámicos que alberga en su interior y que incrementan la durabilidad del grifo, además de necesitar un menor mantenimiento que el resto de tipologías de grifos.',38.00,'38','EUR','2025-12-24 21:10:06','2025-12-24 21:10:06'),(20,'https://www.obramat.es/productos/grifo-de-cocina-monomando-pvd-atlantis-inox-25094718.html','GRIFO DE COCINA MONOMANDO PVD ATLANTIS INOX','Grifo de cocina monomando, acabado inox, de caño alto. Medidas 350x205mm Ø50mm.Material: acero.Instalación: sobre encimera.Mecanismo: con cartucho de disco cerámico de Ø35mm.Tipo de apertura: simple.Aireador: simple.Ventajas del producto: grifo de cocina de caño alto, con un diseño moderno y sencillo.',69.00,'69','EUR','2025-12-24 21:10:14','2025-12-24 21:10:14'),(21,'https://www.obramat.es/productos/grifo-de-cocina-extraible-pvd-oro-cepillado-25098788.html','GRIFO DE COCINA EXTRAIBLE PVD ORO CEPILLADO','Grifo de cocina monomando, de la marca Corberó. modelo PVD oro cepillado. Fabricado en acero inoxidable. Acabado PVD. De caño alto. Material: Cuerpo y maneta en acero inoxidable.Instalación: sobre encimera o en fregadero.Cabezal extraible, de 2 funciones.Mecanismo: cartucho cerámico de Ø40 mm.Tipo de apertura: simple.',119.00,'119','EUR','2025-12-24 21:10:22','2025-12-24 21:10:22'),(22,'https://www.obramat.es/productos/monomando-fregadero-atis-l-roca-10834446.html','MONOMANDO FREGADERO ATIS L ROCA','Los monomandos de cocina, tienen muchas ventajas: permiten una mayor precisión en la regulación del caudal de agua, ya que con un solo gesto vertical es posible ajustar la cantidad de acuerdo con las necesidades de cada aplicación, lo que permite al mismo tiempo ahorrar una gran cantidad de agua. Además de ser más cómodo y útil, evita las quemaduras.\nSus dos discos cerámicos que alberga en su interior y que incrementan la durabilidad del grifo, además de necesitar un menor mantenimiento que el resto de tipologías de grifos.',87.00,'87','EUR','2025-12-24 21:10:29','2025-12-24 21:10:29'),(23,'https://www.obramat.es/productos/grifo-cocina-monomando-cano-bajo-talos-pro-25067475.html','GRIFO COCINA MONOMANDO CAÑO BAJO TALOS PRO','Grifo de cocina monomando de la marca Ramon Soler, modelo Talos pro, acabado cromo, de caño bajo. Medidas 230x145mm.Material: latón.Instalación: sobre encimera.Mecanismo: con cartucho de disco cerámico de Ø40mm.Tipo de apertura: dos posiciones.Aireador: standard.Ventajas del producto: grifo de cocina de caño bajo, con apertura de dos posiciones. De estilo sencillo.',36.00,'36','EUR','2025-12-24 21:10:37','2025-12-24 21:10:37'),(24,'https://www.obramat.es/productos/grifo-de-cocina-monomando-vulcano-10467261.html','GRIFO DE COCINA MONOMANDO VULCANO','Los monomandos de cocina, tienen muchas ventajas: permiten una mayor precisión en la regulación del caudal de agua, ya que con un solo gesto vertical es posible ajustar la cantidad de acuerdo con las necesidades de cada aplicación, lo que permite al mismo tiempo ahorrar una gran cantidad de agua. Además de ser más cómodo y útil, evita las quemaduras.\nSus dos discos cerámicos que alberga en su interior y que incrementan la durabilidad del grifo, además de necesitar un menor mantenimiento que el resto de tipologías de grifos.',48.00,'48','EUR','2025-12-24 21:10:45','2025-12-24 21:10:45');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'obramat'
--

--
-- Dumping routines for database 'obramat'
--
--
-- WARNING: can't read the INFORMATION_SCHEMA.libraries table. It's most probably an old server 8.0.44.
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-26 17:31:40
