namespace UGram.src.Application.DTOs
{
    public class CommentDto
    {
        public int Id { get; set; }
        public int ImageId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }
}
