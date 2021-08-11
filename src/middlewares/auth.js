import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
    /*
    1.클라이언트로부터 토큰 가져오기
    2.토큰을 디코딩해서 유저 정보 찾기
    3.해당 토큰이 존재하는 유저가 있으면 req에 유저정보 넣어주기
    */
    const token = req.cookies.x_auth;
    const user = await User.findByToken(token);
    if (!user) {
        return res.json({
            success: false
        });
    }
    req.user = user;
    next();
}

