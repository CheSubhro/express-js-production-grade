
import HttpStatus from './HttpStatus'

class ApiResponse {

    constructor(statusCode, data, message = "Success"){

        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < HttpStatus.BAD_REQUEST
    }
} 

export { ApiResponse }