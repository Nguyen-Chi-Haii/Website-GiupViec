using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddApprovalAndNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovalDate",
                table: "Bookings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovalStatus",
                table: "Bookings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ApprovedBy",
                table: "Bookings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "Bookings",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    RelatedEntityId = table.Column<int>(type: "int", nullable: true),
                    RelatedEntityType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ApprovalStatus",
                table: "Bookings",
                column: "ApprovalStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ApprovedBy",
                table: "Bookings",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_IsRead",
                table: "Notifications",
                columns: new[] { "UserId", "IsRead" });

            // DATA MIGRATION: Set all existing bookings to Approved status
            // This ensures existing bookings remain visible after deploying the approval feature
            migrationBuilder.Sql(@"
                UPDATE Bookings 
                SET ApprovalStatus = 2, 
                    ApprovalDate = GETUTCDATE() 
                WHERE ApprovalStatus = 0
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_AspNetUsers_ApprovedBy",
                table: "Bookings",
                column: "ApprovedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_AspNetUsers_ApprovedBy",
                table: "Bookings");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_ApprovalStatus",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_ApprovedBy",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ApprovalDate",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ApprovalStatus",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "Bookings");
        }
    }
}
