using MentoringApp.Core.Models;
using MentoringApp.Core.Validation;
using NUnit.Framework;

namespace MentoringApp.Tests.Validation
{
    [TestFixture]
    public class UserValidatorTests
    {
        [TestCase("validUser")]
        [TestCase("user_name_123")]
        [TestCase("user-name")]
        [TestCase("USER123")]
        public void ValidateRegisterRequest_WhenUsernameIsValid_ShouldNotThrow(string validUsername)
        {
            var request = new RegisterRequest
            {
                FullName = "Test",
                Username = validUsername,
                Email = "test@example.com",
                Password = "StrongP@ssword1"
            };

            Assert.DoesNotThrow(() => UserValidator.ValidateRegisterRequest(request));
        }

        [Test]
        public void ValidateRegisterRequest_WhenUsernameHasSpaces_ShouldThrow()
        {
            var request = new RegisterRequest
            {
                FullName = "Test",
                Username = "user name", // Has space
                Email = "test@example.com",
                Password = "StrongP@ssword1"
            };

            var ex = Assert.Throws<ArgumentException>(() => UserValidator.ValidateRegisterRequest(request));
            Assert.That(ex.Message, Is.EqualTo("Username cannot contain spaces."));
        }

        [TestCase("user@name")]
        [TestCase("user!name")]
        [TestCase("user#name")]
        [TestCase("user.name")] 
        [TestCase("user/name")]
        [TestCase("user\\name")]
        public void ValidateRegisterRequest_WhenUsernameHasForbiddenChars_ShouldThrow(string invalidUsername)
        {
            var request = new RegisterRequest
            {
                FullName = "Test",
                Username = invalidUsername,
                Email = "test@example.com",
                Password = "StrongP@ssword1"
            };

            var ex = Assert.Throws<ArgumentException>(() => UserValidator.ValidateRegisterRequest(request));
            Assert.That(ex.Message, Is.EqualTo("Username contains forbidden characters. Only letters, numbers, '-', and '_' are allowed."));
        }

        [Test]
        public void ValidateRegisterRequest_WhenRequestIsValid_ShouldNotThrow()
        {
            var request = new RegisterRequest
            {
                FullName = "John Doe",
                Username = "johndoe",
                Email = "john.doe@example.com",
                Password = "StrongP@ssword1" // Meets all criteria
            };

            Assert.DoesNotThrow(() => UserValidator.ValidateRegisterRequest(request));
        }

        [Test]
        public void ValidateRegisterRequest_WhenRequiredFieldsAreEmpty_ShouldThrowArgumentException()
        {
            // Case 1: Empty Email
            var reqNoEmail = new RegisterRequest {Username = "a",FullName = "Name", Password = "Pass", Email = "" };
            var ex1 = Assert.Throws<ArgumentException>(() => UserValidator.ValidateRegisterRequest(reqNoEmail));
            Assert.That(ex1.Message, Is.EqualTo("Email is required."));

            // Case 2: Empty Password
            var reqNoPass = new RegisterRequest { Username = "a", FullName = "Name", Email = "a@b.com", Password = "" };
            var ex2 = Assert.Throws<ArgumentException>(() => UserValidator.ValidateRegisterRequest(reqNoPass));
            Assert.That(ex2.Message, Is.EqualTo("Password is required."));

            // Case 3: Empty FullName
            var reqNoName = new RegisterRequest { Username = "a", Email = "a@b.com", Password = "Pass", FullName = "" };
            var ex3 = Assert.Throws<ArgumentException>(() => UserValidator.ValidateRegisterRequest(reqNoName));
            Assert.That(ex3.Message, Is.EqualTo("Full Name is required."));
            
            // Case 4: Empty Username
            var reqNoUsername = new RegisterRequest { Username = "", Email = "a@b.com", Password = "Pass", FullName = "Name" };
            var ex4 = Assert.Throws<ArgumentException>(() => UserValidator.ValidateRegisterRequest(reqNoUsername));
            Assert.That(ex4.Message, Is.EqualTo("Username is required."));
        }

        [TestCase("plainaddress")]
        [TestCase("@missingusername.com")]
        [TestCase("username@.com")]
        [TestCase("username@domain")] // Missing TLD
        [TestCase("user name@domain.com")] // Spaces
        public void ValidateRegisterRequest_WhenEmailIsInvalid_ShouldThrowArgumentException(string invalidEmail)
        {
            var request = new RegisterRequest
            {
                FullName = "John Doe",
                Username = "johndoe",
                Email = invalidEmail,
                Password = "StrongP@ssword1"
            };

            var ex = Assert.Throws<ArgumentException>(() => UserValidator.ValidateRegisterRequest(request));
            Assert.That(ex.Message, Is.EqualTo("Invalid email format."));
        }

        [TestCase("short1!", "Password must be at least 8 characters long.")]
        [TestCase("alllowercase1!", "Password must contain at least one uppercase letter.")]
        [TestCase("ALLUPPERCASE1!", "Password must contain at least one lowercase letter.")]
        [TestCase("NoNumber!", "Password must contain at least one number.")]
        [TestCase("NoSpecialChar1", "Password must contain at least one special character.")]
        public void ValidateRegisterRequest_WhenPasswordIsWeak_ShouldThrowArgumentException(string weakPassword, string expectedMessage)
        {
            var request = new RegisterRequest
            {
                FullName = "John Doe",
                Username = "johndoe",
                Email = "john@example.com",
                Password = weakPassword
            };

            var ex = Assert.Throws<ArgumentException>(() => UserValidator.ValidateRegisterRequest(request));
            Assert.That(ex.Message, Is.EqualTo(expectedMessage));
        }
    }
}