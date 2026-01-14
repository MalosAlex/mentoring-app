using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentoringApp.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class FixPostRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostComments_Posts_PostId1",
                table: "PostComments");

            migrationBuilder.DropForeignKey(
                name: "FK_PostReactions_Posts_PostId1",
                table: "PostReactions");

            migrationBuilder.DropIndex(
                name: "IX_PostReactions_PostId1",
                table: "PostReactions");

            migrationBuilder.DropIndex(
                name: "IX_PostComments_PostId1",
                table: "PostComments");

            migrationBuilder.DropColumn(
                name: "PostId1",
                table: "PostReactions");

            migrationBuilder.DropColumn(
                name: "PostId1",
                table: "PostComments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PostId1",
                table: "PostReactions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PostId1",
                table: "PostComments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PostReactions_PostId1",
                table: "PostReactions",
                column: "PostId1");

            migrationBuilder.CreateIndex(
                name: "IX_PostComments_PostId1",
                table: "PostComments",
                column: "PostId1");

            migrationBuilder.AddForeignKey(
                name: "FK_PostComments_Posts_PostId1",
                table: "PostComments",
                column: "PostId1",
                principalTable: "Posts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PostReactions_Posts_PostId1",
                table: "PostReactions",
                column: "PostId1",
                principalTable: "Posts",
                principalColumn: "Id");
        }
    }
}
