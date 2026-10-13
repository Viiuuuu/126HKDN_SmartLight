
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'dbSmartLight')
BEGIN
    USE master
    ALTER DATABASE dbSmartLight SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE dbSmartLight
END;
GO

CREATE DATABASE dbSmartLight
GO
USE dbSmartLight
GO
-- ============================================================
-- PHẦN 1: TẠO CÁC BẢNG
-- ============================================================
-- 1. Khu vuc
CREATE TABLE KhuVuc (
    maKhuVuc CHAR(5) PRIMARY KEY,
    tenPhuongXa NVARCHAR(100) NOT NULL,
    moTa NVARCHAR(255),
    daXoa BIT NOT NULL DEFAULT 0,
    ngayTao DATETIME NOT NULL DEFAULT GETDATE(),
    ngayCapNhat DATETIME,
    CONSTRAINT CK_KhuVuc_Ten CHECK (LEN(LTRIM(RTRIM(tenPhuongXa))) > 0)
);

-- 2. Tu chieu sang
CREATE TABLE TuChieuSang (
    maTu CHAR(10) PRIMARY KEY,
    tenTu NVARCHAR(100) NOT NULL,
    diaChi NVARCHAR(255) NOT NULL,
    viDo DECIMAL(10,7) CHECK (viDo BETWEEN -90 AND 90),
    kinhDo DECIMAL(10,7) CHECK (kinhDo BETWEEN -180 AND 180),
    trangThaiKetNoi BIT NOT NULL DEFAULT 0,  -- 0: Offline, 1: Online
    trangThaiNguon VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN'
        CHECK (trangThaiNguon IN ('ON', 'OFF', 'UNKNOWN')),
    lanKetNoiCuoi DATETIME,
    cheDoVanHanh TINYINT NOT NULL DEFAULT 0
        CHECK (cheDoVanHanh IN (0,1,2)), -- 0: Chua xac dinh, 1: Thu cong, 2: Tu dong
    maThietBi VARCHAR(50),             -- Dinh danh thiet bi that / simulator, neu co
    moTa NVARCHAR(255),
    daXoa BIT NOT NULL DEFAULT 0,
    ngayTao DATETIME NOT NULL DEFAULT GETDATE(),
    ngayCapNhat DATETIME,
    maKhuVuc CHAR(5) NOT NULL FOREIGN KEY REFERENCES KhuVuc(maKhuVuc),
    CONSTRAINT CK_Tu_ToaDo CHECK (
        (viDo IS NULL AND kinhDo IS NULL)
        OR (viDo IS NOT NULL AND kinhDo IS NOT NULL)
    ),
    CONSTRAINT CK_Tu_Ten CHECK (LEN(LTRIM(RTRIM(tenTu))) > 0),
    CONSTRAINT CK_Tu_DiaChi CHECK (LEN(LTRIM(RTRIM(diaChi))) > 0)
);
GO
CREATE UNIQUE INDEX UX_Tu_MaThietBi ON TuChieuSang(maThietBi)
WHERE maThietBi IS NOT NULL;
GO

-- 3. Du lieu giam sat tu: moi ban ghi la mot lan do
CREATE TABLE DuLieuGiamSatTu (
    maDuLieu BIGINT IDENTITY(1,1) PRIMARY KEY,
    dienApPha1 DECIMAL(6,2) CHECK (dienApPha1 >= 0),
    dienApPha2 DECIMAL(6,2) CHECK (dienApPha2 >= 0),
    dienApPha3 DECIMAL(6,2) CHECK (dienApPha3 >= 0),
    dongDienPha1 DECIMAL(7,2) CHECK (dongDienPha1 >= 0),
    dongDienPha2 DECIMAL(7,2) CHECK (dongDienPha2 >= 0),
    dongDienPha3 DECIMAL(7,2) CHECK (dongDienPha3 >= 0),
    congSuat DECIMAL(10,3) CHECK (congSuat >= 0), -- kW
    dienNang DECIMAL(15,3) CHECK (dienNang >= 0), -- kWh, chi so tich luy
    thoiGianDo DATETIME NOT NULL DEFAULT GETDATE(),
    maTu CHAR(10) NOT NULL FOREIGN KEY REFERENCES TuChieuSang(maTu)
);
GO
CREATE INDEX IX_DuLieuGiamSatTu_MaTu_ThoiGian
ON DuLieuGiamSatTu(maTu, thoiGianDo DESC);
GO

