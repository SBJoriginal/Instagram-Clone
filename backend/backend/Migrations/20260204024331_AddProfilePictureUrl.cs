using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UGram.Migrations
{
  /// <inheritdoc />
  public partial class AddProfilePictureUrl : Migration
  {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.AlterColumn<DateTime>(
          name: "SignUpDate",
          table: "UserProfiles",
          type: "timestamp with time zone",
          nullable: false,
          defaultValueSql: "CURRENT_TIMESTAMP",
          oldClrType: typeof(DateTime),
          oldType: "timestamp with time zone");

      migrationBuilder.AddColumn<string>(
          name: "ProfilePictureUrl",
          table: "UserProfiles",
          type: "text",
          nullable: true);

      migrationBuilder.AlterColumn<DateTime>(
          name: "CreatedAt",
          table: "Images",
          type: "timestamp with time zone",
          nullable: false,
          defaultValueSql: "CURRENT_TIMESTAMP",
          oldClrType: typeof(DateTime),
          oldType: "timestamp with time zone");

      migrationBuilder.AddColumn<string>(
          name: "UserId",
          table: "Images",
          type: "text",
          nullable: false,
          defaultValue: "");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropColumn(
          name: "ProfilePictureUrl",
          table: "UserProfiles");

      migrationBuilder.DropColumn(
          name: "UserId",
          table: "Images");

      migrationBuilder.AlterColumn<DateTime>(
          name: "SignUpDate",
          table: "UserProfiles",
          type: "timestamp with time zone",
          nullable: false,
          oldClrType: typeof(DateTime),
          oldType: "timestamp with time zone",
          oldDefaultValueSql: "CURRENT_TIMESTAMP");

      migrationBuilder.AlterColumn<DateTime>(
          name: "CreatedAt",
          table: "Images",
          type: "timestamp with time zone",
          nullable: false,
          oldClrType: typeof(DateTime),
          oldType: "timestamp with time zone",
          oldDefaultValueSql: "CURRENT_TIMESTAMP");
    }
  }
}
