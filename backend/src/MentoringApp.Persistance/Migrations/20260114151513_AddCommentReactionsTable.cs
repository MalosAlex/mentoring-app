using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentoringApp.Persistance.Migrations
{
    /// <inheritdoc />
    public partial class AddCommentReactionsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Check if the foreign keys exist before dropping them
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PostComments_Posts_PostId1')
                    ALTER TABLE [PostComments] DROP CONSTRAINT [FK_PostComments_Posts_PostId1];
                
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PostComments_Users_UserId1')
                    ALTER TABLE [PostComments] DROP CONSTRAINT [FK_PostComments_Users_UserId1];
                
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PostReactions_Posts_PostId1')
                    ALTER TABLE [PostReactions] DROP CONSTRAINT [FK_PostReactions_Posts_PostId1];
                
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PostReactions_Users_UserId1')
                    ALTER TABLE [PostReactions] DROP CONSTRAINT [FK_PostReactions_Users_UserId1];
            ");

            // Check if indexes exist before dropping them
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PostReactions_PostId1' AND object_id = OBJECT_ID('PostReactions'))
                    DROP INDEX [IX_PostReactions_PostId1] ON [PostReactions];
                
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PostReactions_UserId1' AND object_id = OBJECT_ID('PostReactions'))
                    DROP INDEX [IX_PostReactions_UserId1] ON [PostReactions];
                
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PostComments_PostId1' AND object_id = OBJECT_ID('PostComments'))
                    DROP INDEX [IX_PostComments_PostId1] ON [PostComments];
                
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PostComments_UserId1' AND object_id = OBJECT_ID('PostComments'))
                    DROP INDEX [IX_PostComments_UserId1] ON [PostComments];
            ");

            // Check if columns exist before dropping them
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.columns WHERE name = 'PostId1' AND object_id = OBJECT_ID('PostReactions'))
                    ALTER TABLE [PostReactions] DROP COLUMN [PostId1];
                
                IF EXISTS (SELECT * FROM sys.columns WHERE name = 'UserId1' AND object_id = OBJECT_ID('PostReactions'))
                    ALTER TABLE [PostReactions] DROP COLUMN [UserId1];
                
                IF EXISTS (SELECT * FROM sys.columns WHERE name = 'PostId1' AND object_id = OBJECT_ID('PostComments'))
                    ALTER TABLE [PostComments] DROP COLUMN [PostId1];
                
                IF EXISTS (SELECT * FROM sys.columns WHERE name = 'UserId1' AND object_id = OBJECT_ID('PostComments'))
                    ALTER TABLE [PostComments] DROP COLUMN [UserId1];
            ");

            migrationBuilder.CreateTable(
                name: "CommentReactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CommentId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ReactionType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommentReactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommentReactions_PostComments_CommentId",
                        column: x => x.CommentId,
                        principalTable: "PostComments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CommentReactions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CommentReactions_CommentId_UserId",
                table: "CommentReactions",
                columns: new[] { "CommentId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CommentReactions_UserId",
                table: "CommentReactions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CommentReactions");

            migrationBuilder.AddColumn<int>(
                name: "PostId1",
                table: "PostReactions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "PostReactions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PostId1",
                table: "PostComments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "PostComments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PostReactions_PostId1",
                table: "PostReactions",
                column: "PostId1");

            migrationBuilder.CreateIndex(
                name: "IX_PostReactions_UserId1",
                table: "PostReactions",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_PostComments_PostId1",
                table: "PostComments",
                column: "PostId1");

            migrationBuilder.CreateIndex(
                name: "IX_PostComments_UserId1",
                table: "PostComments",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_PostComments_Posts_PostId1",
                table: "PostComments",
                column: "PostId1",
                principalTable: "Posts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PostComments_Users_UserId1",
                table: "PostComments",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PostReactions_Posts_PostId1",
                table: "PostReactions",
                column: "PostId1",
                principalTable: "Posts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PostReactions_Users_UserId1",
                table: "PostReactions",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
