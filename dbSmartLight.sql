
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
    dangBat BIT NOT NULL DEFAULT 1,--ĐANG BẬT
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
-- ============================================================
-- PHẦN 2: CHÈN DỮ LIỆU
-- ============================================================
-- 1. KHU VUC: ten phuong hien hanh theo NQ 1659/NQ-UBTVQH15
INSERT INTO KhuVuc(maKhuVuc,tenPhuongXa,moTa)
SELECT v.ma, v.ten, N'Dữ liệu mẫu phục vụ kiểm thử tại thành phố Đà Nẵng'
FROM (VALUES
 ('KV001',N'Phường Hải Châu'),
 ('KV002',N'Phường Hòa Cường'),
 ('KV003',N'Phường Thanh Khê'),
 ('KV004',N'Phường An Hải')
) v(ma,ten)
WHERE NOT EXISTS (SELECT 1 FROM KhuVuc k WHERE k.maKhuVuc=v.ma);

-- 2. TU CHIEU SANG: toa do MINH HOA GAN DUNG, khong phai so lieu lap dat thuc
INSERT INTO TuChieuSang
(maTu,tenTu,diaChi,viDo,kinhDo,trangThaiKetNoi,trangThaiNguon,
 lanKetNoiCuoi,cheDoVanHanh,maThietBi,moTa,maKhuVuc)
SELECT v.ma,v.ten,v.diaChi,v.viDo,v.kinhDo,v.ketNoi,v.nguon,
       CASE WHEN v.ketNoi=1 THEN GETDATE() ELSE NULL END,
       v.cheDo,v.thietBi,N'Tủ mô phỏng phục vụ đồ án SmartLight',v.khu
FROM (VALUES
 ('TC00001',N'Tủ Bạch Đằng 01',N'Đường Bạch Đằng, phường Hải Châu, Đà Nẵng',CAST(16.0675000 AS DECIMAL(10,7)),CAST(108.2235000 AS DECIMAL(10,7)),1,'ON',2,'SIM-TU-001','KV001'),
 ('TC00002',N'Tủ 2 Tháng 9 01',N'Đường 2 Tháng 9, phường Hòa Cường, Đà Nẵng',CAST(16.0427000 AS DECIMAL(10,7)),CAST(108.2210000 AS DECIMAL(10,7)),1,'ON',2,'SIM-TU-002','KV002'),
 ('TC00003',N'Tủ Điện Biên Phủ 01',N'Đường Điện Biên Phủ, phường Thanh Khê, Đà Nẵng',CAST(16.0655000 AS DECIMAL(10,7)),CAST(108.1935000 AS DECIMAL(10,7)),0,'UNKNOWN',0,'SIM-TU-003','KV003'),
 ('TC00004',N'Tủ Võ Nguyên Giáp 01',N'Đường Võ Nguyên Giáp, phường An Hải, Đà Nẵng',CAST(16.0680000 AS DECIMAL(10,7)),CAST(108.2450000 AS DECIMAL(10,7)),1,'ON',1,'SIM-TU-004','KV004')
) v(ma,ten,diaChi,viDo,kinhDo,ketNoi,nguon,cheDo,thietBi,khu)
WHERE NOT EXISTS (SELECT 1 FROM TuChieuSang t WHERE t.maTu=v.ma);

-- 3. TUYEN CHIEU SANG: moi tu co the quan ly nhieu tuyen
INSERT INTO TuyenChieuSang
(maTuyen,tenTuyen,viTri,trangThaiHoatDong,chieuDai,mucSangHienTai,maTu)
SELECT v.ma,v.ten,v.viTri,v.trangThai,v.chieuDai,v.mucSang,v.maTu
FROM (VALUES
 ('TCS00001',N'Tuyến Bạch Đằng A',N'Đoạn mô phỏng trên đường Bạch Đằng',1,500,100,'TC00001'),
 ('TCS00002',N'Tuyến Bạch Đằng B',N'Đoạn mô phỏng thứ hai trên đường Bạch Đằng',1,400,70,'TC00001'),
 ('TCS00003',N'Tuyến 2 Tháng 9',N'Đoạn mô phỏng trên đường 2 Tháng 9',1,600,100,'TC00002'),
 ('TCS00004',N'Tuyến Điện Biên Phủ',N'Đoạn mô phỏng trên đường Điện Biên Phủ',0,450,NULL,'TC00003'),
 ('TCS00005',N'Tuyến Võ Nguyên Giáp',N'Đoạn mô phỏng trên đường Võ Nguyên Giáp',1,550,80,'TC00004')
) v(ma,ten,viTri,trangThai,chieuDai,mucSang,maTu)
WHERE NOT EXISTS (SELECT 1 FROM TuyenChieuSang t WHERE t.maTuyen=v.ma);