-- 4. Tuyen chieu sang: moi tu co nhieu tuyen
CREATE TABLE TuyenChieuSang (
    maTuyen CHAR(10) PRIMARY KEY,
    tenTuyen NVARCHAR(100) NOT NULL,
    viTri NVARCHAR(255) NOT NULL,
    trangThaiHoatDong TINYINT NOT NULL DEFAULT 0
        CHECK (trangThaiHoatDong IN (0,1,2,3)), -- 0: Chua XD, 1: Hoat dong, 2: Dung, 3: Su co
    moTa NVARCHAR(255),
    chieuDai INT CHECK (chieuDai > 0),   -- met; de NULL neu chua co
    mucSangHienTai TINYINT CHECK (mucSangHienTai BETWEEN 0 AND 100),
    daXoa BIT NOT NULL DEFAULT 0,
    ngayTao DATETIME NOT NULL DEFAULT GETDATE(),
    ngayCapNhat DATETIME,
    maTu CHAR(10) NOT NULL FOREIGN KEY REFERENCES TuChieuSang(maTu),
    CONSTRAINT CK_Tuyen_Ten CHECK (LEN(LTRIM(RTRIM(tenTuyen))) > 0),
    CONSTRAINT CK_Tuyen_ViTri CHECK (LEN(LTRIM(RTRIM(viTri))) > 0)
);

-- 5. Diem den: moi diem den thuoc mot tuyen
CREATE TABLE DiemDen (
    maDen CHAR(10) PRIMARY KEY,
    tenDen NVARCHAR(100) NOT NULL,
    loaiBongDen NVARCHAR(50),
    viTri NVARCHAR(255) NOT NULL,
    viDo DECIMAL(10,7) CHECK (viDo BETWEEN -90 AND 90),
    kinhDo DECIMAL(10,7) CHECK (kinhDo BETWEEN -180 AND 180),
    congSuat DECIMAL(8,2) CHECK (congSuat > 0), -- cong suat dinh muc (W)
    -- Thong so moi nhat (snapshot); lich su luu tai DuLieuGiamSatDen
    dienAp DECIMAL(6,2) CHECK (dienAp >= 0),
    dongDien DECIMAL(7,3) CHECK (dongDien >= 0),
    congSuatThucTe DECIMAL(8,2) CHECK (congSuatThucTe >= 0),
    nhietDoLed DECIMAL(5,2) CHECK (nhietDoLed BETWEEN -40 AND 150),
    lanDoCuoi DATETIME,
    doSang TINYINT CHECK (doSang BETWEEN 0 AND 100),
    trangThaiHoatDong TINYINT NOT NULL DEFAULT 0
        CHECK (trangThaiHoatDong IN (0,1,2,3)), -- 0: Chua XD, 1: Bat, 2: Tat, 3: Su co
    moTa NVARCHAR(255),
    daXoa BIT NOT NULL DEFAULT 0,
    ngayTao DATETIME NOT NULL DEFAULT GETDATE(),
    ngayCapNhat DATETIME,
    maTuyen CHAR(10) NOT NULL FOREIGN KEY REFERENCES TuyenChieuSang(maTuyen),
    CONSTRAINT CK_DiemDen_ToaDo CHECK (
        (viDo IS NULL AND kinhDo IS NULL)
        OR (viDo IS NOT NULL AND kinhDo IS NOT NULL)
    ),
    CONSTRAINT CK_DiemDen_Ten CHECK (LEN(LTRIM(RTRIM(tenDen))) > 0),
    CONSTRAINT CK_DiemDen_ViTri CHECK (LEN(LTRIM(RTRIM(viTri))) > 0)
);

-- 6. Vai tro
CREATE TABLE VaiTro (
    maVaiTro INT IDENTITY(1,1) PRIMARY KEY,
    tenVaiTro NVARCHAR(50) NOT NULL UNIQUE,
    moTa NVARCHAR(255),
    daXoa BIT NOT NULL DEFAULT 0,
    ngayTao DATETIME NOT NULL DEFAULT GETDATE(),
    ngayCapNhat DATETIME
);

