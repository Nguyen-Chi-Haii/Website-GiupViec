// Program.cs
using GiupViecAPI.Mapping;
using GiupViecAPI.Data;
using GiupViecAPI.Mapping;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Services.Interface; // Thêm namespace này
using GiupViecAPI.Services.Repositories; // Thêm namespace này
using Microsoft.AspNetCore.Authentication.JwtBearer; // Thêm namespace này
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "GiupViecAPI", Version = "v1" });

    // 1. Định nghĩa Security Scheme (Cấu hình nút Authorize)
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Vui lòng nhập token vào ô bên dưới (Không cần gõ chữ 'Bearer ')",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });

    // 2. Yêu cầu bảo mật cho các API (Kích hoạt khóa cho toàn bộ API)
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});

// 2. Database Context
builder.Services.AddDbContext<GiupViecDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Identity (Quản lý User)
builder.Services.AddIdentity<User, IdentityRole<int>>()
    .AddEntityFrameworkStores<GiupViecDBContext>()
    .AddDefaultTokenProviders();

// 4. ---> QUAN TRỌNG: Cấu hình xác thực JWT (Authentication)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

// 5. ---> ĐĂNG KÝ DEPENDENCY INJECTION (Thiếu cái này Controller sẽ lỗi 500)

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IServiceService, ServiceService>(); // (Bỏ comment khi bạn có file này)
builder.Services.AddScoped<IHelperProfileService, HelperProfileService>();

// 6. ---> ĐĂNG KÝ AUTOMAPPER
builder.Services.AddAutoMapper(typeof(MappingProfile));


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 7. Thứ tự Middleware bắt buộc: AuthN -> AuthZ
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();