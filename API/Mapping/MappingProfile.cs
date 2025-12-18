using AutoMapper;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Booking;
using GiupViecAPI.Model.DTO.HelperProfile;
using GiupViecAPI.Model.DTO.Service;
using GiupViecAPI.Model.DTO.User;
using GiupViecAPI.Model.Enums;

namespace GiupViecAPI.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User Mappings
            CreateMap<UserCreateDTO, User>();
            CreateMap<UserUpdateDTO, User>();
            CreateMap<User, UserResponseDTO>();
            // Service Mappings
            CreateMap<ServiceCreateDTO, Service>();
            CreateMap<ServiceUpdateDTO, Service>();
            CreateMap<Service, ServiceResponseDTO>();
            // HelperProfile Mappings
            CreateMap<HelperProfileCreateDTO, HelperProfile>();
            CreateMap<HelperProfileUpdateDTO, HelperProfile>();

            CreateMap<HelperProfile, HelperProfileResponseDTO>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName));
            // Booking Mappings
            CreateMap<BookingUpdateDTO, Booking>();

            CreateMap<Booking, BookingResponseDTO>()
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer.FullName))
                .ForMember(dest => dest.HelperName, opt => opt.MapFrom(src => src.Helper != null ? src.Helper.FullName : "Chưa có"))
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Service.Name));
            CreateMap<BookingCreateDTO, Booking>() //
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => BookingStatus.Pending)) // Mặc định là Pending (1)
                .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => PaymentStatus.Unpaid)) // Mặc định là Unpaid (0)
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow)); //
        }
    }
}
