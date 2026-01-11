namespace GiupViecAPI.Model.DTO.Shared
{
    public class BaseFilterDTO
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; }
        public bool IsDescending { get; set; } = true;
        public string? Keyword { get; set; }
    }
}
