using System.ComponentModel.DataAnnotations;
namespace GiupViecAPI.Model.Domain
{
    public class Service
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }

        public bool IsActive { get; set; }
    }
}
