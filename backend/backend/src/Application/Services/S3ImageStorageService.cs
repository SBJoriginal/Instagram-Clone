using Amazon.S3;
using Amazon.S3.Model;
using UGram.src.Application.Interfaces;

namespace UGram.src.Application.Services
{
  public class S3ImageStorageService : IImageStorageService
  {
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly int _expirationMinutes;

    public S3ImageStorageService(IAmazonS3 s3Client, IConfiguration configuration)
    {
      _s3Client = s3Client;
      _bucketName = configuration["S3:BucketName"] ?? throw new ArgumentNullException("S3:BucketName config is missing");
      _expirationMinutes = configuration.GetValue<int>("S3:PresignedUrlExpirationMinutes", 60);
    }

    public async Task<string> SaveImageAsync(IFormFile file, string folder)
    {
      if (file == null || file.Length == 0)
        throw new ArgumentException("File is empty or null.", nameof(file));

      var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
      var objectKey = $"{folder}/{uniqueFileName}".Replace("\\", "/");

      using (var stream = file.OpenReadStream())
      {
        var putRequest = new PutObjectRequest
        {
          BucketName = _bucketName,
          Key = objectKey,
          InputStream = stream,
          ContentType = file.ContentType
          // ACL = S3CannedACL.PublicRead (Not using public read as per requirement)
        };

        await _s3Client.PutObjectAsync(putRequest);
      }

      // Return the object key so it can be stored in the DB
      return objectKey;
    }

    public async Task DeleteImageAsync(string filePath)
    {
      if (string.IsNullOrEmpty(filePath))
        return;

      var deleteRequest = new DeleteObjectRequest
      {
        BucketName = _bucketName,
        Key = filePath
      };

      await _s3Client.DeleteObjectAsync(deleteRequest);
    }

    public string GetImageUrl(string filePath)
    {
      if (string.IsNullOrEmpty(filePath))
        return string.Empty;

      // If it's already a full HTTP URL (e.g., from an older local implementation or a dummy test), return it
      if (filePath.StartsWith("http") || filePath.StartsWith("https"))
        return filePath;

      var request = new GetPreSignedUrlRequest
      {
        BucketName = _bucketName,
        Key = filePath,
        Expires = DateTime.UtcNow.AddMinutes(_expirationMinutes)
      };

      return _s3Client.GetPreSignedURL(request);
    }
  }
}