-- 7. Quyen han
CREATE TABLE QuyenHan (
    maQuyenHan INT IDENTITY(1,1) PRIMARY KEY,
    tenQuyenHan NVARCHAR(100) NOT NULL UNIQUE,
    moTa NVARCHAR(255),
    daXoa BIT NOT NULL DEFAULT 0,
    ngayTao DATETIME NOT NULL DEFAULT GETDATE(),
    ngayCapNhat DATETIME
);

-- 8. Vai tro - Quyen han: co ban ghi = co quyen xem
CREATE TABLE VaiTro_QuyenHan (
    maQuyenHan INT NOT NULL,
    maVaiTro INT NOT NULL,
    duocCapNhat BIT NOT NULL DEFAULT 0, -- 0: Chi xem, 1: Duoc them/sua theo chuc nang
    PRIMARY KEY (maQuyenHan, maVaiTro),
    FOREIGN KEY (maQuyenHan) REFERENCES QuyenHan(maQuyenHan),
    FOREIGN KEY (maVaiTro) REFERENCES VaiTro(maVaiTro)
);

-- 9. Nguoi dung
CREATE TABLE NguoiDung (
    maNguoiDung CHAR(6) PRIMARY KEY,
    tenDangNhap VARCHAR(50) NOT NULL UNIQUE,
    matKhau VARCHAR(255) NOT NULL, -- chi luu password hash
    hoTen NVARCHAR(100) NOT NULL,
    ngaySinh DATE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email LIKE '%_@_%._%'),
    soDienThoai VARCHAR(15) NOT NULL UNIQUE,
    trangThaiTaiKhoan TINYINT NOT NULL DEFAULT 1
        CHECK (trangThaiTaiKhoan IN (0,1,2)), -- 0: Nghi, 1: Hoat dong, 2: Khoa
    lanDangNhapCuoi DATETIME,
    daXoa BIT NOT NULL DEFAULT 0,
    ngayTao DATETIME NOT NULL DEFAULT GETDATE(),
    ngayCapNhat DATETIME,
    maVaiTro INT NOT NULL FOREIGN KEY REFERENCES VaiTro(maVaiTro),
    maKhuVuc CHAR(5) FOREIGN KEY REFERENCES KhuVuc(maKhuVuc)
);

-- 10. Phien dang nhap
CREATE TABLE PhienDangNhap (
    maPhien BIGINT IDENTITY(1,1) PRIMARY KEY,
    maRefreshToken VARCHAR(64) NOT NULL UNIQUE, -- bam SHA-256 dang HEX
    thoiGianDangNhap DATETIME NOT NULL DEFAULT GETDATE(),
    thoiGianHetHan DATETIME NOT NULL,
    thoiGianDangXuat DATETIME,
    daThuHoi BIT NOT NULL DEFAULT 0,
	-- 0: Phiên chưa bị thu hồi
    -- 1: Phiên đã bị thu hồi
    maNguoiDung CHAR(6) NOT NULL FOREIGN KEY REFERENCES NguoiDung(maNguoiDung),
    CONSTRAINT CK_Phien_HetHan CHECK (thoiGianHetHan > thoiGianDangNhap),
    CONSTRAINT CK_Phien_DangXuat CHECK (
        thoiGianDangXuat IS NULL OR thoiGianDangXuat >= thoiGianDangNhap
    )
);

-- 11. Du lieu giam sat diem den: lich su do luong
CREATE TABLE DuLieuGiamSatDen (
    maDuLieu BIGINT IDENTITY(1,1) PRIMARY KEY,
    maDen CHAR(10) NOT NULL FOREIGN KEY REFERENCES DiemDen(maDen),
    dienAp DECIMAL(6,2) CHECK (dienAp >= 0),
    dongDien DECIMAL(7,3) CHECK (dongDien >= 0),
    congSuatThucTe DECIMAL(8,2) CHECK (congSuatThucTe >= 0),
    nhietDoLed DECIMAL(5,2) CHECK (nhietDoLed BETWEEN -40 AND 150),
    doSang TINYINT CHECK (doSang BETWEEN 0 AND 100),
    thoiGianDo DATETIME NOT NULL DEFAULT GETDATE()
);
GO
CREATE INDEX IX_GiamSatDen_MaDen_ThoiGian
ON DuLieuGiamSatDen(maDen, thoiGianDo DESC);
GO

