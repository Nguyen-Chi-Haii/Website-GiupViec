using GiupViecAPI.Model.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;


namespace GiupViecAPI.Data
{
    public class GiupViecDBContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public GiupViecDBContext(DbContextOptions<GiupViecDBContext> options) : base(options) { }

        public DbSet<HelperProfile> HelperProfiles { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Rating> Ratings { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Rating relationships
            builder.Entity<Rating>()
                .HasOne(r => r.Booking)
                .WithMany()
                .HasForeignKey(r => r.BookingId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Rating>()
                .HasOne(r => r.Customer)
                .WithMany()
                .HasForeignKey(r => r.CustomerId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Rating>()
                .HasOne(r => r.Helper)
                .WithMany()
                .HasForeignKey(r => r.HelperId)
                .OnDelete(DeleteBehavior.NoAction);

            // Cấu hình độ chính xác cho các trường decimal
            builder.Entity<HelperProfile>()
                .Property(h => h.HourlyRate)
                .HasColumnType("decimal(18,2)");

            builder.Entity<HelperProfile>()
                .Property(h => h.RatingAverage)
                .HasColumnType("decimal(18,2)");

            builder.Entity<Service>()
                .Property(s => s.Price)
                .HasColumnType("decimal(18,2)");
        }
    }
}
