using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentoringApp.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class FixUserRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostComments_Users_UserId",
                table: "PostComments");

            migrationBuilder.DropForeignKey(
                name: "FK_PostComments_Users_UserId1",
                table: "PostComments");

            migrationBuilder.DropForeignKey(
                name: "FK_PostReactions_Users_UserId",
                table: "PostReactions");

            migrationBuilder.DropForeignKey(
                name: "FK_PostReactions_Users_UserId1",
                table: "PostReactions");

            migrationBuilder.DropIndex(
                name: "IX_PostReactions_UserId1",
                table: "PostReactions");

            migrationBuilder.DropIndex(
                name: "IX_PostComments_UserId1",
                table: "PostComments");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "PostReactions");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "PostComments");

            migrationBuilder.AddForeignKey(
                name: "FK_PostComments_Users_UserId",
                table: "PostComments",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PostReactions_Users_UserId",
                table: "PostReactions",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostComments_Users_UserId",
                table: "PostComments");

            migrationBuilder.DropForeignKey(
                name: "FK_PostReactions_Users_UserId",
                table: "PostReactions");

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "PostReactions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "PostComments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PostReactions_UserId1",
                table: "PostReactions",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_PostComments_UserId1",
                table: "PostComments",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_PostComments_Users_UserId",
                table: "PostComments",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PostComments_Users_UserId1",
                table: "PostComments",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PostReactions_Users_UserId",
                table: "PostReactions",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PostReactions_Users_UserId1",
                table: "PostReactions",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
