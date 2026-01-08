using AutoMapper;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Booking;
using GiupViecAPI.Model.DTO.HelperProfile; // <-- Bổ sung namespace này
using GiupViecAPI.Model.DTO.Service;       // <-- Bổ sung namespace này
using GiupViecAPI.Model.DTO.User;
using GiupViecAPI.Model.DTO.Rating;

namespace GiupViecAPI.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // --- 0. RATING MAPPING ---
            CreateMap<Rating, RatingResponseDTO>()
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer.FullName))
                .ForMember(dest => dest.HelperName, opt => opt.MapFrom(src => src.Helper.FullName));

            // --- 1. USER MAPPING ---
            CreateMap<UserCreateDTO, User>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Phone)); // Map Phone -> PhoneNumber

            CreateMap<User, UserResponseDTO>()
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.PhoneNumber)); // Map PhoneNumber -> Phone

            // Logic Update: Chỉ map các trường có dữ liệu (không null và không phải default value cho enum)
            CreateMap<UserUpdateDTO, User>()
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.FullName, opt => opt.Condition(src => src.FullName != null))
                .ForMember(dest => dest.PhoneNumber, opt => opt.Condition(src => src.Phone != null))
                .ForMember(dest => dest.Avatar, opt => opt.Condition(src => src.Avatar != null))
                .ForMember(dest => dest.Address, opt => opt.Condition(src => src.Address != null))
                // Chỉ map Role khi có giá trị (không null và khác 0)
                .ForMember(dest => dest.Role, opt => opt.Condition(src => src.Role.HasValue && (int)src.Role.Value != 0))
                // Chỉ map Status khi có giá trị (không null và khác 0)
                .ForMember(dest => dest.Status, opt => opt.Condition(src => src.Status.HasValue && (int)src.Status.Value != 0));


            // --- 2. BOOKING MAPPING ---
            CreateMap<BookingCreateDTO, Booking>();

            CreateMap<BookingUpdateDTO, Booking>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<Booking, BookingResponseDTO>()
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer.FullName))
                .ForMember(dest => dest.HelperName, opt => opt.MapFrom(src => src.Helper != null ? src.Helper.FullName : null))
                .ForMember(dest => dest.ServiceId, opt => opt.MapFrom(src => src.ServiceId))
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Service.Name))
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.WorkShiftStart.ToString(@"hh\:mm")))
                .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => src.WorkShiftEnd.ToString(@"hh\:mm")))
                .ForMember(dest => dest.ServiceUnit, opt => opt.MapFrom(src => src.Service.Unit.ToString()))
                .ForMember(dest => dest.ServiceUnitLabel, opt => opt.MapFrom(src => src.Service.UnitLabel))
                .ForMember(dest => dest.IsPaid, opt => opt.MapFrom(src => src.PaymentStatus == GiupViecAPI.Model.Enums.PaymentStatus.Paid))
                .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.Notes))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));


            // --- 3. HELPER PROFILE MAPPING ---
            CreateMap<HelperProfileCreateDTO, HelperProfile>()
                .ForMember(dest => dest.CareerStartDate,
                           opt => opt.MapFrom(src => DateTime.Now.AddYears(-src.ExperienceYears)));


            // --- 4. SERVICE MAPPING (Cũng cần thêm vì ServiceService có dùng) ---
            CreateMap<ServiceCreateDTO, Service>();

            CreateMap<ServiceUpdateDTO, Service>()
                .ForMember(dest => dest.Unit, opt => opt.MapFrom(src => src.Unit != null ? Enum.Parse<GiupViecAPI.Model.Enums.ServiceUnit>(src.Unit) : (GiupViecAPI.Model.Enums.ServiceUnit?)null))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
 
            CreateMap<Service, ServiceResponseDTO>()
                .ForMember(dest => dest.Unit, opt => opt.MapFrom(src => src.Unit.ToString()));
            CreateMap<HelperProfileUpdateDTO, HelperProfile>()
                .ForMember(dest => dest.CareerStartDate,
                           opt => opt.MapFrom(src => src.ExperienceYears.HasValue
                                ? DateTime.Now.AddYears(-src.ExperienceYears.Value)
                                : default(DateTime?)))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // 2. OUTPUT: Từ Ngày bắt đầu (Entity) -> Tính ra Số năm (DTO)
            CreateMap<HelperProfile, HelperProfileResponseDTO>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.User.Avatar))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.User.PhoneNumber))
                .ForMember(dest => dest.ExperienceYears,
                           opt => opt.MapFrom(src => (src.CareerStartDate.Year > 1 && src.CareerStartDate <= DateTime.Now) 
                                ? DateTime.Now.Year - src.CareerStartDate.Year : 0))
                .ForMember(dest => dest.HourlyRate, opt => opt.MapFrom(src => src.HourlyRate))
                .ForMember(dest => dest.RatingAverage, opt => opt.MapFrom(src => src.RatingAverage))
                .ForMember(dest => dest.RatingCount, opt => opt.MapFrom(src => src.RatingCount))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.User != null ? src.User.Status : GiupViecAPI.Model.Enums.UserStatus.Inactive));

            // Logic cho Suggestion DTO
            CreateMap<HelperProfile, HelperSuggestionDTO>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.User.Avatar))
                .ForMember(dest => dest.ExperienceYears,
                           opt => opt.MapFrom(src => (src.CareerStartDate.Year > 1 && src.CareerStartDate <= DateTime.Now) 
                                ? DateTime.Now.Year - src.CareerStartDate.Year : 0))
                .ForMember(dest => dest.HourlyRate, opt => opt.MapFrom(src => src.HourlyRate))
                .ForMember(dest => dest.RatingAverage, opt => opt.MapFrom(src => src.RatingAverage))
                .ForMember(dest => dest.RatingCount, opt => opt.MapFrom(src => src.RatingCount))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.User != null ? src.User.Status : GiupViecAPI.Model.Enums.UserStatus.Inactive));
        }
    }
    
}