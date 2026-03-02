using System.ComponentModel.DataAnnotations;

namespace UGram.src.Application.DTOs
{
    public class CreateCommentDto
    {
        [Required]
        public int ImageId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Content { get; set; } = string.Empty;
    }
}
