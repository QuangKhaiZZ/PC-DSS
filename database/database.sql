-- PC-DSS: MySQL 8.0.16+ (CHECK duoc thuc thi).
-- Tao bang va them danh muc/thuong hieu trong cung mot lan chay.
-- Chon MOT DATABASE MOI, RONG truoc khi chay. Khong chay tren database dang dung.
-- Khong co CREATE DATABASE, USE, DROP hay lenh xoa du lieu trong file nay.
-- Chi chay mot lan. Xem database/README.md va docs/database-demo.md.
SET NAMES utf8mb4;

CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL DEFAULT 'User',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT CK_Users_Role CHECK (Role IN ('User', 'Admin'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Giu nguyen ten cot va index de khop Category dang co trong backend.
CREATE TABLE Categories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL,
    UNIQUE KEY IX_Categories_CategoryName (CategoryName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Brands (
    BrandID INT AUTO_INCREMENT PRIMARY KEY,
    BrandName VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    ProductCode VARCHAR(100) NOT NULL UNIQUE,
    ProductName VARCHAR(255) NOT NULL,
    CategoryID INT NOT NULL,
    BrandID INT NOT NULL,
    Price DECIMAL(15,0) NULL COMMENT 'Gia tham khao VND, khong phai gia don hang',
    PriceSourceUrl VARCHAR(1000) NULL,
    PriceCheckedAt DATE NULL,
    SpecSourceUrl VARCHAR(1000) NOT NULL,
    Description TEXT NULL,
    Image VARCHAR(1000) NULL,
    IsActive BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Da duyet de dua vao tap tu van',
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (BrandID) REFERENCES Brands(BrandID),
    CONSTRAINT CK_Products_Code CHECK (CHAR_LENGTH(TRIM(ProductCode)) > 0),
    CONSTRAINT CK_Products_Name CHECK (CHAR_LENGTH(TRIM(ProductName)) > 0),
    CONSTRAINT CK_Products_SpecSource CHECK (CHAR_LENGTH(TRIM(SpecSourceUrl)) > 0),
    CONSTRAINT CK_Products_Price CHECK (Price IS NULL OR Price > 0),
    CONSTRAINT CK_Products_PriceSource CHECK (
        (Price IS NULL AND PriceSourceUrl IS NULL AND PriceCheckedAt IS NULL)
        OR (Price IS NOT NULL AND PriceSourceUrl IS NOT NULL AND PriceCheckedAt IS NOT NULL
            AND CHAR_LENGTH(TRIM(PriceSourceUrl)) > 0)
    ),
    CONSTRAINT CK_Products_Active CHECK (IsActive IN (0, 1) AND (IsActive = 0 OR Price IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CPU_ID, GPU_ID... la khoa chinh rieng cua tung bang thong so.
-- Moi Product chi co MOT bang thong so dung Category. Import/API phai kiem tra;
-- UNIQUE ProductID chi rang buoc ben trong tung bang. 03-check-data.sql phat hien sai loai.
CREATE TABLE CPU (
    CPU_ID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL UNIQUE,
    Socket VARCHAR(30) NOT NULL,
    Core INT NOT NULL,
    Thread INT NOT NULL,
    TdpW INT NULL COMMENT 'Thong so nhiet cua hang, khong mac dinh la dien tieu thu toi da',
    HasIntegratedGPU BOOLEAN NOT NULL,
    HasBoxCooler BOOLEAN NOT NULL COMMENT 'Dung SKU dang nhap co kem tan CPU trong gia',
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    CONSTRAINT CK_CPU_Counts CHECK (Core > 0 AND Thread >= Core),
    CONSTRAINT CK_CPU_Tdp CHECK (TdpW IS NULL OR TdpW > 0),
    CONSTRAINT CK_CPU_Flags CHECK (HasIntegratedGPU IN (0, 1) AND HasBoxCooler IN (0, 1)),
    CONSTRAINT CK_CPU_Socket CHECK (CHAR_LENGTH(TRIM(Socket)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE GPU (
    GPU_ID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL UNIQUE,
    Chipset VARCHAR(100) NOT NULL,
    VramGb INT NOT NULL,
    RecommendedPsuW INT NOT NULL COMMENT 'Muc PSU khuyen nghi cua hang cho card nay',
    LengthMm DECIMAL(6,1) NULL,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    CONSTRAINT CK_GPU_Values CHECK (VramGb > 0 AND RecommendedPsuW > 0),
    CONSTRAINT CK_GPU_Length CHECK (LengthMm IS NULL OR LengthMm > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE RAM (
    RAM_ID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL UNIQUE,
    KitCapacityGb INT NOT NULL COMMENT 'Tong dung luong ca bo: 2x16GB = 32',
    ModuleCount INT NOT NULL COMMENT 'So thanh trong mot bo RAM',
    SpeedMTs INT NOT NULL,
    RamType VARCHAR(20) NOT NULL,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    CONSTRAINT CK_RAM_Kit CHECK (KitCapacityGb > 0 AND ModuleCount > 0 AND MOD(KitCapacityGb, ModuleCount) = 0),
    CONSTRAINT CK_RAM_Speed CHECK (SpeedMTs > 0),
    CONSTRAINT CK_RAM_Type CHECK (RamType IN ('DDR4', 'DDR5'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE SSD (
    SSD_ID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL UNIQUE,
    CapacityGb INT NOT NULL COMMENT 'Dung luong cong bo: 1TB = 1000GB',
    Interface VARCHAR(20) NOT NULL,
    FormFactor VARCHAR(30) NOT NULL,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    CONSTRAINT CK_SSD_Capacity CHECK (CapacityGb > 0),
    CONSTRAINT CK_SSD_Interface CHECK (Interface IN ('NVME', 'SATA')),
    CONSTRAINT CK_SSD_FormFactor CHECK (CHAR_LENGTH(TRIM(FormFactor)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE PSU (
    PSU_ID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL UNIQUE,
    Watt INT NOT NULL,
    FormFactor VARCHAR(20) NOT NULL,
    Efficiency VARCHAR(50) NULL,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    CONSTRAINT CK_PSU_Watt CHECK (Watt > 0),
    CONSTRAINT CK_PSU_FormFactor CHECK (FormFactor IN ('ATX', 'SFX', 'SFX_L'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Case` (
    Case_ID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL UNIQUE,
    MotherboardSupport VARCHAR(100) NOT NULL COMMENT 'Ma tach bang |, vi du ATX|MATX|MINI_ITX',
    GpuMaxLengthMm INT NULL,
    CoolerMaxHeightMm INT NULL,
    PsuFormFactor VARCHAR(20) NOT NULL,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    CONSTRAINT CK_Case_Mainboard CHECK (CHAR_LENGTH(TRIM(MotherboardSupport)) > 0),
    CONSTRAINT CK_Case_GPU CHECK (GpuMaxLengthMm IS NULL OR GpuMaxLengthMm > 0),
    CONSTRAINT CK_Case_Cooler CHECK (CoolerMaxHeightMm IS NULL OR CoolerMaxHeightMm > 0),
    CONSTRAINT CK_Case_PSU CHECK (PsuFormFactor IN ('ATX', 'SFX', 'SFX_L'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Mainboard (
    Mainboard_ID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL UNIQUE,
    Socket VARCHAR(30) NOT NULL,
    Chipset VARCHAR(50) NOT NULL,
    RamType VARCHAR(20) NOT NULL,
    MaxRamGb INT NOT NULL,
    RamSlots INT NOT NULL,
    SupportsNvme2280 BOOLEAN NOT NULL COMMENT 'Co it nhat mot khe ho tro SSD NVMe M.2 2280',
    HasDisplayOutput BOOLEAN NOT NULL,
    FormFactor VARCHAR(30) NOT NULL,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    CONSTRAINT CK_Mainboard_RAM CHECK (MaxRamGb > 0 AND RamSlots > 0 AND RamType IN ('DDR4', 'DDR5')),
    CONSTRAINT CK_Mainboard_Flags CHECK (SupportsNvme2280 IN (0, 1) AND HasDisplayOutput IN (0, 1)),
    CONSTRAINT CK_Mainboard_FormFactor CHECK (FormFactor IN ('ATX', 'MATX', 'MINI_ITX')),
    CONSTRAINT CK_Mainboard_Socket CHECK (CHAR_LENGTH(TRIM(Socket)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Cooler (
    CoolerID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL UNIQUE,
    SocketSupport VARCHAR(255) NOT NULL COMMENT 'Ma tach bang |, vi du AM4|AM5|LGA1700',
    HeightMm INT NOT NULL COMMENT 'Ban demo chi thu thap tan khi',
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    CONSTRAINT CK_Cooler_Height CHECK (HeightMm > 0),
    CONSTRAINT CK_Cooler_Sockets CHECK (CHAR_LENGTH(TRIM(SocketSupport)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Mot bai do cho moi CPU/GPU trong pham vi demo. Diem THO, chua phai diem DSS.
-- Tat ca CPU dung cung bai do/phien ban; GPU dung cung bai do/phien ban rieng.
CREATE TABLE Benchmark (
    BenchmarkID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL UNIQUE,
    TestName VARCHAR(150) NOT NULL,
    TestVersion VARCHAR(50) NOT NULL,
    RawScore DECIMAL(14,4) NOT NULL COMMENT 'Chi chon bai do co diem cao hon la tot hon',
    SourceUrl VARCHAR(1000) NOT NULL,
    CheckedAt DATE NOT NULL COMMENT 'Ngay nhom thu thap ket qua, khong phai ngay chay bai do',
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    CONSTRAINT CK_Benchmark_Score CHECK (RawScore > 0),
    CONSTRAINT CK_Benchmark_Metadata CHECK (
        CHAR_LENGTH(TRIM(TestName)) > 0 AND CHAR_LENGTH(TRIM(TestVersion)) > 0
        AND CHAR_LENGTH(TRIM(SourceUrl)) > 0
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Requirement (
    RequirementID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NULL COMMENT 'Khach khong can dang nhap',
    Budget DECIMAL(15,0) NOT NULL,
    Purpose VARCHAR(20) NOT NULL,
    CreatedTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT CK_Requirement_Budget CHECK (Budget > 0),
    CONSTRAINT CK_Requirement_Purpose CHECK (Purpose IN ('Office', 'Gaming'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Recommendation (
    RecommendationID INT AUTO_INCREMENT PRIMARY KEY,
    RequirementID INT NOT NULL,
    CPU_ID INT NOT NULL,
    GPU_ID INT NULL COMMENT 'Co the bo GPU roi cho Office neu CPU co iGPU',
    SSD_ID INT NOT NULL,
    RAM_ID INT NOT NULL,
    Mainboard_ID INT NOT NULL,
    PSU_ID INT NOT NULL,
    Case_ID INT NOT NULL,
    CoolerID INT NULL COMMENT 'Chi duoc bo khi dung CPU co tan kem hop da xac minh',
    TotalPrice DECIMAL(15,0) NOT NULL COMMENT 'Tong gia tai thoi diem de xuat',
    Score DECIMAL(7,4) NOT NULL COMMENT 'Diem DSS 0..100 do ung dung tinh',
    Reason TEXT NOT NULL,
    `Rank` INT NOT NULL,
    CreatedTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RequirementID) REFERENCES Requirement(RequirementID),
    FOREIGN KEY (CPU_ID) REFERENCES CPU(CPU_ID),
    FOREIGN KEY (GPU_ID) REFERENCES GPU(GPU_ID),
    FOREIGN KEY (RAM_ID) REFERENCES RAM(RAM_ID),
    FOREIGN KEY (SSD_ID) REFERENCES SSD(SSD_ID),
    FOREIGN KEY (Mainboard_ID) REFERENCES Mainboard(Mainboard_ID),
    FOREIGN KEY (PSU_ID) REFERENCES PSU(PSU_ID),
    FOREIGN KEY (Case_ID) REFERENCES `Case`(Case_ID),
    FOREIGN KEY (CoolerID) REFERENCES Cooler(CoolerID),
    UNIQUE KEY UX_Recommendation_Requirement_Rank (RequirementID, `Rank`),
    CONSTRAINT CK_Recommendation_Price CHECK (TotalPrice > 0),
    CONSTRAINT CK_Recommendation_Score CHECK (Score BETWEEN 0 AND 100),
    CONSTRAINT CK_Recommendation_Rank CHECK (`Rank` BETWEEN 1 AND 3),
    CONSTRAINT CK_Recommendation_Reason CHECK (CHAR_LENGTH(TRIM(Reason)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Du lieu khoi tao: 8 danh muc va 10 thuong hieu.
-- Chua bao gom san pham, gia hoac benchmark.
START TRANSACTION;
INSERT INTO Categories (CategoryName) VALUES
    ('CPU'), ('GPU'), ('RAM'), ('SSD'), ('Mainboard'), ('PSU'), ('Case'), ('Cooler');

INSERT INTO Brands (BrandName) VALUES
    ('AMD'), ('Intel'), ('ASUS'), ('Gigabyte'), ('MSI'),
    ('Kingston'), ('Corsair'), ('DeepCool'), ('Crucial'), ('ASRock');
COMMIT;
