# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["backend/backend/UGram.csproj", "backend/"]
RUN dotnet restore "backend/UGram.csproj"

# Copy the rest of the source code
COPY backend/backend/ backend/
WORKDIR "/src/backend"

# Build the application
RUN dotnet build "UGram.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "UGram.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy published output from publish stage
COPY --from=publish /app/publish .

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Docker

# Run the application
ENTRYPOINT ["dotnet", "UGram.dll"]