-- 4. DIEM DEN: 2 diem / tuyen tai mot vai tuyen de test nhom va theo doi
-- Toa do gan dung de demo ban do; du lieu do (dien ap, nhiet do...) la gia lap.
INSERT INTO DiemDen
(maDen,tenDen,loaiBongDen,viTri,viDo,kinhDo,congSuat,
 dienAp,dongDien,congSuatThucTe,nhietDoLed,lanDoCuoi,doSang,trangThaiHoatDong,maTuyen)
SELECT v.ma,v.ten,N'LED',v.viTri,v.viDo,v.kinhDo,v.cs,
 v.dienAp,v.dongDien,v.csThucTe,v.nhietDo,
 CASE WHEN v.dienAp IS NOT NULL THEN GETDATE() ELSE NULL END,
 v.doSang,v.trangThai,v.maTuyen
FROM (VALUES
 ('DEN00001',N'Đèn Bạch Đằng 01',N'Đường Bạch Đằng',CAST(16.0675000 AS DECIMAL(10,7)),CAST(108.2235000 AS DECIMAL(10,7)),120.00,224.60,0.540,96.00,41.50,100,1,'TCS00001'),
 ('DEN00002',N'Đèn Bạch Đằng 02',N'Đường Bạch Đằng',CAST(16.0680000 AS DECIMAL(10,7)),CAST(108.2237000 AS DECIMAL(10,7)),120.00,223.80,0.510,85.00,40.00,100,1,'TCS00001'),
 ('DEN00003',N'Đèn Bạch Đằng 03',N'Đường Bạch Đằng',CAST(16.0685000 AS DECIMAL(10,7)),CAST(108.2239000 AS DECIMAL(10,7)),100.00,220.00,0.350,65.00,39.50,70,1,'TCS00002'),
 ('DEN00004',N'Đèn 2 Tháng 9 01',N'Đường 2 Tháng 9',CAST(16.0427000 AS DECIMAL(10,7)),CAST(108.2210000 AS DECIMAL(10,7)),150.00,230.00,0.650,130.00,42.00,100,1,'TCS00003'),
 ('DEN00005',N'Đèn 2 Tháng 9 02',N'Đường 2 Tháng 9',CAST(16.0432000 AS DECIMAL(10,7)),CAST(108.2211000 AS DECIMAL(10,7)),150.00,229.00,0.590,115.00,44.00,100,1,'TCS00003'),
 ('DEN00006',N'Đèn Điện Biên Phủ 01',N'Đường Điện Biên Phủ',CAST(16.0655000 AS DECIMAL(10,7)),CAST(108.1935000 AS DECIMAL(10,7)),100.00,NULL,NULL,NULL,NULL,NULL,0,'TCS00004'),
 ('DEN00007',N'Đèn Võ Nguyên Giáp 01',N'Đường Võ Nguyên Giáp',CAST(16.0680000 AS DECIMAL(10,7)),CAST(108.2450000 AS DECIMAL(10,7)),120.00,223.00,0.450,90.00,41.00,80,1,'TCS00005'),
 ('DEN00008',N'Đèn Võ Nguyên Giáp 02',N'Đường Võ Nguyên Giáp',CAST(16.0685000 AS DECIMAL(10,7)),CAST(108.2452000 AS DECIMAL(10,7)),120.00,222.00,0.440,88.00,42.00,80,1,'TCS00005')
) v(ma,ten,viTri,viDo,kinhDo,cs,dienAp,dongDien,csThucTe,nhietDo,doSang,trangThai,maTuyen)
WHERE NOT EXISTS (SELECT 1 FROM DiemDen d WHERE d.maDen=v.ma);

