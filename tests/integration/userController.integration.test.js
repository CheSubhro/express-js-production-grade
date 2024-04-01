
// Import dependencies
import request from 'supertest';
import app from '../app'; // Assuming your Express app is exported from app.js
import { User } from '../models/user.model';
import { uploadOnCloudinary } from '../utils/Cloudinary';
import { lowercase } from '../utils/StringUtils';

// Mock Cloudinary upload function
jest.mock('../utils/Cloudinary', () => ({
  uploadOnCloudinary: jest.fn(),
}));

// Mock StringUtils lowercase function
jest.mock('../utils/StringUtils', () => ({
  lowercase: jest.fn(),
}));

describe('User registration integration test', () => {
  it('should register a new user successfully', async () => {
    // Mock Cloudinary response
    uploadOnCloudinary.mockResolvedValueOnce({ url: 'http://example.com/avatar.jpg' });

    // Mock StringUtils response
    lowercase.mockReturnValueOnce('johndoe');

    // Create a mock user registration payload
    const newUserPayload = {
      fullName: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'password123',
    };

    // Make a request to register a new user
    const response = await request(app)
      .post('/register')
      .field('fullName', newUserPayload.fullName)
      .field('email', newUserPayload.email)
      .field('username', newUserPayload.username)
      .field('password', newUserPayload.password)
      .attach('avatar', '/path/to/avatar.jpg'); // Assuming you have an avatar file for testing

    // Assert the response status code
    expect(response.status).toBe(201);

    // Assert the response body
    expect(response.body).toEqual({
      statusCode: 200,
      data: expect.objectContaining({
        _id: expect.any(String),
        fullName: newUserPayload.fullName,
        email: newUserPayload.email,
        username: newUserPayload.username,
      }),
      message: 'User registered Successfully',
    });

    // Assert that the user is saved in the database
    const registeredUser = await User.findOne({ email: newUserPayload.email });
    expect(registeredUser).toBeTruthy();
    expect(registeredUser.username).toBe(newUserPayload.username);
  });
});