-- 12. Lich van hanh: lich ap dung cho mot tu HOAC mot tuyen HOAC mot den
CREATE TABLE LichVanHanh (
    maLich INT IDENTITY(1,1) PRIMARY KEY,
    tenLich NVARCHAR(100) NOT NULL,
    ngayBatDau DATE NOT NULL,
    ngayKetThuc DATE,
    dangApDung BIT NOT NULL DEFAULT 0,
    maTu CHAR(10) FOREIGN KEY REFERENCES TuChieuSang(maTu),
    maTuyen CHAR(10) FOREIGN KEY REFERENCES TuyenChieuSang(maTuyen),
    maDen CHAR(10) FOREIGN KEY REFERENCES DiemDen(maDen),
    maNguoiTao CHAR(6) FOREIGN KEY REFERENCES NguoiDung(maNguoiDung),
    ngayTao DATETIME NOT NULL DEFAULT GETDATE(),
    ngayCapNhat DATETIME,
    CONSTRAINT CK_Lich_Ngay CHECK (ngayKetThuc IS NULL OR ngayKetThuc >= ngayBatDau),
    CONSTRAINT CK_Lich_DoiTuong CHECK (
        (CASE WHEN maTu IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN maTuyen IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN maDen IS NULL THEN 0 ELSE 1 END) = 1
    )
);

-- 13. Chi tiet lich: mot lich co nhieu moc gio bat/tat/DIM
CREATE TABLE ChiTietLichVanHanh (
    maChiTiet INT IDENTITY(1,1) PRIMARY KEY,
    maLich INT NOT NULL FOREIGN KEY REFERENCES LichVanHanh(maLich),
    thuTrongTuan TINYINT CHECK (thuTrongTuan BETWEEN 1 AND 7),
    -- NULL: Moi ngay; 1: Thu Hai ... 7: Chu Nhat
    gioThucHien TIME(0) NOT NULL,
    hanhDong VARCHAR(10) NOT NULL
        CHECK (hanhDong IN ('BAT', 'TAT', 'DIM')),
    mucSang TINYINT CHECK (mucSang BETWEEN 0 AND 100),
    CONSTRAINT CK_ChiTietLich_MucSang CHECK (
        (hanhDong = 'DIM' AND mucSang IS NOT NULL)
        OR (hanhDong IN ('BAT', 'TAT') AND mucSang IS NULL)
    )
);

-- 14. Lenh dieu khien: luu lenh va phan hoi tu thiet bi/simulator
CREATE TABLE LenhDieuKhien (
    maLenh BIGINT IDENTITY(1,1) PRIMARY KEY,
    maTu CHAR(10) FOREIGN KEY REFERENCES TuChieuSang(maTu),
    maTuyen CHAR(10) FOREIGN KEY REFERENCES TuyenChieuSang(maTuyen),
    maDen CHAR(10) FOREIGN KEY REFERENCES DiemDen(maDen),
    hanhDong VARCHAR(10) NOT NULL
        CHECK (hanhDong IN ('BAT', 'TAT', 'DIM')),
    mucSang TINYINT CHECK (mucSang BETWEEN 0 AND 100),
    nguonLenh TINYINT NOT NULL DEFAULT 1
        CHECK (nguonLenh IN (1,2)), -- 1: Thu cong, 2: Tu lich
    trangThaiLenh TINYINT NOT NULL DEFAULT 0
        CHECK (trangThaiLenh IN (0,1,2,3,4)),
    -- 0: Cho gui, 1: Da gui, 2: Thanh cong, 3: That bai, 4: Qua han
    thoiGianTao DATETIME NOT NULL DEFAULT GETDATE(),
    thoiGianGui DATETIME,
    thoiGianPhanHoi DATETIME,
    noiDungPhanHoi NVARCHAR(255),
    maNguoiDung CHAR(6) FOREIGN KEY REFERENCES NguoiDung(maNguoiDung),
    maLich INT FOREIGN KEY REFERENCES LichVanHanh(maLich),
    CONSTRAINT CK_Lenh_DoiTuong CHECK (
        (CASE WHEN maTu IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN maTuyen IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN maDen IS NULL THEN 0 ELSE 1 END) = 1
    ),
    CONSTRAINT CK_Lenh_MucSang CHECK (
        (hanhDong = 'DIM' AND mucSang IS NOT NULL)
        OR (hanhDong IN ('BAT', 'TAT') AND mucSang IS NULL)
    ),
    CONSTRAINT CK_Lenh_Nguon CHECK (
        (nguonLenh = 1 AND maNguoiDung IS NOT NULL AND maLich IS NULL)
        OR (nguonLenh = 2 AND maLich IS NOT NULL)
    )
);
GO
CREATE INDEX IX_Lenh_ThoiGian ON LenhDieuKhien(thoiGianTao DESC);
GO