-- 5. VAI TRO
INSERT INTO VaiTro(tenVaiTro,moTa)
SELECT v.ten,v.moTa FROM (VALUES
 (N'Quản trị viên',N'Quản lý tài khoản, thiết bị và hệ thống'),
 (N'Nhân viên vận hành',N'Giám sát và điều khiển chiếu sáng'),
 (N'Nhân viên kỹ thuật',N'Kiểm tra và xử lý cảnh báo')
) v(ten,moTa)
WHERE NOT EXISTS (SELECT 1 FROM VaiTro x WHERE x.tenVaiTro=v.ten);

-- 6. QUYEN HAN: danh muc chuc nang, mac dinh co dong phan quyen = duoc xem
INSERT INTO QuyenHan(tenQuyenHan,moTa)
SELECT v.ten,v.moTa FROM (VALUES
 (N'Quản lý khu vực',N'Tra cứu và cập nhật khu vực'),
 (N'Quản lý tủ chiếu sáng',N'Tra cứu và cập nhật tủ'),
 (N'Quản lý tuyến chiếu sáng',N'Tra cứu và cập nhật tuyến'),
 (N'Quản lý điểm đèn',N'Tra cứu và cập nhật điểm đèn'),
 (N'Quản lý người dùng',N'Tài khoản và phân quyền'),
 (N'Giám sát và cảnh báo',N'Xem trạng thái, sự cố và cảnh báo'),
 (N'Lịch vận hành',N'Tra cứu và thiết lập lịch'),
 (N'Báo cáo thống kê',N'Xem báo cáo')
) v(ten,moTa)
WHERE NOT EXISTS (SELECT 1 FROM QuyenHan q WHERE q.tenQuyenHan=v.ten);

-- 7. VAI TRO - QUYEN HAN (1: duoc them/sua du lieu; 0: chi xem)
-- Quyen dieu khien thiet bi can duoc kiem soat RIENG trong Backend.
INSERT INTO VaiTro_QuyenHan(maVaiTro,maQuyenHan,duocCapNhat)
SELECT r.maVaiTro,q.maQuyenHan,
 CASE WHEN r.tenVaiTro=N'Quản trị viên' THEN 1
      WHEN r.tenVaiTro=N'Nhân viên vận hành' AND q.tenQuyenHan=N'Lịch vận hành' THEN 1
      WHEN r.tenVaiTro=N'Nhân viên kỹ thuật' AND q.tenQuyenHan=N'Giám sát và cảnh báo' THEN 1
      ELSE 0 END
FROM VaiTro r CROSS JOIN QuyenHan q
WHERE (
 (r.tenVaiTro=N'Quản trị viên')
 OR (r.tenVaiTro=N'Nhân viên vận hành' AND q.tenQuyenHan IN
  (N'Quản lý khu vực',N'Quản lý tủ chiếu sáng',N'Quản lý tuyến chiếu sáng',N'Quản lý điểm đèn',N'Giám sát và cảnh báo',N'Lịch vận hành',N'Báo cáo thống kê'))
 OR (r.tenVaiTro=N'Nhân viên kỹ thuật' AND q.tenQuyenHan IN
  (N'Quản lý tủ chiếu sáng',N'Quản lý tuyến chiếu sáng',N'Quản lý điểm đèn',N'Giám sát và cảnh báo'))
)
AND NOT EXISTS (
 SELECT 1 FROM VaiTro_QuyenHan x
 WHERE x.maVaiTro=r.maVaiTro AND x.maQuyenHan=q.maQuyenHan
);

-- 8. NGUOI DUNG: hash ASP.NET Core Identity V3 (PBKDF2-SHA512, 100.000 vong)
-- Ba tai khoan demo co cung mat khau SmartLight@2026; doi ngay truoc khi dua len mang.
DECLARE @Hash VARCHAR(255)='AQAAAAIAAYagAAAAEFJPs71YNE08zPEc51kclvdoBPPghPhfTV2W2F+bpbfSJnlYS21nMKZSTxLR1BcqWg==';
INSERT INTO NguoiDung
(maNguoiDung,tenDangNhap,matKhau,hoTen,ngaySinh,email,soDienThoai,maVaiTro,maKhuVuc)
SELECT v.ma,v.tenDangNhap,@Hash,v.hoTen,CONVERT(DATE,v.ngaySinh),v.email,v.sdt,r.maVaiTro,v.maKhuVuc
FROM (VALUES
 ('ND0001','admin_demo',N'QTV Demo','2000-01-01','admin.demo@smartlight.example','0900000001',N'Quản trị viên',NULL),
 ('ND0002','vanhanh_demo',N'NVVH Demo','2001-02-15','vanhanh.demo@smartlight.example','0900000002',N'Nhân viên vận hành','KV001'),
 ('ND0003','kythuat_demo',N'NVKT Demo','2001-06-20','kythuat.demo@smartlight.example','0900000003',N'Nhân viên kỹ thuật','KV002')
) v(ma,tenDangNhap,hoTen,ngaySinh,email,sdt,tenVaiTro,maKhuVuc)
JOIN VaiTro r ON r.tenVaiTro=v.tenVaiTro
WHERE NOT EXISTS (SELECT 1 FROM NguoiDung u WHERE u.maNguoiDung=v.ma OR u.tenDangNhap=v.tenDangNhap);

