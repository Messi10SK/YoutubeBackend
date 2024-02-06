import  express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'

const app= express()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true,
}))

// app.use() in Express mounts middleware functions to handle incoming requests, allowing them to modify request and response objects and pass control to the next middleware. It's essential for managing the request-response cycle and performing tasks like authentication, logging, and error handling.
// credentials: true: This option enables credentials for CORS requests. When set to true, it allows cookies, authorization headers, and TLS client certificates to be included in the CORS request. This is useful when you need to support authenticated cross-origin requests.

// These lines of code configure middleware for various purposes in an Express application:

app.use(express.json({limit :"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
// The extended: true option allows parsing of nested objects in the URL-encoded data.
app.use(express.static("public"))
// The express.static() method is used to serve static files from a directory.
app.use(cookieParser())
// The cookieParser() method is used to parse cookies from the request header and populate req.cookies with an object keyed by the cookie names.


//routes import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"


//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter) 


// http://localhost:8000/users/register  "this url "

export {app} 