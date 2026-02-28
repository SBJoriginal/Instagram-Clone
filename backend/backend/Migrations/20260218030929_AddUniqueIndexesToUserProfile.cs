using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UGram.Migrations
{
  /// <inheritdoc />
  public partial class AddUniqueIndexesToUserProfile : Migration
  {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.CreateIndex(
          name: "IX_UserProfiles_Email",
          table: "UserProfiles",
          column: "Email",
          unique: true);

      migrationBuilder.CreateIndex(
          name: "IX_UserProfiles_UserName",
          table: "UserProfiles",
          column: "UserName",
          unique: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
      migrationBuilder.DropIndex(
          name: "IX_UserProfiles_Email",
          table: "UserProfiles");

      migrationBuilder.DropIndex(
          name: "IX_UserProfiles_UserName",
          table: "UserProfiles");
    }
  }
}
