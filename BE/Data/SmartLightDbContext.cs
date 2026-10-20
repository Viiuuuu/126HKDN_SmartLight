using Microsoft.EntityFrameworkCore;
using BE.Models;

namespace BE.Data;

public class SmartLightDbContext : DbContext
{
    public SmartLightDbContext(DbContextOptions<SmartLightDbContext> options) : base(options)
    {
    }

    public DbSet<KhuVuc> KhuVuc { get; set; }
    public DbSet<TuChieuSang> TuChieuSang { get; set; }
    public DbSet<DuLieuGiamSatTu> DuLieuGiamSatTu { get; set; }
    public DbSet<TuyenChieuSang> TuyenChieuSang { get; set; }
    public DbSet<DiemDen> DiemDen { get; set; }
    public DbSet<VaiTro> VaiTro { get; set; }
    public DbSet<QuyenHan> QuyenHan { get; set; }
    public DbSet<VaiTroQuyenHan> VaiTroQuyenHan { get; set; }
    public DbSet<NguoiDung> NguoiDung { get; set; }
    public DbSet<PhienDangNhap> PhienDangNhap { get; set; }
    public DbSet<DuLieuGiamSatDen> DuLieuGiamSatDen { get; set; }
    public DbSet<LichVanHanh> LichVanHanh { get; set; }
    public DbSet<ChiTietLichVanHanh> ChiTietLichVanHanh { get; set; }
    public DbSet<LenhDieuKhien> LenhDieuKhien { get; set; }
    public DbSet<CauHinhCanhBao> CauHinhCanhBao { get; set; }
    public DbSet<CanhBao> CanhBao { get; set; }
    public DbSet<NhatKyHeThong> NhatKyHeThong { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Composite key for VaiTro_QuyenHan
        modelBuilder.Entity<VaiTroQuyenHan>()
            .ToTable("VaiTro_QuyenHan")
            .HasKey(x => new { x.MaQuyenHan, x.MaVaiTro });

        // Decimals precision configuration
        modelBuilder.Entity<TuChieuSang>(entity =>
        {
            entity.Property(e => e.ViDo).HasPrecision(10, 7);
            entity.Property(e => e.KinhDo).HasPrecision(10, 7);
        });

        modelBuilder.Entity<DuLieuGiamSatTu>(entity =>
        {
            entity.Property(e => e.DienApPha1).HasPrecision(6, 2);
            entity.Property(e => e.DienApPha2).HasPrecision(6, 2);
            entity.Property(e => e.DienApPha3).HasPrecision(6, 2);
            entity.Property(e => e.DongDienPha1).HasPrecision(7, 2);
            entity.Property(e => e.DongDienPha2).HasPrecision(7, 2);
            entity.Property(e => e.DongDienPha3).HasPrecision(7, 2);
            entity.Property(e => e.CongSuat).HasPrecision(10, 3);
            entity.Property(e => e.DienNang).HasPrecision(15, 3);
        });

        modelBuilder.Entity<DiemDen>(entity =>
        {
            entity.Property(e => e.ViDo).HasPrecision(10, 7);
            entity.Property(e => e.KinhDo).HasPrecision(10, 7);
            entity.Property(e => e.CongSuat).HasPrecision(8, 2);
            entity.Property(e => e.DienAp).HasPrecision(6, 2);
            entity.Property(e => e.DongDien).HasPrecision(7, 3);
            entity.Property(e => e.CongSuatThucTe).HasPrecision(8, 2);
            entity.Property(e => e.NhietDoLed).HasPrecision(5, 2);
        });

        modelBuilder.Entity<DuLieuGiamSatDen>(entity =>
        {
            entity.Property(e => e.DienAp).HasPrecision(6, 2);
            entity.Property(e => e.DongDien).HasPrecision(7, 3);
            entity.Property(e => e.CongSuatThucTe).HasPrecision(8, 2);
            entity.Property(e => e.NhietDoLed).HasPrecision(5, 2);
        });

        modelBuilder.Entity<CauHinhCanhBao>(entity =>
        {
            entity.Property(e => e.NguongGiaTri).HasPrecision(10, 2);
        });
    }
}
