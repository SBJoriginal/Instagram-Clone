using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using UGram.src.Application.DTOs;
using UGram.src.Application.Interfaces;

namespace Api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class CommentController : ControllerBase
  {
    private readonly ICommentService _commentService;
    private readonly IAnalyticsService _analyticsService;

    public CommentController(ICommentService commentService, IAnalyticsService analyticsService)
    {
      _commentService = commentService;
      _analyticsService = analyticsService;
    }

    [Authorize]
    [EnableRateLimiting("InteractionPolicy")]
    [HttpPost]
    public async Task<ActionResult<CommentDto>> AddComment([FromBody] CreateCommentDto createCommentDto)
    {
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
      if (string.IsNullOrEmpty(userId)) return Unauthorized();

      var comment = await _commentService.AddCommentAsync(userId, createCommentDto);
      await _analyticsService.TrackEventAsync("comment_added");
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
