/**
 * Mock authentication service for frontend development
 * 
 * This module provides mock authentication functionality using localStorage
 * for data persistence. It simulates user registration, login, logout, and
 * token management. This will be replaced with actual API calls when the
 * backend is ready.
 * 
 * @module lib/mock-auth
 */

/**
 * User interface representing a user account in the system
 */
export interface User {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  password: string; // After backend is ready, this will be hashed
  createdAt: string;
}

/**
 * Response interface for signup operations
 */
export interface SignupResponse {
  success: boolean;
  message?: string;
  user?: Omit<User, 'password'>;
}

/**
 * Response interface for login operations
 */
export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: Omit<User, 'password'>;
}

/**
 * Authentication token data structure stored in localStorage
 */
export interface AuthToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: string;
}

// In-memory storage for demo (will use localStorage for persistence)
const STORAGE_KEY = 'mentoring_app_users';
const TOKEN_STORAGE_KEY = 'mentoring_app_token';

/**
 * Retrieves all users from localStorage
 * 
 * @returns {User[]} Array of all registered users, or empty array if none exist or on server-side
 * @private
 */
function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Saves users array to localStorage
 * 
 * @param {User[]} users - Array of user objects to save
 * @private
 */
function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users to localStorage:', error);
  }
}

/**
 * Checks if a user with the given email or username already exists
 * 
 * @param {string} email - Email address to check
 * @param {string} userName - Username to check
 * @returns {boolean} True if a user with the email or username exists, false otherwise
 * @private
 */
function userExists(email: string, userName: string): boolean {
  const users = getUsers();
  return users.some(
    (user) => user.email.toLowerCase() === email.toLowerCase() || 
              user.userName.toLowerCase() === userName.toLowerCase()
  );
}

/**
 * Creates a new user account with the provided information
 * 
 * Validates input fields, checks for duplicate email/username, creates a new user,
 * and stores it in localStorage.
 * 
 * @param {string} fullName - User's full name (minimum 1 character after trim)
 * @param {string} userName - Unique username (minimum 1 character after trim)
 * @param {string} email - Unique email address (will be normalized to lowercase)
 * @param {string} password - User's password (stored as plain text in mock, should be hashed after backend is ready)
 * @returns {Promise<SignupResponse>} Response object with success status, message, and user data (without password)
 * 
 * @example
 * const response = await mockSignup("John Doe", "johndoe", "john@example.com", "password123");
 * if (response.success) {
 *   console.log("User created:", response.user);
 * }
 */
export async function mockSignup(
  fullName: string,
  userName: string,
  email: string,
  password: string
): Promise<SignupResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Validate inputs
  if (!fullName.trim() || !userName.trim() || !email.trim() || !password) {
    return {
      success: false,
      message: 'All fields are required',
    };
  }

  // Check if user already exists
  if (userExists(email, userName)) {
    return {
      success: false,
      message: 'Email or username already exists',
    };
  }

  // Create new user
  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fullName: fullName.trim(),
    userName: userName.trim(),
    email: email.trim().toLowerCase(),
    password, // After backend is ready, this will be hashed
    createdAt: new Date().toISOString(),
  };

  // Save to localStorage
  const users = getUsers();
  users.push(newUser);
  saveUsers(users);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;

  return {
    success: true,
    message: 'Account created successfully',
    user: userWithoutPassword,
  };
}

/**
 * Retrieves all registered users (for debugging and testing purposes)
 * 
 * @returns {User[]} Array of all users including passwords ( used for testing purposes only just to verify if everything is working as expected)
 * 
 * @example
 * const users = getAllUsers();
 * console.log(`Total users: ${users.length}`);
 */
export function getAllUsers(): User[] {
  return getUsers();
}

/**
 * Generates a mock JWT-like authentication token
 * 
 * Creates a base64-encoded token containing user ID, email, issued at time,
 * and expiration time (7 days from now). This is not a secure implementation
 * and will be replaced with a proper JWT signed by the backend after it is ready.
 * 
 * @param {string} userId - Unique user identifier
 * @param {string} email - User's email address
 * @returns {string} Base64-encoded token string
 * @private
 */
function generateToken(userId: string, email: string): string {
  // After backend is ready, this will be a proper JWT signed by the backend
  // For mock purposes, we'll create a simple token
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };
  
  // Simple base64 encoding for mock purposes
  return btoa(JSON.stringify(payload));
}

