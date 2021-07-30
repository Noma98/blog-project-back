import User from '../models/User.js';
import axios from 'axios';

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
export const githubLogin = async (req, res) => {
    try {
        const { code } = req.body;
        const tokenRequest = await (await axios.post("https://github.com/login/oauth/access_token",
            {
                client_id: process.env.GITHUB_DEV_CLIENT,
                client_secret: process.env.GITHUB_DEV_SECRET,
                code,
            }, {
            headers: {
                accept: 'application/json'
            }
        })).data;
        if (!"access_token" in tokenRequest) {
            return res.json({
                success: false, error: {
                    title: "ERROR",
                    message: "액세스 토큰이 없습니다."
                }
            })
        }
        const token = tokenRequest.access_token;
        //토큰 이용해서 유저 데이터 받아오기
        const emailData = await (await axios.get("https://api.github.com/user/emails", {
            headers: {
                Authorization: `token ${token}`
            }
        })).data;
        const userData = await (await axios.get("https://api.github.com/user", {
            headers: {
                Authorization: `token ${token}`
            }
        })).data;
        const email = emailData.find(x => x.primary && x.verified).email;
        const { name, avatar_url: avatar } = userData;

        //이미 회원가입 된 email인지 체크
        let user = await User.findOne({ email });
        //없으면 회원가입 Go!
        if (!user) {
            await User.create({
                email,
                name,
                avatar
            });
            user = await User.findOne({ email });
        }
        //있는 email이면 로그인 Go! JWT 토큰 생성!
        const jwt = User.generateToken(user);
        user.token = jwt;
        await user.save();
        return res
            .status(200)
            .cookie("x_auth", jwt, {
                httpOnly: true,
                secure: true,
                maxAge: 1000 * 60 * 60 * 24
            })
            .json({ success: true })
    } catch (err) {
        console.log(err);
        return res.json({
            success: false, error: {
                title: "ERROR",
                message: "로그인 실패"
            }
        });
    }
}
export const kakaoLogin = async (req, res) => {
    try {
        const { code } = req.body;
        const response = await axios.post(`https://kauth.kakao.com/oauth/token?code=${code}&grant_type=authorization_code&client_id=${process.env.KAKAO_API_KEY}&redirect_uri=http://localhost:3000/oauth/callback/kakao`);
        const access_token = response.data.access_token;
        const userData = await axios.get("https://kapi.kakao.com/v2/user/me", {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        const {
            profile: {
                nickname: name,
                profile_image_url: avatar
            },
            email,
            is_email_verified: isEmailVerified,
        } = userData.data.kakao_account;
        if (!email) {
            return res.json({
                success: false,
                token: access_token,
                error: {
                    title: "카카오 로그인 실패", message: "이메일 사용에 동의하지 않으면 로그인이 불가능합니다."
                }
            });
        }
        if (!isEmailVerified) {
            return res.json({
                success: false,
                token: access_token,
                error: {
                    title: "카카오 로그인 실패", message: "이 앱에서는 인증된 이메일만을 활용합니다.\n 카카오에서 해당 이메일을 인증했는지 확인하세요."
                }
            })
        }
        // 이메일이 이미 회원가입 된 정보면 그냥 로그인 시켜주기, 없으면 생성후 로그인
        let user = await User.findOne({ email });
        if (!user) {
            await User.create({
                email,
                avatar,
                name
            });
            user = await User.findOne({ email });
        }
        const jwt = User.generateToken(user);
        user.token = jwt;
        await user.save();
        return res
            .status(200)
            .cookie("x_auth", jwt, {
                secure: true,
                maxAge: 1000 * 60 * 60 * 24
            })
            .json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({
            success: false, error: {
                title: "ERROR",
                message: err.message
            }
        });
    }

}
}
        })
    }

}