import User from '../models/User.js'

export const createUser = async (data, socialOnly) => {
    const { email, pwd, name, avatar } = data;
    await User.create({
        email,
        name,
        blogInfo: {
            name: `${name}'s blog`
        },
        ...(socialOnly && { socialOnly }),
        ...(pwd && { pwd }),
        ...(avatar && { avatar })
    });
}
export const socialJoinAndLogin = async (data, res) => {
    let { email, name, avatar } = data;
    name = name.toLowerCase().replace(/ /g, "");

    //이미 가입된 email인지 체크
    let user = await User.findOne({ email });

    //회원 X => 가입
    if (!user) {
        const nameExists = await User.findOne({ name });
        if (nameExists || name.match(/\W/)) {
            return res.status(200).json({ success: "join", payload: { email, name, avatar } });
        };
        user = new User({
            email,
            name: name.toLowerCase().replace(/ /g, ""),
            blogInfo: {
                name: `${name}'s blog`
            },
            avatar,
        })
    }
    //회원 O => 로그인 (JWT 토큰 생성)
    const jwt = User.generateToken(user);
    user.token = jwt;
    await user.save();
    return res
        .status(200)
        .cookie("x_auth", jwt, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 1000 * 60 * 60 * 24
        })
        .json({ success: true, payload: { name: user.name } })
}