
--
-- Database: `nasltes`
--
CREATE DATABASE IF NOT EXISTS `nasltes` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `nasltes`;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE IF NOT EXISTS `admins` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `first_name` varchar(200) NOT NULL,
  `last_name` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL,
  `phone` varchar(200) NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `account_state` varchar(200) DEFAULT 'deactivated',
  `password` varchar(200) NOT NULL,
  `token` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `first_name`, `last_name`, `email`, `phone`, `gender`, `account_state`, `password`, `token`, `created_at`, `updated_at`) VALUES
(1, 'Walid', 'Adebayo', 'adebayowalid276@gmail.com', '+2348110573764', 'Male', 'activated', 'sha1$ecb23d01$1$ab64a1af1e569edcf3699c1d6035d72868120b2d', NULL, '2022-11-05 02:30:30', '2023-10-15 01:47:51');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE IF NOT EXISTS `students` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` varchar(200) NOT NULL,
  `student_email` varchar(200) NOT NULL,
  `phone` varchar(200) NOT NULL,
  `type` varchar(15) NOT NULL,
  `ticket_no` varchar(50) NOT NULL,
  `payment_status` varchar(30) DEFAULT NULL,
  `transaction_id` varchar(30) DEFAULT NULL,
  `tx_ref` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

