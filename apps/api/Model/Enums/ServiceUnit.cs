namespace GiupViecAPI.Model.Enums
{
    public enum ServiceUnit
    {
        Hour = 0,    // Tính theo giờ (VD: Dọn dẹp)
        Piece = 1,   // Tính theo chiếc/máy (VD: Vệ sinh máy lạnh)
        m2 = 2,      // Tính theo mét vuông (VD: Tổng vệ sinh)
        Session = 3  // Tính theo buổi/lần (VD: Nấu ăn)
    }
}
