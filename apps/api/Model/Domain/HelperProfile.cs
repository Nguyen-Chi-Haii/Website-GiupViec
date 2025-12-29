using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GiupViecAPI.Model.Domain
{
    public class HelperProfile
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        // --- BỔ SUNG CÁC TRƯỜNG MỚI ---

        [MaxLength(500)]
        public string? Bio { get; set; } // Giới thiệu bản thân (VD: "Tôi có 5 năm kinh nghiệm chăm bé...")

        public DateTime CareerStartDate { get; set; }

        // ------------------------------

        public decimal RatingAverage { get; set; } = 0;

        [MaxLength(255)]
        public string ActiveArea { get; set; }
    }
}