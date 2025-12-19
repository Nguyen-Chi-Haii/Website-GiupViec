using AutoMapper;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Auth;
using GiupViecAPI.Model.DTO.Booking;
using GiupViecAPI.Model.DTO.User;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace GiupViecAPI.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User Mapping
            CreateMap<UserCreateDTO, User>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email)); // Identity dùng UserName

            CreateMap<User, UserResponseDTO>();
            CreateMap<UserUpdateDTO, User>();

            // Booking Mapping
            CreateMap<BookingCreateDTO, Booking>();
            CreateMap<Booking, BookingResponseDTO>()
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer.FullName))
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Service.Name));

            // Thêm các map khác khi cần...
        }
    }
}