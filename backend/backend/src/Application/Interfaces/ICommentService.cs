using UGram.src.Application.DTOs;

namespace Application.Interfaces
{
    public interface ICommentService
    {
        Task<CommentDto> AddCommentAsync(string userId, CreateCommentDto createCommentDto);
        Task<IEnumerable<CommentDto>> GetCommentsByImageIdAsync(int imageId, int page = 1, int pageSize = 10);
        Task<int> GetCommentCountByImageIdAsync(int imageId);
    }
}
