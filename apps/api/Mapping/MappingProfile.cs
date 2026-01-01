using AutoMapper;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Booking;
using GiupViecAPI.Model.DTO.HelperProfile; // <-- Bổ sung namespace này
using GiupViecAPI.Model.DTO.Service;       // <-- Bổ sung namespace này
using GiupViecAPI.Model.DTO.User;

namespace GiupViecAPI.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
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
                .ForMember(dest => dest.IsPaid, opt => opt.MapFrom(src => src.PaymentStatus == GiupViecAPI.Model.Enums.PaymentStatus.Paid))
                .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.Notes))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));


            // --- 3. HELPER PROFILE MAPPING (Đây là phần bạn đang thiếu) ---
            CreateMap<HelperProfileCreateDTO, HelperProfile>();

            CreateMap<HelperProfileUpdateDTO, HelperProfile>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<HelperProfile, HelperProfileResponseDTO>()
                // Ví dụ: Muốn lấy tên thật từ bảng User để hiển thị trong Profile
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName));


            // --- 4. SERVICE MAPPING (Cũng cần thêm vì ServiceService có dùng) ---
            CreateMap<ServiceCreateDTO, Service>();

            CreateMap<ServiceUpdateDTO, Service>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<Service, ServiceResponseDTO>();
            CreateMap<HelperProfile, HelperSuggestionDTO>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.User.Avatar));
            CreateMap<HelperProfileCreateDTO, HelperProfile>()
                .ForMember(dest => dest.CareerStartDate,
                           opt => opt.MapFrom(src => DateTime.Now.AddYears(-src.ExperienceYears)));

            // Update cũng tương tự
            CreateMap<HelperProfileUpdateDTO, HelperProfile>()
                .ForMember(dest => dest.CareerStartDate,
                           opt => opt.MapFrom(src => src.ExperienceYears.HasValue
                                ? DateTime.Now.AddYears(-src.ExperienceYears.Value)
                                : default(DateTime?)))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // 2. OUTPUT: Từ Ngày bắt đầu (Entity) -> Tính ra Số năm (DTO)
            // Ví dụ: DB lưu 2020 -> Nay 2025 -> Trả về 5 năm
            CreateMap<HelperProfile, HelperProfileResponseDTO>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.User.Avatar))
                // Logic tính toán tự động cập nhật theo thời gian thực
                .ForMember(dest => dest.ExperienceYears,
                           opt => opt.MapFrom(src => DateTime.Now.Year - src.CareerStartDate.Year));

            // Logic cho Suggestion DTO (Tính năng tìm kiếm)
            CreateMap<HelperProfile, HelperSuggestionDTO>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.User.Avatar))
                .ForMember(dest => dest.ExperienceYears,
                           opt => opt.MapFrom(src => DateTime.Now.Year - src.CareerStartDate.Year));
        }
    }
    
}