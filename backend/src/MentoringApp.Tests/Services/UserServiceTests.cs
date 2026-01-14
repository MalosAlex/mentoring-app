using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Models;
using MentoringApp.Core.Services;
using MentoringApp.Persistance.Abstractions;
using MentoringApp.Persistance.Entities;
using Microsoft.Extensions.Configuration;
using NSubstitute;
using NUnit.Framework;

namespace MentoringApp.Tests.Services
{
    [TestFixture]
    public class UserServiceTests
    {
        private IUserRepository _userRepository;
        private IConfiguration _configuration;
        private IUserService _userService;

        [SetUp]
        public void Setup()
        {
            _userRepository = Substitute.For<IUserRepository>();
            _configuration = Substitute.For<IConfiguration>();
            _configuration["Jwt:Key"].Returns("ThisIsASecretKeyForTestingTheJwtTokenGeneration123!"); // Must be >16 chars
            _configuration["Jwt:Issuer"].Returns("TestIssuer");
            _configuration["Jwt:Audience"].Returns("TestAudience");

            _userService = new UserService(_userRepository, _configuration);
        }

        // ==============================================================================
        // REGISTER TESTS
        // Coverage Goals: Happy Path, Duplicate Email, Duplicate Username, Validation Trigger
        // ==============================================================================

        [Test]
        public async Task RegisterUserAsync_WhenValidRequest_ShouldHashPasswordAndAddUser()
        {
            var request = new RegisterRequest
            {
                FullName = "New User",
                Username = "newuser",
                Email = "new@example.com",
                Password = "StrongP@ssword1" 
            };

            // Setup: User does NOT exist by email AND does NOT exist by username
            _userRepository.GetUserByEmailAsync(request.Email).Returns((User?)null);
            _userRepository.GetUserByUsernameAsync(request.Username).Returns((User?)null);

            await _userService.RegisterUserAsync(request);

            await _userRepository.Received(1).AddUserAsync(Arg.Is<User>(u =>
                u.Email == request.Email &&
                u.Username == request.Username &&
                u.FullName == request.FullName &&
                u.PasswordHash != request.Password // Ensure hashing happened
            ));
        }

        [Test]
        public void RegisterUserAsync_WhenEmailAlreadyExists_ShouldThrowException()
        {
            var request = new RegisterRequest
            {
                FullName = "Test", Username = "user", Email = "exists@example.com", Password = "StrongP@ssword1"
            };

            // Setup: Email finds a user
            _userRepository.GetUserByEmailAsync(request.Email).Returns(new User { Id = 1 });

            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () => 
                await _userService.RegisterUserAsync(request));

            Assert.That(ex.Message, Does.Contain("User already exists"));
            
            // Ensure we stopped before adding
            _userRepository.DidNotReceive().AddUserAsync(Arg.Any<User>());
        }

        [Test]
        public void RegisterUserAsync_WhenUsernameAlreadyExists_ShouldThrowException()
        {
            var request = new RegisterRequest
            {
                FullName = "Test", Username = "exists", Email = "new@example.com", Password = "StrongP@ssword1"
            };

            // Setup: Email is null (not found), BUT Username finds a user
            _userRepository.GetUserByEmailAsync(request.Email).Returns((User?)null);
            _userRepository.GetUserByUsernameAsync(request.Username).Returns(new User { Id = 1 });

            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () => 
                await _userService.RegisterUserAsync(request));

            Assert.That(ex.Message, Does.Contain("User already exists"));
        }

        [Test]
        public void RegisterUserAsync_WhenValidationFails_ShouldThrowArgumentException()
        {
            // This ensures the Integration with UserValidator works
            var request = new RegisterRequest
            {
                FullName = "Test", Username = "test", Email = "invalid-email", Password = "pass"
            };

            Assert.ThrowsAsync<ArgumentException>(async () => await _userService.RegisterUserAsync(request));
            
            // Database should never be touched
            _userRepository.DidNotReceive().GetUserByEmailAsync(Arg.Any<string>());
        }

        // ==============================================================================
        // LOGIN TESTS
        // Coverage Goals: Login by Email, Login by Username, Wrong Password, User Not Found, Token Gen
        // ==============================================================================

        [Test]
        public async Task LoginAsync_WhenValidEmail_ShouldReturnToken()
        {
            var password = "StrongP@ssword1";
            var request = new LoginRequest { Identifier = "test@example.com", Password = password }; // Contains '@'

            var user = new User
            {
                Id = 1,
                Email = "test@example.com",
                FullName = "Test User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
            };

            // Setup: Mock finding user by EMAIL
            _userRepository.GetUserByEmailAsync(request.Identifier).Returns(user);

            var token = await _userService.LoginAsync(request);

            Assert.That(token, Is.Not.Null.And.Not.Empty);
            await _userRepository.Received(1).GetUserByEmailAsync(request.Identifier);
            await _userRepository.DidNotReceive().GetUserByUsernameAsync(Arg.Any<string>()); // Verify logic branch
        }

        [Test]
        public async Task LoginAsync_WhenValidUsername_ShouldReturnToken()
        {
            var password = "StrongP@ssword1";
            var request = new LoginRequest { Identifier = "myusername", Password = password }; // No '@'

            var user = new User
            {
                Id = 1,
                Username = "myusername",
                Email = "dummy@example.com",
                FullName = "Test User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
            };

            // Setup: Mock finding user by USERNAME
            _userRepository.GetUserByUsernameAsync(request.Identifier).Returns(user);

            var token = await _userService.LoginAsync(request);

            Assert.That(token, Is.Not.Null.And.Not.Empty);
            await _userRepository.Received(1).GetUserByUsernameAsync(request.Identifier);
            await _userRepository.DidNotReceive().GetUserByEmailAsync(Arg.Any<string>()); // Verify logic branch
        }

        [Test]
        public async Task LoginAsync_WhenUserNotFound_ShouldReturnNull()
        {
            var request = new LoginRequest { Identifier = "unknown@example.com", Password = "pass" };
            _userRepository.GetUserByEmailAsync(request.Identifier).Returns((User?)null);

            var result = await _userService.LoginAsync(request);

            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task LoginAsync_WhenPasswordIsIncorrect_ShouldReturnNull()
        {
            var request = new LoginRequest { Identifier = "test@example.com", Password = "WrongPassword" };
            var user = new User
            {
                Id = 1,
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword")
            };

            _userRepository.GetUserByEmailAsync(request.Identifier).Returns(user);

            var result = await _userService.LoginAsync(request);

            Assert.That(result, Is.Null);
        }
    }
}