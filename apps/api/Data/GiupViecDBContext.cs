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
    }
}
