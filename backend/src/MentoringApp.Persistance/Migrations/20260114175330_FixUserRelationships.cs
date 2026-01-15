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
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PostComments_Users_UserId')
                    ALTER TABLE [PostComments] DROP CONSTRAINT [FK_PostComments_Users_UserId];

                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PostComments_Users_UserId1')
                    ALTER TABLE [PostComments] DROP CONSTRAINT [FK_PostComments_Users_UserId1];

                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PostReactions_Users_UserId')
                    ALTER TABLE [PostReactions] DROP CONSTRAINT [FK_PostReactions_Users_UserId];

                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PostReactions_Users_UserId1')
                    ALTER TABLE [PostReactions] DROP CONSTRAINT [FK_PostReactions_Users_UserId1];

                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PostReactions_UserId1' AND object_id = OBJECT_ID('PostReactions'))
                    DROP INDEX [IX_PostReactions_UserId1] ON [PostReactions];

                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PostComments_UserId1' AND object_id = OBJECT_ID('PostComments'))
                    DROP INDEX [IX_PostComments_UserId1] ON [PostComments];

                IF EXISTS (SELECT * FROM sys.columns WHERE name = 'UserId1' AND object_id = OBJECT_ID('PostReactions'))
                    ALTER TABLE [PostReactions] DROP COLUMN [UserId1];

                IF EXISTS (SELECT * FROM sys.columns WHERE name = 'UserId1' AND object_id = OBJECT_ID('PostComments'))
                    ALTER TABLE [PostComments] DROP COLUMN [UserId1];
            ");

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