-- 9. DU LIEU GIAM SAT TU: 2 lan do/tủ online, 0 cho tu mat ket noi
INSERT INTO DuLieuGiamSatTu
(dienApPha1,dienApPha2,dienApPha3,dongDienPha1,dongDienPha2,dongDienPha3,congSuat,dienNang,thoiGianDo,maTu)
SELECT v.v1,v.v2,v.v3,v.a1,v.a2,v.a3,v.kw,v.kwh,DATEADD(MINUTE,v.truPhut,GETDATE()),v.maTu
FROM (VALUES
 ('TC00001',228.10,229.20,227.50,18.10,18.30,18.20,12.400,148.200,-10),
 ('TC00001',229.40,228.70,227.40,18.10,18.30,18.20,12.450,148.350,0),
 ('TC00002',230.10,229.60,231.20,12.30,12.10,12.20,8.250,112.400,-10),
 ('TC00002',230.00,229.90,231.00,12.40,12.20,12.30,8.300,112.520,0),
 ('TC00004',227.10,227.50,228.00,9.20,9.10,9.30,6.100,94.600,-10),
 ('TC00004',227.40,227.70,228.20,9.30,9.20,9.20,6.180,94.700,0)
) v(maTu,v1,v2,v3,a1,a2,a3,kw,kwh,truPhut)
WHERE NOT EXISTS (SELECT 1 FROM DuLieuGiamSatTu g WHERE g.maTu=v.maTu);

-- 10. DU LIEU GIAM SAT DEN: 1 ban ghi cho moi den co thong so
INSERT INTO DuLieuGiamSatDen(maDen,dienAp,dongDien,congSuatThucTe,nhietDoLed,doSang,thoiGianDo)
SELECT d.maDen,d.dienAp,d.dongDien,d.congSuatThucTe,d.nhietDoLed,d.doSang,GETDATE()
FROM DiemDen d
WHERE d.maDen IN ('DEN00001','DEN00002','DEN00003','DEN00004','DEN00005','DEN00007','DEN00008')
 AND NOT EXISTS (SELECT 1 FROM DuLieuGiamSatDen g WHERE g.maDen=d.maDen);

-- 11. CAU HINH CANH BAO
INSERT INTO CauHinhCanhBao(tenCanhBao,loaiCanhBao,nguongGiaTri,mucDo,dangBat)
SELECT v.ten,v.loai,v.nguong,v.mucDo,1
FROM (VALUES
 (N'Mất kết nối tủ trên 5 phút','MAT_KET_NOI',300.00,2),
 (N'Thiết bị không phản hồi sau 30 giây','KHONG_PHAN_HOI',30.00,2),
 (N'Nhiệt độ LED vượt 75 độ C','QUA_NHIET',75.00,3)
) v(ten,loai,nguong,mucDo)
WHERE NOT EXISTS (SELECT 1 FROM CauHinhCanhBao c WHERE c.tenCanhBao=v.ten);

-- 12. LICH VAN HANH: mot lich mau cho tuyen Bạch Đằng A
INSERT INTO LichVanHanh(tenLich,ngayBatDau,dangApDung,maTuyen,maNguoiTao)
SELECT N'Lịch đèn Bạch Đằng hàng ngày',CONVERT(DATE,GETDATE()),1,'TCS00001','ND0002'
WHERE NOT EXISTS (SELECT 1 FROM LichVanHanh WHERE tenLich=N'Lịch đèn Bạch Đằng hàng ngày');

