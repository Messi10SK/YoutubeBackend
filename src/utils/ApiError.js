class ApiError extends Errors {
constructor(
    statusCode, 
    message = "something went wrong",
    errors = [],
    statck = ""
){
    super(message)
    this.statusCode = statusCode
    this.data = null
   this.message =message
   this.success = false;
    this.errors=errors
    this.stack = statck

if (statck) {
    this.stack = statck;
} else {
Error.captureStackTrace(this, this.constructor)
}
}

}


export {ApiError}