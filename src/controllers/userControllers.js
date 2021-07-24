import User from '../models/User.js';

export const postJoin = async (req, res) => {
    const { email, pwd, name } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        return res.json({
            success: false,
            message: "이미 사용 중인 이메일입니다."
        });
    }
    await User.create({
        email,
        pwd,
        name,
    });
    return res.status(201).json({
        success: true,
        message: "회원가입 완료"
    });
}
export const postLogin = async (req, res) => {
    try {
        const { email, pwd } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: "존재하지 않는 이메일입니다."
            })
        }
        const isMatch = await User.verifyPwd(pwd, user.pwd);
        if (!isMatch) {
            return res.json({
                success: false,
                message: "비밀번호가 틀렸습니다."
            })
        }
        const token = await User.generateToken(user);
        user.token = token;
        await user.save();
        return res
            .status(200)
            .cookie("x_auth", token, { httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 24 })
            .json({
                success: true,
                message: "로그인 성공",
                token
            });
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: err.message
        })
    }
}
export const getLogout = async (req, res) => {
    //로그인을 했었다면 auth 미들웨어를 거치면서 req에 토큰과 유저 정보를 받아서 온다.
    try {
        await User.findOneAndUpdate({ _id: req.user._id }, {
            token: ""
        });
        return res.cookie("x_auth", "none", {
            maxAge: 5000,
            httpOnly: true,
            secure: true
        }).json({
            success: true,
            message: "로그아웃 성공!"
        });
    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: err.message });
    }
}
export const getAuth = async (req, res) => {
    //여기는 인증 된 유저만.
    //req에 token과 user가 있다.
    const { _id, name, email, avatar, blogInfo, folders } = req.user;
    return res.status(200).json({
        success: true,
        isAuth: true,
        _id,
        name,
        email,
        avatar,
        blogInfo,
        folders
    });
}