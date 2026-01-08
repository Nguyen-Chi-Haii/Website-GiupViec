using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GiupViecAPI.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(GiupViecDBContext context, UserManager<User> userManager, RoleManager<IdentityRole<int>> roleManager)
        {
            // 1. Seed Roles
            string[] roles = { "Admin", "Customer", "Helper", "Employee" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole<int>(role));
                }
            }

            // 2. Seed Services
            if (!await context.Services.AnyAsync())
            {
                var services = new List<Service>
                {
                    new Service 
                    { 
                        Name = "Dọn dẹp nhà cửa", 
                        Description = "Dịch vụ dọn dẹp nhà cửa định kỳ hoặc theo giờ.",
                        Price = 100000, 
                        Unit = ServiceUnit.Hour, 
                        UnitLabel = "giờ", 
                        MinQuantity = 2, 
                        Icon = "cleaning_services",
                        IsActive = true 
                    },
                    new Service 
                    { 
                        Name = "Tổng vệ sinh", 
                        Description = "Vệ sinh toàn bộ nhà cửa, phù hợp cho nhà mới xây hoặc lâu ngày chưa dọn.",
                        Price = 20000, 
                        Unit = ServiceUnit.m2, 
                        UnitLabel = "m2", 
                        MinQuantity = 50, 
                        Icon = "home_work",
                        IsActive = true 
                    },
                    new Service 
                    { 
                        Name = "Vệ sinh máy lạnh", 
                        Description = "Bảo dưỡng, rửa máy lạnh treo tường chuyên nghiệp.",
                        Price = 150000, 
                        Unit = ServiceUnit.Piece, 
                        UnitLabel = "máy", 
                        MinQuantity = 1, 
                        Icon = "ac_unit",
                        IsActive = true 
                    },
                    new Service 
                    { 
                        Name = "Nấu ăn gia đình", 
                        Description = "Đi chợ và nấu bữa cơm ấm cúng theo khẩu vị gia đình.",
                        Price = 150000, 
                        Unit = ServiceUnit.Session, 
                        UnitLabel = "buổi", 
                        MinQuantity = 1, 
                        RequiresNotes = true,
                        NotePrompt = "Nhập thực đơn mong muốn hoặc lưu ý dị ứng...",
                        Icon = "restaurant",
                        IsActive = true 
                    },
                    new Service 
                    { 
                        Name = "Giặt ủi & Phơi", 
                        Description = "Giặt, phơi và là ủi quần áo tươm tất.",
                        Price = 80000, 
                        Unit = ServiceUnit.Hour, 
                        UnitLabel = "giờ", 
                        MinQuantity = 2, 
                        Icon = "local_laundry_service",
                        IsActive = true 
                    },
                    new Service 
                    { 
                        Name = "Chăm sóc người già", 
                        Description = "Hỗ trợ sinh hoạt, trò chuyện và chăm sóc sức khỏe người cao tuổi.",
                        Price = 120000, 
                        Unit = ServiceUnit.Hour, 
                        UnitLabel = "giờ", 
                        MinQuantity = 4, 
                        RequiresNotes = true,
                        NotePrompt = "Mô tả tình trạng sức khỏe của cụ...",
                        Icon = "elderly",
                        IsActive = true 
                    }
                };
                await context.Services.AddRangeAsync(services);
                await context.SaveChangesAsync();
            }

            // 3. Seed Admin User
            var adminEmail = "admin@giupviec.com";
            if (await userManager.FindByEmailAsync(adminEmail) == null)
            {
                var admin = new User
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FullName = "Hệ thống Admin",
                    PhoneNumber = "0900000000",
                    EmailConfirmed = true,
                    Role = UserRoles.Admin,
                    Status = UserStatus.Active,
                    Address = "Hệ thống",
                    Avatar = ""
                };
                var result = await userManager.CreateAsync(admin, "Admin@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
            }
        }
    }
}
