
// Import dependencies and the function to be tested
import { registerUser } from '../controllers/userController';
import { User } from '../models/user.model';
import { uploadOnCloudinary } from '../utils/Cloudinary';
import { lowercase } from '../utils/StringUtils';
import { ApiError } from '../utils/ApiError';
import HttpStatus from '../utils/HttpStatus';

// Mock dependencies
jest.mock('../models/user.model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../utils/Cloudinary', () => ({
  uploadOnCloudinary: jest.fn(),
}));
jest.mock('../utils/StringUtils', () => ({
  lowercase: jest.fn(),
}));

describe('registerUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    // Mock request and response objects
    const req = {
      body: {
        fullName: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
      },
      files: {
        avatar: [{ path: '/path/to/avatar.jpg' }],
        // Mock coverImage if needed
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock user data and methods
    const mockUser = { _id: 'mockUserId', username: 'johndoe', email: 'john@example.com' };
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce(mockUser);
    uploadOnCloudinary.mockResolvedValueOnce({ url: 'http://example.com/avatar.jpg' });
    lowercase.mockReturnValueOnce('johndoe');

    // Call the function
    await registerUser(req, res);

    // Assertions
    expect(User.findOne).toHaveBeenCalledWith({ $or: [{ username: 'johndoe' }, { email: 'john@example.com' }] });
    expect(User.create).toHaveBeenCalledWith({
      fullName: 'John Doe',
      avatar: 'http://example.com/avatar.jpg',
      coverImage: '',
      email: 'john@example.com',
      password: 'password123',
      username: 'johndoe',
    });
    expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.OK,
      data: { _id: 'mockUserId', username: 'johndoe', email: 'john@example.com' },
      message: 'User registered Successfully',
    });
  });

  // Add more test cases for error handling, duplicate user, missing fields, etc.
});
