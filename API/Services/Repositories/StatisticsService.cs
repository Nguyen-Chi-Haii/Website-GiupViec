using GiupViecAPI.Data;
using GiupViecAPI.Model.DTO.AdminDashboard;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace GiupViecAPI.Services.Repositories
{
    public class StatisticsService : IStatisticsService
    {
        private readonly GiupViecDBContext _db;

        public StatisticsService(GiupViecDBContext db)
        {
            _db = db;
        }

        public Task<AdminDashboardDTO> GetAdminDashboardAsync()
        {
            throw new NotImplementedException();
        }

        public Task<HelperDashboardDTO> GetHelperDashboardAsync(int userId)
        {
            throw new NotImplementedException();
        }
    }
}
