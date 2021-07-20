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
