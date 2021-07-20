import User from '../models/User.js';
import config from '../config/config.js';

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
            .cookie("x_auth", token)
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