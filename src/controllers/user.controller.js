
import { asyncHandler } from '../utils/AsyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import HttpStatus from '../utils/HttpStatus.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary }  from '../utils/Cloudinary.js'
import { lowercase } from '../utils/StringUtils.js'


const registerUser = asyncHandler ( async (req,res) =>{

    // TODO:
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(HttpStatus.CONFLICT, "User with email or username already exists")
    }

    // Convert username to lowercase
    const lowercaseUsername = lowercase(username);

    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: lowercaseUsername
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong while registering the user")
    }

    return res.status(HttpStatus.CREATED).json(
        new ApiResponse(HttpStatus.OK, createdUser, "User registered Successfully")
    )


})

export {
    registerUser
}




