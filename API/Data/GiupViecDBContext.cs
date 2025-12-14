using GiupViecAPI.Model.Domain;
using Microsoft.EntityFrameworkCore;

namespace GiupViecAPI.Data
{
    public class GiupViecDBContext : DbContext
    {
        public GiupViecDBContext(DbContextOptions<GiupViecDBContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Service> Services { get; set; }

        public DbSet<HelperProfile> HelperProfiles { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Message> Messages { get; set; }

        public DbSet<Review> Reviews { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình mối quan hệ Booking - Customer
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Customer)
                .WithMany() // Một khách có thể đặt nhiều đơn
                .HasForeignKey(b => b.CustomerId)
                .OnDelete(DeleteBehavior.Restrict); // Xóa User khách -> KHÔNG tự động xóa Booking (để giữ lịch sử)

            // Cấu hình mối quan hệ Booking - Helper
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Helper)
                .WithMany() // Một Helper có thể nhận nhiều đơn
                .HasForeignKey(b => b.HelperId)
                .OnDelete(DeleteBehavior.Restrict); // Xóa User helper -> KHÔNG tự động xóa Booking
        }
    }
}