/**
 * Stores authentication token and related data in localStorage
 * 
 * Saves the token along with user ID, email, and expiration date (7 days from now)
 * to localStorage for session persistence.
 * 
 * @param {string} token - Authentication token string
 * @param {string} userId - User ID associated with the token
 * @param {string} email - User's email address
 * @private
 */
function storeToken(token: string, userId: string, email: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const authData: AuthToken = {
      token,
      userId,
      email,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(authData));
  } catch (error) {
    console.error('Failed to store token:', error);
  }
}

/**
 * Retrieves the stored authentication token from localStorage
 * 
 * Checks if a token exists and if it's still valid (not expired).
 * Automatically clears expired tokens.
 * 
 * @returns {AuthToken | null} Token data if valid token exists, null otherwise
 * 
 * @example
 * const token = getStoredToken();
 * if (token) {
 *   console.log("User is authenticated:", token.email);
 * }
 */
export function getStoredToken(): AuthToken | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) return null;
    
    const authData: AuthToken = JSON.parse(stored);
    
    // Check if token is expired
    if (new Date(authData.expiresAt) < new Date()) {
      clearToken();
      return null;
    }
    
    return authData;
  } catch {
    return null;
  }
}

/**
 * Removes the authentication token from localStorage
 * 
 * Clears the stored token, effectively logging out the user.
 * This function is called automatically when tokens expire.
 * 
 * @example
 * clearToken(); // User is now logged out
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Logs out the current user by clearing the authentication token
 * 
 * This is a convenience function that calls clearToken().
 * Use this when you need to explicitly log out a user.
 * 
 * @example
 * logout(); // User is logged out
 */
export function logout(): void {
  clearToken();
}

/**
 * Authenticates a user with email and password
 * 
 * Validates credentials against stored users, generates an authentication token
 * if successful, and stores it in localStorage.
 * @param {string} email - User's email address (case-insensitive, whitespace trimmed)
 * @param {string} password - User's password (must match exactly)
 * @returns {Promise<LoginResponse>} Response object with success status, message, token, and user data
 * 
 * @example
 * const response = await mockLogin("john@example.com", "password123");
 * if (response.success) {
 *   console.log("Logged in as:", response.user?.fullName);
 *   // Token is automatically stored in localStorage
 * }
 */
export async function mockLogin(
  email: string,
  password: string
): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Validate inputs
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    return {
      success: false,
      message: 'Email and password are required',
    };
  }

  // Find user by email
  const users = getUsers();
  const normalizedEmail = trimmedEmail.toLowerCase();
  const user = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );

  // Check if user exists
  if (!user) {
    return {
      success: false,
      message: 'Invalid email or password',
    };
  }

  // Check password (after backend is ready, this will compare hashed passwords)
  if (user.password !== password) {
    return {
      success: false,
      message: 'Invalid email or password',
    };
  }

  // Generate token
  const token = generateToken(user.id, user.email);

  // Store token
  storeToken(token, user.id, user.email);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;

  return {
    success: true,
    message: 'Login successful',
    token,
    user: userWithoutPassword,
  };
}

/**
 * Checks if the current user is authenticated
 * 
 * Determines authentication status by checking if a valid (non-expired) token
 * exists in localStorage.
 * 
 * @returns {boolean} True if user has a valid token, false otherwise
 * 
 * @example
 * if (isAuthenticated()) {
 *   // Show authenticated content
 * } else {
 *   // Redirect to login
 * }
 */
export function isAuthenticated(): boolean {
  return getStoredToken() !== null;
}

/**
 * Retrieves the current authenticated user's information
 * 
 * Looks up the user associated with the stored authentication token
 * and returns their data (without password).
 * 
 * @returns {Omit<User, 'password'> | null} User object without password, or null if not authenticated
 * 
 * @example
 * const user = getCurrentUser();
 * if (user) {
 *   console.log(`Welcome, ${user.fullName}!`);
 * }
 */
export function getCurrentUser(): Omit<User, 'password'> | null {
  const authData = getStoredToken();
  if (!authData) return null;

  const users = getUsers();
  const user = users.find((u) => u.id === authData.userId);
  
  if (!user) return null;
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Clears all users and authentication tokens used for testing
 * 
 * WARNING: This will delete all registered users and log out the current user.
 * Only use this function if you want to test the authentication system by clearing all data.
 * 
 * @example
 * clearAllUsers(); // All data cleared
 */
export function clearAllUsers(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  clearToken();
}

