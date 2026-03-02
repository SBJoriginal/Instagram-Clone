using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UGram.src.Application.DTOs;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<CommentDto>> AddComment([FromBody] CreateCommentDto createCommentDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var comment = await _commentService.AddCommentAsync(userId, createCommentDto);
            return Ok(comment);
        }

        [HttpGet("image/{imageId}")]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetComments(int imageId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var comments = await _commentService.GetCommentsByImageIdAsync(imageId, page, pageSize);
            return Ok(comments);
        }
    }
}
