using AutoMapper;
using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Booking;
using GiupViecAPI.Model.DTO.Schedule;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace GiupViecAPI.Services.Repositories
{
    public class BookingService : IBookingService
    {
        private readonly GiupViecDBContext _db;
        private readonly IMapper _mapper;

        public BookingService(GiupViecDBContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public Task<BookingResponseDTO> AssignHelperAsync(int id, int helperId)
        {
            throw new NotImplementedException();
        }

        public Task CleanExpiredBookingsAsync()
        {
            throw new NotImplementedException();
        }

        public Task<bool> ConfirmPaymentAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<BookingResponseDTO> CreateBookingAsync(BookingCreateDTO dto, int customerId)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<BookingResponseDTO>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<BookingResponseDTO> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<List<BookingScheduleDTO>> GetHelperScheduleAsync(int helperId, DateTime fromDate, DateTime toDate)
        {
            throw new NotImplementedException();
        }

        public Task<BookingResponseDTO> UpdateAsync(int id, BookingUpdateDTO dto)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateStatusAsync(int id, BookingStatus status)
        {
            throw new NotImplementedException();
        }
    }
}