-- 13. CHI TIET LICH: 18:00 bat, 23:00 DIM 70, 05:30 tat
INSERT INTO ChiTietLichVanHanh(maLich,thuTrongTuan,gioThucHien,hanhDong,mucSang)
SELECT l.maLich,v.thu,v.gio,v.hanhDong,v.mucSang
FROM LichVanHanh l
CROSS JOIN (VALUES
 (CAST(NULL AS TINYINT),CAST('18:00:00' AS TIME(0)),'BAT',CAST(NULL AS TINYINT)),
 (CAST(NULL AS TINYINT),CAST('23:00:00' AS TIME(0)),'DIM',CAST(70 AS TINYINT)),
 (CAST(NULL AS TINYINT),CAST('05:30:00' AS TIME(0)),'TAT',CAST(NULL AS TINYINT))
) v(thu,gio,hanhDong,mucSang)
WHERE l.tenLich=N'Lịch đèn Bạch Đằng hàng ngày'
 AND NOT EXISTS (SELECT 1 FROM ChiTietLichVanHanh x WHERE x.maLich=l.maLich AND x.gioThucHien=v.gio AND x.hanhDong=v.hanhDong);

-- 14. CANH BAO: 3 canh bao mau dai dien cho tu, tuyen va diem den
INSERT INTO CanhBao
(maCauHinh,maTu,maTuyen,maDen,noiDung,mucDo,trangThaiXuLy,
 thoiGianPhatSinh,thoiGianXuLy,ghiChuXuLy,maNguoiXuLy)
SELECT c.maCauHinh,v.maTu,v.maTuyen,v.maDen,v.noiDung,v.mucDo,v.trangThai,
       DATEADD(MINUTE,v.phutPhatSinh,GETDATE()),
       CASE WHEN v.phutXuLy IS NOT NULL THEN DATEADD(MINUTE,v.phutXuLy,GETDATE()) ELSE NULL END,
       v.ghiChu,v.maNguoiXuLy
FROM (VALUES
 (N'Mất kết nối tủ trên 5 phút',CAST('TC00003' AS CHAR(10)),CAST(NULL AS CHAR(10)),CAST(NULL AS CHAR(10)),N'Tủ Điện Biên Phủ 01 mất kết nối với hệ thống vượt quá 5 phút',CAST(2 AS TINYINT),CAST(0 AS TINYINT),-15,CAST(NULL AS INT),CAST(NULL AS NVARCHAR(255)),CAST(NULL AS CHAR(6))),
 (N'Thiết bị không phản hồi sau 30 giây',CAST(NULL AS CHAR(10)),CAST('TCS00004' AS CHAR(10)),CAST(NULL AS CHAR(10)),N'Tuyến Điện Biên Phủ không phản hồi tín hiệu điều khiển sau 30 giây',CAST(2 AS TINYINT),CAST(1 AS TINYINT),-45,CAST(NULL AS INT),N'Kỹ thuật viên đang kiểm tra đường truyền và tủ điều khiển',CAST('ND0003' AS CHAR(6))),
 (N'Nhiệt độ LED vượt 75 độ C',CAST(NULL AS CHAR(10)),CAST(NULL AS CHAR(10)),CAST('DEN00005' AS CHAR(10)),N'Nhiệt độ LED tại Đèn 2 Tháng 9 02 đạt 78.5°C vượt ngưỡng 75°C',CAST(3 AS TINYINT),CAST(2 AS TINYINT),-120,-30,N'Đã kiểm tra bộ tản nhiệt và hạ công suất chiếu sáng về 50%',CAST('ND0003' AS CHAR(6)))
) v(tenCauHinh,maTu,maTuyen,maDen,noiDung,mucDo,trangThai,phutPhatSinh,phutXuLy,ghiChu,maNguoiXuLy)
JOIN CauHinhCanhBao c ON c.tenCanhBao=v.tenCauHinh
WHERE NOT EXISTS (SELECT 1 FROM CanhBao b WHERE b.noiDung=v.noiDung);

-- KHONG chen PhienDangNhap/LenhDieuKhien/NhatKyHeThong:
-- cac bang nay nen do chuc nang dang nhap va dieu khien tao ra khi TEST.
GO
-- KIEM TRA SO DONG CAC BANG DA CHEN
SELECT * FROM KhuVuc
SELECT * FROM TuChieuSang
SELECT * FROM TuyenChieuSang
SELECT * FROM DiemDen
SELECT * FROM NguoiDung
SELECT * FROM LichVanHanh
SELECT * FROM CanhBao
select * from PhienDangNhap