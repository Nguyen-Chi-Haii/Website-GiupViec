using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiupViecAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAllStoredProcsAndTriggers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
            CREATE OR ALTER TRIGGER TRG_Booking_CalculateTotalPrice
            ON Bookings
            AFTER INSERT, UPDATE
            AS
            BEGIN
                SET NOCOUNT ON;
                IF (UPDATE(StartDate) OR UPDATE(EndDate) OR UPDATE(WorkShiftStart) OR UPDATE(WorkShiftEnd) OR UPDATE(ServiceId))
                BEGIN
                    UPDATE b
                    SET b.TotalPrice = (
                        CAST(DATEDIFF(day, i.StartDate, i.EndDate) + 1 AS DECIMAL(18,2)) * CAST(DATEDIFF(second, i.WorkShiftStart, i.WorkShiftEnd) AS DECIMAL(18,2)) / 3600.0 * s.Price
                    )
                    FROM Bookings b
                    INNER JOIN inserted i ON b.Id = i.Id
                    INNER JOIN Services s ON i.ServiceId = s.Id;
                END
            END;"
            );
            migrationBuilder.Sql(@"
           CREATE OR ALTER PROCEDURE sp_CreateBooking
                @CustomerId INT,
                @ServiceId INT,
                @HelperId INT,
                @StartDate DATE,
                @EndDate DATE,
                @WorkShiftStart TIME,
                @WorkShiftEnd TIME,
                @Address NVARCHAR(255),
                @Notes NVARCHAR(MAX)
            AS
            BEGIN
                SET NOCOUNT ON;

                -- 1. Kiểm tra xem Helper có bị trùng lịch làm việc không
                IF EXISTS (
                    SELECT 1 FROM Bookings 
                    WHERE HelperId = @HelperId 
                        AND Status != 3 -- Không tính đơn đã Hủy (Cancelled)
                        AND (
                            (@StartDate <= EndDate AND @EndDate >= StartDate) -- Trùng ngày
                            AND 
                            (@WorkShiftStart < WorkShiftEnd AND @WorkShiftStart < WorkShiftEnd) -- Trùng giờ
                        )
                )
                BEGIN
                    RAISERROR(N'Helper đã có lịch làm việc trong khoảng thời gian này.', 16, 1);
                    RETURN;
                END

                -- 2. Thêm mới đơn hàng (TotalPrice sẽ tự tính bằng Trigger đã tạo ở phần trước)
                INSERT INTO Bookings (CustomerId, ServiceId, HelperId, StartDate, EndDate, WorkShiftStart, WorkShiftEnd, [Address], Notes, [Status], PaymentStatus, CreatedAt)
                VALUES (@CustomerId, @ServiceId, @HelperId, @StartDate, @EndDate, @WorkShiftStart, @WorkShiftEnd, @Address, @Notes, 0, 0, GETUTCDATE());
    
                SELECT SCOPE_IDENTITY() AS NewBookingId;
            END;"
           );
            migrationBuilder.Sql(@"
            CREATE OR ALTER PROCEDURE sp_GetBookingStatistics
            AS
            BEGIN
                SET NOCOUNT ON;
                SELECT 
                    COUNT(*) AS TotalBookings,
                    -- Status = 1 là Pending
                    SUM(CASE WHEN [Status] = 1 THEN 1 ELSE 0 END) AS PendingBookings, 
                    -- Status = 4 là Completed
                    SUM(CASE WHEN [Status] = 4 THEN 1 ELSE 0 END) AS CompletedBookings, 
                    -- PaymentStatus = 1 là Paid (Dựa trên file PaymentStatus.cs của bạn)
                    SUM(CASE WHEN [PaymentStatus] = 1 THEN TotalPrice ELSE 0 END) AS TotalRevenue 
                FROM Bookings;
            END;");
            migrationBuilder.Sql(@"
            CREATE OR ALTER TRIGGER TRG_Booking_UpdateStatusOnPaid
            ON Bookings
            AFTER UPDATE
            AS
            BEGIN
                SET NOCOUNT ON;
                -- Nếu có sự thay đổi ở cột PaymentStatus
                IF UPDATE(PaymentStatus)
                BEGIN
                    UPDATE b
                    SET b.[Status] = 4 -- Chuyển sang Completed (4)
                    FROM Bookings b
                    INNER JOIN inserted i ON b.Id = i.Id
                    WHERE i.PaymentStatus = 1 -- Khi thanh toán thành công (Paid = 1)
                      AND b.[Status] NOT IN (3, 5); -- Ngoại trừ đơn bị từ chối (3) hoặc đã hủy (5)
                END
            END;");
            migrationBuilder.Sql(@"
            CREATE OR ALTER TRIGGER TRG_Booking_ProtectFinalState
            ON Bookings
            AFTER UPDATE
            AS
            BEGIN
                SET NOCOUNT ON;
                -- Nếu đơn hàng đã Hoàn thành (4) hoặc Đã hủy (5) thì không cho phép sửa Address, Price, Date
                IF EXISTS (
                    SELECT 1 FROM deleted 
                    WHERE [Status] IN (4, 5)
                )
                BEGIN
                    IF (UPDATE(StartDate) OR UPDATE(EndDate) OR UPDATE(TotalPrice) OR UPDATE(ServiceId))
                    BEGIN
                        RAISERROR(N'Không thể sửa đổi thông tin của đơn hàng đã hoàn thành hoặc đã hủy.', 16, 1);
                        ROLLBACK TRANSACTION;
                    END
                END
            END;");

            // 2. Procedure tự động hủy đơn quá hạn
            migrationBuilder.Sql(@"
            CREATE OR ALTER PROCEDURE sp_CancelExpiredBookings
            AS
            BEGIN
                SET NOCOUNT ON;
    
                UPDATE Bookings
                SET [Status] = 5 -- Cancelled
                WHERE [Status] = 1 -- Pending
                  AND StartDate < CAST(GETUTCDATE() AS DATE);
      
                SELECT @@ROWCOUNT AS CancelledCount;
            END;");
            migrationBuilder.Sql(@"
            CREATE OR ALTER PROCEDURE sp_CreateBooking
                @CustomerId INT,
                @ServiceId INT,
                @StartDate DATE,
                @EndDate DATE,
                @WorkShiftStart TIME,
                @WorkShiftEnd TIME,
                @Address NVARCHAR(255),
                @Notes NVARCHAR(MAX)
            AS
            BEGIN
                SET NOCOUNT ON;
                -- Logic tính TotalPrice (đã có Trigger TRG_Booking_CalculateTotalPrice xử lý tự động khi Insert)
                INSERT INTO Bookings (CustomerId, ServiceId, StartDate, EndDate, WorkShiftStart, WorkShiftEnd, [Address], Notes, [Status], PaymentStatus, CreatedAt)
                VALUES (@CustomerId, @ServiceId, @StartDate, @EndDate, @WorkShiftStart, @WorkShiftEnd, @Address, @Notes, 1, 0, GETUTCDATE()); -- Status 1 = Pending
    
                SELECT SCOPE_IDENTITY() AS NewId;
            END;");
            migrationBuilder.Sql(@"CREATE OR ALTER FUNCTION fn_CheckHelperConflict (@HelperId INT, @SDate DATE, @EDate DATE, @SShift TIME, @EShift TIME)
            RETURNS BIT
            AS
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM Bookings 
                    WHERE HelperId = @HelperId AND [Status] IN (1, 2, 4) -- Pending, Confirmed, Completed
                    AND NOT (@EDate < StartDate OR @SDate > EndDate) -- Có giao thoa ngày
                    AND NOT (@EShift <= WorkShiftStart OR @SShift >= WorkShiftEnd) -- Có giao thoa giờ
                ) RETURN 1; -- Có xung đột
                RETURN 0;
            END;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS TRG_Booking_CalculateTotalPrice");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_CreateBooking");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_GetBookingStatistics");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS TRG_Booking_UpdateStatusOnPaid");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS TRG_Booking_ProtectFinalState");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS sp_CancelExpiredBookings");
        }
    }
    
}
