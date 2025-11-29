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
    }
}
