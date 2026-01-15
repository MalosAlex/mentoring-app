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
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PostComments_Posts_PostId1')
                    ALTER TABLE [PostComments] DROP CONSTRAINT [FK_PostComments_Posts_PostId1];
                
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PostReactions_Posts_PostId1')
                    ALTER TABLE [PostReactions] DROP CONSTRAINT [FK_PostReactions_Posts_PostId1];

                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PostReactions_PostId1' AND object_id = OBJECT_ID('PostReactions'))
                    DROP INDEX [IX_PostReactions_PostId1] ON [PostReactions];

                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PostComments_PostId1' AND object_id = OBJECT_ID('PostComments'))
                    DROP INDEX [IX_PostComments_PostId1] ON [PostComments];

                IF EXISTS (SELECT * FROM sys.columns WHERE name = 'PostId1' AND object_id = OBJECT_ID('PostReactions'))
                    ALTER TABLE [PostReactions] DROP COLUMN [PostId1];

                IF EXISTS (SELECT * FROM sys.columns WHERE name = 'PostId1' AND object_id = OBJECT_ID('PostComments'))
                    ALTER TABLE [PostComments] DROP COLUMN [PostId1];
            ");
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
