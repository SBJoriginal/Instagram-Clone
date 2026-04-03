using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace UGram.Migrations
{
  /// <inheritdoc />
  public partial class AddNotifications : Migration
  {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.CreateTable(
          name: "Notifications",
          columns: table => new
          {
            Id = table.Column<int>(type: "integer", nullable: false)
                  .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
            RecipientUserId = table.Column<string>(type: "text", nullable: false),
            ActorUserId = table.Column<string>(type: "text", nullable: false),
            ImageId = table.Column<int>(type: "integer", nullable: false),
            Type = table.Column<string>(type: "text", nullable: false),
            IsRead = table.Column<bool>(type: "boolean", nullable: false),
            CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
          },
          constraints: table =>
          {
            table.PrimaryKey("PK_Notifications", x => x.Id);
            table.ForeignKey(
                      name: "FK_Notifications_Images_ImageId",
                      column: x => x.ImageId,
                      principalTable: "Images",
                      principalColumn: "Id",
                      onDelete: ReferentialAction.Cascade);
          });

      migrationBuilder.CreateIndex(
          name: "IX_Notifications_ImageId",
          table: "Notifications",
          column: "ImageId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropTable(
          name: "Notifications");
    }
  }
}
