using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using UGram.src.Application.DTOs;

namespace Application.Services
{
    public class CommentService : ICommentService
    {
        private readonly AppDbContext _context;

        public CommentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CommentDto> AddCommentAsync(string userId, CreateCommentDto createCommentDto)
        {
            var comment = new Comment
            {
                ImageId = createCommentDto.ImageId,
                UserId = userId,
                Content = createCommentDto.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            var userProfile = await _context.UserProfiles
                .Where(p => p.UserId == userId)
                .Select(p => new { p.UserName, p.ProfilePictureUrl })
                .FirstOrDefaultAsync();

            return new CommentDto
            {
                Id = comment.Id,
                ImageId = comment.ImageId,
                UserId = comment.UserId,
                Username = userProfile?.UserName ?? "Unknown",
                ProfilePictureUrl = userProfile?.ProfilePictureUrl,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt
            };
        }

        public async Task<IEnumerable<CommentDto>> GetCommentsByImageIdAsync(int imageId, int page = 1, int pageSize = 10)
        {
            return await _context.Comments
                .Where(c => c.ImageId == imageId)
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Join(_context.UserProfiles,
                    comment => comment.UserId,
                    profile => profile.UserId,
                    (comment, profile) => new CommentDto
                    {
                        Id = comment.Id,
                        ImageId = comment.ImageId,
                        UserId = comment.UserId,
                        Username = profile.UserName,
                        ProfilePictureUrl = profile.ProfilePictureUrl,
                        Content = comment.Content,
                        CreatedAt = comment.CreatedAt
                    })
                .ToListAsync();
        }

        public async Task<int> GetCommentCountByImageIdAsync(int imageId)
        {
            return await _context.Comments.CountAsync(c => c.ImageId == imageId);
        }
    }
}
