export default {
    isHeroku: process.env.NODE_ENV === "production",
    port: process.env.PORT || 4000,
    mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blog",
    tokenSecret: process.env.TOKEN_SECRET
};