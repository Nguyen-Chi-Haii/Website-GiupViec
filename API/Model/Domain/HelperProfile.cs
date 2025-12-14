using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GiupViecAPI.Model.Domain
{
    public class HelperProfile
    {
        [Key]
        public int Id { get; set; }

        // Khóa ngoại trỏ về bảng Users
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        // Điểm đánh giá (Mặc định là 0 khi mới tạo)
        public decimal RatingAverage { get; set; } = 0;

        [MaxLength(255)]
        public string ActiveArea { get; set; }
    }
}
