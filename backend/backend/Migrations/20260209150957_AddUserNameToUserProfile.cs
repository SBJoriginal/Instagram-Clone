using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UGram.Migrations
{
  /// <inheritdoc />
  public partial class AddUserNameToUserProfile : Migration
  {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.AddColumn<string>(
          name: "UserName",
          table: "UserProfiles",
          type: "text",
          nullable: false,
          defaultValue: "");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropColumn(
          name: "UserName",
          table: "UserProfiles");
    }
  }
}