-- 15. Cau hinh canh bao: quy tac canh bao don gian
CREATE TABLE CauHinhCanhBao (
    maCauHinh INT IDENTITY(1,1) PRIMARY KEY,
    tenCanhBao NVARCHAR(100) NOT NULL,
    loaiCanhBao VARCHAR(30) NOT NULL
        CHECK (loaiCanhBao IN ('MAT_KET_NOI', 'KHONG_PHAN_HOI', 'QUA_NHIET')),
    nguongGiaTri DECIMAL(10,2) CHECK (nguongGiaTri > 0),
    -- MAT_KET_NOI/KHONG_PHAN_HOI: so giay; QUA_NHIET: do C
    mucDo TINYINT NOT NULL DEFAULT 1 CHECK (mucDo IN (1,2,3)),
    dangBat BIT NOT NULL DEFAULT 1,
    ngayTao DATETIME NOT NULL DEFAULT GETDATE(),
    ngayCapNhat DATETIME,
    CONSTRAINT CK_CauHinh_Nguong CHECK (nguongGiaTri IS NOT NULL)
);

-- 16. Canh bao: tham chieu den mot doi tuong (tu, tuyen, diem den)
CREATE TABLE CanhBao (
    maCanhBao BIGINT IDENTITY(1,1) PRIMARY KEY,
    maCauHinh INT FOREIGN KEY REFERENCES CauHinhCanhBao(maCauHinh),
    maTu CHAR(10) FOREIGN KEY REFERENCES TuChieuSang(maTu),
    maTuyen CHAR(10) FOREIGN KEY REFERENCES TuyenChieuSang(maTuyen),
    maDen CHAR(10) FOREIGN KEY REFERENCES DiemDen(maDen),
    noiDung NVARCHAR(255) NOT NULL,
    mucDo TINYINT NOT NULL DEFAULT 1 CHECK (mucDo IN (1,2,3)),
    trangThaiXuLy TINYINT NOT NULL DEFAULT 0
        CHECK (trangThaiXuLy IN (0,1,2)), -- 0: Moi, 1: Dang xu ly, 2: Da xu ly
    thoiGianPhatSinh DATETIME NOT NULL DEFAULT GETDATE(),
    thoiGianXuLy DATETIME,
    ghiChuXuLy NVARCHAR(255),
    maNguoiXuLy CHAR(6) FOREIGN KEY REFERENCES NguoiDung(maNguoiDung),
    CONSTRAINT CK_CanhBao_DoiTuong CHECK (
        (CASE WHEN maTu IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN maTuyen IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN maDen IS NULL THEN 0 ELSE 1 END) = 1
    ),
    CONSTRAINT CK_CanhBao_ThoiGian CHECK (
        thoiGianXuLy IS NULL OR thoiGianXuLy >= thoiGianPhatSinh
    )
);
GO
CREATE INDEX IX_CanhBao_ThoiGian ON CanhBao(thoiGianPhatSinh DESC);
GO

-- 17. Nhat ky he thong: khong xoa mem, chi cho phep truy van qua ung dung
CREATE TABLE NhatKyHeThong (
    maNhatKy BIGINT IDENTITY(1,1) PRIMARY KEY,
    maNguoiDung CHAR(6) FOREIGN KEY REFERENCES NguoiDung(maNguoiDung),
    hanhDong NVARCHAR(100) NOT NULL,
    doiTuong NVARCHAR(100),
    maDoiTuong VARCHAR(20),
    noiDung NVARCHAR(500),
    ketQua TINYINT NOT NULL DEFAULT 1 CHECK (ketQua IN (0,1)), -- 0: Loi, 1: Thanh cong
    thoiGian DATETIME NOT NULL DEFAULT GETDATE()
);
GO
CREATE INDEX IX_NhatKy_ThoiGian ON NhatKyHeThong(thoiGian DESC);
GO
