# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY *.sln ./
COPY src/Ergoplanner.Domain/*.csproj ./src/Ergoplanner.Domain/
COPY src/Ergoplanner.Application/*.csproj ./src/Ergoplanner.Application/
COPY src/Ergoplanner.Infrastructure/*.csproj ./src/Ergoplanner.Infrastructure/
COPY src/Ergoplanner.API/*.csproj ./src/Ergoplanner.API/
COPY src/Ergoplanner.Shared/*.csproj ./src/Ergoplanner.Shared/
COPY Ergoplanner.MLServices/*.csproj ./Ergoplanner.MLServices/

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY . .

# Build
WORKDIR /src/src/Ergoplanner.API
RUN dotnet build -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Ergoplanner.API.dll"]