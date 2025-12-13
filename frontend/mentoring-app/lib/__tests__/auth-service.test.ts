/**
 * Tests for auth-service.ts
 * 
 * Tests authentication service functions including:
 * - login
 * - registerUser
 * - logout
 * - Token management (storeToken, getStoredToken, clearToken)
 * - getUserFromToken
 * - parseErrorMessage
 */

import {
  login,
  registerUser,
  logout,
  getStoredToken,
  clearToken,
  getUserFromToken,
  parseErrorMessage,
  API_BASE_URL,
} from '../auth-service';

// Mock fetch globally
global.fetch = jest.fn();

describe('auth-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwic3ViIjoiMTIzNDU2Nzg5MCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImZ1bGxOYW1lIjoiVGVzdCBVc2VyIiwiZXhwIjo5OTk5OTk5OTk5fQ.test';
    
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ token: mockToken }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await login('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.token).toBe(mockToken);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifier: 'test@example.com',
            password: 'password123',
          }),
        }
      );
      expect(localStorage.getItem('mentoring_app_token')).toBeTruthy();
    });

    it('should handle login with username instead of email', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ token: mockToken }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await login('testuser', 'password123');

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            identifier: 'testuser',
            password: 'password123',
          }),
        })
      );
    });

    it('should handle login failure with error message', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ message: 'Invalid credentials' }),
        text: jest.fn(),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await login('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
      expect(result.token).toBeUndefined();
    });

    it('should handle login failure with array of errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ 
          errors: ['Email is required', 'Password is required'] 
        }),
        text: jest.fn(),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await login('', '');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email is required, Password is required');
    });

    it('should handle missing token in response', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await login('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Authentication token is missing from the response.');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await login('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unable to reach the server. Please try again later.');
    });

    it('should handle different token field names', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ Token: mockToken }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await login('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.token).toBe(mockToken);
    });
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const payload = {
        fullName: 'Test User',
        userName: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      };

      const result = await registerUser(payload);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Account created successfully.');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: payload.fullName,
            username: payload.userName,
            email: payload.email,
            password: payload.password,
          }),
        }
      );
    });

    it('should handle registration failure with error message', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ message: 'Email already exists' }),
        text: jest.fn(),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await registerUser({
        fullName: 'Test User',
        userName: 'testuser',
        email: 'existing@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email already exists');
    });

    it('should handle network errors during registration', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await registerUser({
        fullName: 'Test User',
        userName: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unable to reach the server. Please try again later.');
    });
  });

  describe('logout', () => {
    it('should successfully logout with valid token', async () => {
      const mockToken = 'valid.token.here';
      localStorage.setItem('mentoring_app_token', JSON.stringify({ token: mockToken }));

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await logout();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logged out successfully.');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/logout`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(localStorage.getItem('mentoring_app_token')).toBeNull();
    });

    it('should logout even when no token is stored', async () => {
      const result = await logout();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logged out.');
      expect(global.fetch).not.toHaveBeenCalled();
      expect(localStorage.getItem('mentoring_app_token')).toBeNull();
    });

    it('should clear token even if logout API call fails', async () => {
      const mockToken = 'valid.token.here';
      localStorage.setItem('mentoring_app_token', JSON.stringify({ token: mockToken }));

      const mockResponse = {
        ok: false,
        status: 500,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ message: 'Server error' }),
        text: jest.fn(),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await logout();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Server error');
      expect(localStorage.getItem('mentoring_app_token')).toBeNull();
    });

    it('should handle network errors during logout', async () => {
      const mockToken = 'valid.token.here';
      localStorage.setItem('mentoring_app_token', JSON.stringify({ token: mockToken }));

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await logout();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unable to reach the server. Please try again later.');
      expect(localStorage.getItem('mentoring_app_token')).toBeNull();
    });
  });

  describe('Token Management', () => {
    describe('getStoredToken', () => {
      it('should return stored token when valid', () => {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjo5OTk5OTk5OTk5fQ.test';
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        localStorage.setItem('mentoring_app_token', JSON.stringify({ token: mockToken, expiresAt }));

        const result = getStoredToken();

        expect(result).not.toBeNull();
        expect(result?.token).toBe(mockToken);
        expect(result?.expiresAt).toBe(expiresAt);
      });

      it('should return null when no token is stored', () => {
        const result = getStoredToken();
        expect(result).toBeNull();
      });

      it('should return null and remove expired token', () => {
        const expiredDate = new Date(Date.now() - 1000).toISOString();
        localStorage.setItem('mentoring_app_token', JSON.stringify({ 
          token: 'expired.token', 
          expiresAt: expiredDate 
        }));

        const result = getStoredToken();

        expect(result).toBeNull();
        expect(localStorage.getItem('mentoring_app_token')).toBeNull();
      });

      it('should handle invalid JSON in localStorage', () => {
        localStorage.setItem('mentoring_app_token', 'invalid json');

        const result = getStoredToken();

        expect(result).toBeNull();
      });
    });

    describe('clearToken', () => {
      it('should remove token from localStorage', () => {
        localStorage.setItem('mentoring_app_token', JSON.stringify({ token: 'test.token' }));
        
        clearToken();

        expect(localStorage.getItem('mentoring_app_token')).toBeNull();
      });
    });
  });

  describe('getUserFromToken', () => {
    it('should extract user data from valid JWT token', () => {
      // Create a valid JWT payload
      const payload = {
        sub: '1234567890',
        email: 'test@example.com',
        fullName: 'Test User',
      };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      const user = getUserFromToken(token);

      expect(user).not.toBeNull();
      expect(user?.id).toBe('1234567890');
      expect(user?.email).toBe('test@example.com');
      expect(user?.fullName).toBe('Test User');
    });

    it('should return null for invalid token format', () => {
      const user = getUserFromToken('invalid.token');
      expect(user).toBeNull();
    });

    it('should return null for token without payload', () => {
      const user = getUserFromToken('header.signature');
      expect(user).toBeNull();
    });

    it('should handle missing user fields gracefully', () => {
      const payload = {};
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      const user = getUserFromToken(token);

      expect(user).not.toBeNull();
      expect(user?.id).toBe('');
      expect(user?.email).toBe('');
      expect(user?.fullName).toBe('');
    });
  });

  describe('parseErrorMessage', () => {
    it('should parse JSON error message', async () => {
      const mockResponse = {
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ message: 'Error message' }),
        text: jest.fn(),
      };

      const result = await parseErrorMessage(mockResponse as unknown as Response);

      expect(result).toBe('Error message');
    });

    it('should parse string error message', async () => {
      const mockResponse = {
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue('String error message'),
        text: jest.fn(),
      };

      const result = await parseErrorMessage(mockResponse as unknown as Response);

      expect(result).toBe('String error message');
    });

    it('should parse array of errors', async () => {
      const mockResponse = {
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ errors: ['Error 1', 'Error 2'] }),
        text: jest.fn(),
      };

      const result = await parseErrorMessage(mockResponse as unknown as Response);

      expect(result).toBe('Error 1, Error 2');
    });

    it('should parse text error message', async () => {
      const mockResponse = {
        headers: {
          get: jest.fn().mockReturnValue('text/plain'),
        },
        json: jest.fn(),
        text: jest.fn().mockResolvedValue('Plain text error'),
      };

      const result = await parseErrorMessage(mockResponse as unknown as Response);

      expect(result).toBe('Plain text error');
    });

    it('should return fallback message for invalid response', async () => {
      const mockResponse = {
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockRejectedValue(new Error('Parse error')),
        text: jest.fn(),
      };

      const result = await parseErrorMessage(mockResponse as unknown as Response);

      expect(result).toBe('Something went wrong. Please try again.');
    });
  });
});

