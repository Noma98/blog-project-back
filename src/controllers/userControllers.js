import User from '../models/User.js';
import Folder from '../models/Folder.js';
import Post from '../models/Post.js';
import axios from 'axios';

export const join = async (req, res) => {
    const { email, pwd, name } = req.body;
    const emailExists = await User.findOne({ email });
    if (emailExists) {
        return res.json({
            success: false,
            message: "이미 사용 중인 이메일입니다."
        });
    }
    const nameExists = await User.findOne({ name });
    if (nameExists) {
        return res.json({
            success: false,
            message: "이미 사용 중인 닉네임입니다."
        });
    }
    await User.create({
        email,
        pwd,
        name: name.toLowerCase().replaceAll(" ", ""),
        blogInfo: {
            name: `${name}'s blog`
        },
        socialOnly: false
    });
    return res.status(201).json({
        success: true,
        message: "회원가입 완료"
    });
}
export const updateUserInfo = async (req, res) => {
    try {
        const { userId, name } = req.body;
        const path = req.file?.path;
        if (!name) {
            return res.json({ success: false, message: "이름을 입력하세요." })
        }
        const user = await User.findById(userId);
        if (path) {
            user.avatar = `http://localhost:4000/${path}`;
        }
        if (name !== user.name) {
            //이름이 이전과 다르다면, 중복여부 검사
            const nameExists = await User.findOne({ name });
            if (nameExists || name.match(/\W/)) {
                return res.json({ success: false, message: "이미 사용중인 닉네임이거나 조건에 맞지 않습니다." })
            }
            //중복 안되면,
            user.name = name.toLowerCase().replaceAll(" ", "");
        }
        await user.save();
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: "회원 정보 변경 실패" });
    }
}
export const updateUserPwd = async (req, res) => {
    try {
        const { pwd, newPwd, userId } = req.body;
        const user = await User.findById(userId);
        const match = await User.verifyPwd(pwd, user.pwd);
        if (!match) {
            return res.json({ success: false, message: "현재 비밀번호가 틀립니다." })
        }
        user.pwd = newPwd;
        await user.save();
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: err.message });
    }
}
export const updateBlogInfo = async (req, res) => {
    try {
        const { userId, introduction, name } = req.body;
        await User.findByIdAndUpdate(userId, {
            blogInfo: {
                introduction,
                name
            }
        })
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: err.message });
    }
}
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body;
        await Folder.deleteMany({ owner: userId });
        await Post.deleteMany({ author: userId });
        await User.findByIdAndRemove(userId);
        return res.status(200).json({
            success: true
        })
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: err.message
        })
    }
}
export const login = async (req, res) => {
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
export const logout = async (req, res) => {
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
export const getPublicUser = async (req, res) => {
    const { nickname } = req.body;
    const user = await User.findOne({ name: nickname }).populate("folders");
    if (!user) {
        return res.json({ success: false });
    }
    const { _id, name, email, avatar, blogInfo, folders, socialOnly } = user;
    return res.json({
        success: true,
        payload: { _id, name, email, avatar, blogInfo, folders, socialOnly }
    });
}
export const getAuth = async (req, res) => {
    //여기는 인증 된 유저만.
    //req에 token과 user가 있다.
    const { _id, name } = req.user;
    return res.status(200).json({
        success: true,
        payload: {
            _id,
            name
        }
    });
}
export const socialJoin = async (req, res) => {
    try {
        let { email, name, avatar } = req.body;
        name = name.toLowerCase().replaceAll(" ", "");
        const nameExists = await User.findOne({ name });
        if (nameExists) {
            return res.json({ success: false, message: "이미 사용중인 닉네임입니다." });
        }
        await User.create({
            email,
            name,
            avatar,
            blogInfo: { name: `${name}'s blog` }
        });
        return res.status(201).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: "소셜 가입 실패" });
    }
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
        let { name, avatar_url: avatar } = userData;
        name = name.toLowerCase().replaceAll(" ", "");
        //이미 회원가입 된 email인지 체크
        let user = await User.findOne({ email });
        //없으면 회원가입 Go!
        if (!user) {
            const nameExists = await User.findOne({ name });
            if (nameExists || name.match(/\W/)) {
                return res.status(200).json({ success: "join", payload: { email, name, avatar } });
            };
            await User.create({
                email, name, avatar, blogInfo: { name: `${name}'s blog` }
            })
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
            .json({ success: true, payload: { name: user.name } })
    } catch (err) {
        console.log(err);
        return res.json({
            success: false, error: {
                title: "ERROR",
                message: "깃허브로 로그인 실패"
            }
        });
    }
}
export const kakaoLogin = async (req, res) => {
    try {
        //동의 취소 없음, 필수 요소 체크 해제 불가능
        const { code } = req.body;
        const response = await axios.post(`https://kauth.kakao.com/oauth/token?code=${code}&grant_type=authorization_code&client_id=${process.env.KAKAO_API_KEY}&redirect_uri=http://localhost:3000/oauth/callback/kakao`);
        const access_token = response.data.access_token;
        const userData = await axios.get("https://kapi.kakao.com/v2/user/me", {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        let {
            profile: {
                nickname: name,
                profile_image_url: avatar
            },
            email,
            is_email_verified: isEmailVerified,
        } = userData.data.kakao_account;
        name = name.toLowerCase().replaceAll(" ", "");
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
            const nameExists = await User.findOne({ name });
            if (nameExists || name.match(/\W/)) {
                return res.status(200).json({ success: "join", payload: { email, name, avatar } });
            }
            await User.create({
                email, avatar, name, blogInfo: { name: `${name}'s blog` }
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
            .json({ success: true, payload: { name: user.name } });
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            error: {
                title: "ERROR",
                message: "카카오로 로그인하기 실패"
            }
        });
    }

}
export const kakaoUnlink = async (req, res) => {
    try {
        const { accessToken } = req.body;
        const unlinkedId = await axios({
            url: 'https://kapi.kakao.com/v1/user/unlink',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        if (!unlinkedId.data.id) {
            return res.json({
                success: false, error: {
                    title: "카카오 로그인 연결끊기 실패",
                    message: "엑세스 토큰이 없거나 기한이 만료됐을 수 있습니다. 로그인 페이지로 돌아가 처음부터 다시 시도해보세요."
                }
            })
        }
        return res.status(200).json({
            success: true
        })
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            error: {
                title: "ERROR",
                message: err.message
            }
        })
    }

}
export const googleLogin = async (req, res) => {
    try {
        let { email, name, avatar } = req.body;
        name = name.toLowerCase().replaceAll(" ", "");
        let user = await User.findOne({ email });
        if (!user) {
            const nameExists = await User.findOne({ name });
            if (nameExists || name.match(/\W/)) {
                return res.status(200).json({ success: "join", payload: { name, email, avatar } });
            }
            await User.create({
                email, name, avatar, blogInfo: { name: `${name}'s blog` }
            });
            user = await User.findOne({ email });
        }
        const jwt = User.generateToken(user);
        user.token = jwt;
        await user.save();
        return res
            .status(200)
            .cookie("x_auth", jwt, {
                maxAge: 1000 * 60 * 60 * 24,
                secure: true
            })
            .json({ success: true, payload: { name: user.name } });
    } catch (err) {
        console.log(err);
        return res.json({
            success: false, error: {
                title: "ERROR",
                message: err.message
            }
        })
    }
}
export const naverLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const response = await axios({
            method: "GET",
            url: 'https://openapi.naver.com/v1/nid/me',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        let { nickname: name, profile_image: avatar, email } = response.data.response;
        //네이버는 동의 필수 요소도 체크 안하고 다음 단계로 넘어갈 수 있기 때문에 전부다 체크 되지 않으면 에러메시지 전달하도록 처리
        if (!(name && avatar && email)) {
            return res.json({
                success: false,
                token,
                error: {
                    title: "네이버 로그인 실패",
                    message: "정보 제공 필수 요소에 대해 모두 동의하지 않으면, 네이버로 로그인 및 회원가입 진행이 불가합니다."
                }
            })
        }
        name = name.toLowerCase().replaceAll(" ", "");
        let user = await User.findOne({ email });
        if (!user) {
            const nameExists = await User.findOne({ name });
            if (nameExists || name.match(/\W/)) {
                return res.status(200).json({ success: "join", payload: { email, name, avatar } });
            };
            await User.create({
                email, name, avatar, blogInfo: { name: `${name}'s blog` }
            });
            user = await User.findOne({ email });
        }
        const jwt = User.generateToken(user);
        user.token = jwt;
        await user.save();
        return res
            .status(200)
            .cookie("x_auth", jwt, {
                maxAge: 1000 * 60 * 60 * 24,
                secure: true
            })
            .json({ success: true, payload: { name: user.name } });

    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            token,
            error: {
                title: "ERROR",
                message: err.message
            }
        })
    }


}
export const naverUnlink = async (req, res) => {
    const { token } = req.body;
    try {
        await axios({
            method: "GET",
            baseURL: "https://nid.naver.com/oauth2.0/token",
            params: {
                client_id: process.env.NAVER_CLIENT,
                client_secret: process.env.NAVER_SECRET,
                access_token: token,
                grant_type: 'delete',
                service_provider: "NAVER"
            }
        });
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            token,
            error: {
                title: "ERROR",
                message: err.message
            }
        })
    }
}