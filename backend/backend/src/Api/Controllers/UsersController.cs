using backend.Application.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
  private static readonly List<UserDto> Users =
  [
      new()
        {
            Id = 1,
            Username = "alice_martin",
            FirstName = "Alice",
            LastName = "Martin",
            Email = "alice@email.com",
            PhoneNumber = "418-555-0001",
            ProfilePictureUrl = "https://i.pravatar.cc/150?img=1",
            RegistrationDate = "2026-01-10",
        },
        new()
        {
            Id = 2,
            Username = "bob_tremblay",
            FirstName = "Bob",
            LastName = "Tremblay",
            Email = "bob@email.com",
            PhoneNumber = "418-555-0002",
            ProfilePictureUrl = "https://i.pravatar.cc/150?img=2",
            RegistrationDate = "2026-01-12",
        },
        new()
        {
            Id = 3,
            Username = "charlie_roy",
            FirstName = "Charlie",
            LastName = "Roy",
            Email = "charlie@email.com",
            PhoneNumber = "418-555-0003",
            ProfilePictureUrl = "https://i.pravatar.cc/150?img=3",
            RegistrationDate = "2026-01-15",
        },
    ];

  private static readonly List<ImagePostDto> Images =
  [
      new()
        {
            Id = 1,
            UserId = 1,
            ImageUrl = "https://picsum.photos/seed/img1/400/400",
            Description = "Beautiful sunset in Quebec",
            Hashtags = ["#sunset", "#quebec", "#nature"],
            MentionedUser = "bob_tremblay",
            CreatedAt = "2026-01-20",
        },
        new()
        {
            Id = 2,
            UserId = 1,
            ImageUrl = "https://picsum.photos/seed/img2/400/400",
            Description = "Morning coffee",
            Hashtags = ["#coffee", "#morning"],
            MentionedUser = "",
            CreatedAt = "2026-01-18",
        },
        new()
        {
            Id = 3,
            UserId = 2,
            ImageUrl = "https://picsum.photos/seed/img3/400/400",
            Description = "Montreal by night",
            Hashtags = ["#montreal", "#night"],
            MentionedUser = "alice_martin",
            CreatedAt = "2026-01-19",
        },
    ];

  [HttpGet]
  public ActionResult<List<UserDto>> GetAllUsers()
  {
    return Ok(Users);
  }

  [HttpGet("{id}")]
  public ActionResult<UserDto> GetUserById(int id)
  {
    var user = Users.FirstOrDefault(u => u.Id == id);
    if (user == null)
    {
      return NotFound();
    }
    return Ok(user);
  }

  [HttpGet("{id}/images")]
  public ActionResult<List<ImagePostDto>> GetUserImages(int id)
  {
    var user = Users.FirstOrDefault(u => u.Id == id);
    if (user == null)
    {
      return NotFound();
    }
    var userImages = Images.Where(img => img.UserId == id).ToList();
    return Ok(userImages);
  }
}
