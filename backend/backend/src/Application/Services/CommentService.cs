using Application.Interfaces;
using System.Net;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;

namespace Application.Services
{
  public class CommentService : ICommentService
  {
    private readonly AppDbContext _context;
    private readonly IImageStorageService _imageStorageService;

    public CommentService(AppDbContext context, IImageStorageService imageStorageService)
    {
      _context = context;
      _imageStorageService = imageStorageService;
    }

    public async Task<CommentDto> AddCommentAsync(string userId, CreateCommentDto createCommentDto)
    {
      var comment = new Comment
      {
        ImageId = createCommentDto.ImageId,
        UserId = userId,
        Content = WebUtility.HtmlEncode(createCommentDto.Content),
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
        ProfilePictureUrl = !string.IsNullOrEmpty(userProfile?.ProfilePictureUrl)
            ? await _imageStorageService.GetImageUrlAsync(userProfile.ProfilePictureUrl)
            : null,
        Content = comment.Content,
        CreatedAt = comment.CreatedAt
      };
    }

    public async Task<IEnumerable<CommentDto>> GetCommentsByImageIdAsync(int imageId, int page = 1, int pageSize = 10)
    {
      var comments = await _context.Comments
          .Where(c => c.ImageId == imageId)
          .OrderByDescending(c => c.CreatedAt)
          .Skip((page - 1) * pageSize)
          .Take(pageSize)
          .Join(_context.UserProfiles,
              comment => comment.UserId,
              profile => profile.UserId,
              (comment, profile) => new { comment, profile })
          .ToListAsync();

      var commentDtos = new List<CommentDto>();
      foreach (var item in comments)
      {
        commentDtos.Add(new CommentDto
        {
          Id = item.comment.Id,
          ImageId = item.comment.ImageId,
          UserId = item.comment.UserId,
          Username = item.profile.UserName,
          ProfilePictureUrl = !string.IsNullOrEmpty(item.profile.ProfilePictureUrl)
            ? await _imageStorageService.GetImageUrlAsync(item.profile.ProfilePictureUrl)
            : null,
          Content = item.comment.Content,
          CreatedAt = item.comment.CreatedAt
        });
      }

      return commentDtos;
    }

    public async Task<int> GetCommentCountByImageIdAsync(int imageId)
    {
      return await _context.Comments.CountAsync(c => c.ImageId == imageId);
    }
  }
}
