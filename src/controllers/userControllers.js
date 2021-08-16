import User from '../models/User.js';
import Folder from '../models/Folder.js';
import Post from '../models/Post.js';
import axios from 'axios';
import * as common from '../common/common.js';

export const join = async (req, res) => {
    let { email, pwd, name } = req.body;
    name = name.toLowerCase().replace(/ /g, "");
    const emailExists = await User.findOne({ email });
    if (emailExists) {
        return res.json({
            success: false,
            message: "이미 사용 중인 이메일입니다."
        });
    }
    const nameExists = await User.findOne({ name });
    if (nameExists || name.match(/\W/)) {
        return res.json({
            success: false,
            message: "이미 사용 중인 닉네임이거나 조건에 맞지 않습니다."
        });
    }
    common.createUser({ email, pwd, name }, false);
    return res.status(201).json({
        success: true,
        message: "회원가입 완료"
    });
}

export const login = async (req, res) => {
    try {
        let { email, pwd } = req.body;
        email = email.toLowerCase().replace(/ /g, "");
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: "존재하지 않는 이메일입니다."
            });
        }
        const isMatch = await User.verifyPwd(pwd, user.pwd);
        if (!isMatch) {
            return res.json({
                success: false,
                message: "비밀번호가 틀렸습니다."
            });
        }
        const token = await User.generateToken(user);
        user.token = token;
        await user.save();
        return res
            .status(200)
            .cookie("x_auth", token, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 1000 * 60 * 60 * 24
            })
            .json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: "로그인 요청에 실패하였습니다."
        });
    }
}

export const logout = async (req, res) => {
    //로그인을 했었다면 authMiddleware를 거치면서 유저 정보를 받아옴
    try {
        await User.findOneAndUpdate({ _id: req.user._id }, {
            token: ""
        });
        return res.cookie("x_auth", "none", {
            maxAge: 5000,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
        }).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}

export const getAuth = async (req, res) => {
    //authMiddleware로부터 로그인한 유저의 모든 정보가 담겨옴 
    const { _id, name } = req.user;
    return res.status(200).json({
        success: true,
        payload: {
            _id,
            name
        }
    });
}

export const socialReJoin = async (req, res) => {
    try {
        let { email, name, avatar } = req.body;
        name = name.toLowerCase().replace(/ /g, "");
        const nameExists = await User.findOne({ name });
        if (nameExists) {
            return res.json({ success: false, message: "이미 사용중인 닉네임입니다." });
        }
        common.createUser({ email, name, avatar });
        return res.status(201).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: "소셜 가입 실패" });
    }
}

export const githubLogin = async (req, res) => {
    try {
        const { code } = req.body;
        const tokenRequest = await axios.post("https://github.com/login/oauth/access_token",
            {
                client_id: process.env.GITHUB_CLIENT,
                client_secret: process.env.GITHUB_SECRET,
                code,
            }, {
            headers: {
                accept: 'application/json'
            }
        });
        const token = tokenRequest.data.access_token;
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
        common.socialJoinAndLogin({ email, name, avatar }, res);

    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: "깃허브로 로그인 실패" });
    }
}

export const kakaoLogin = async (req, res) => {
    try {
        //동의 취소 없음, 필수 요소 체크 해제 불가능
        const { code } = req.body;
        const response = await axios({
            method: "POST",
            baseURL: "https://kauth.kakao.com/oauth/token",
            params: {
                code,
                grant_type: "authorization_code",
                client_id: process.env.KAKAO_API_KEY,
                redirect_uri: process.env.KAKAO_REDIRECT
            }
        })
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
                    title: "카카오 로그인 실패",
                    message: "이메일 사용에 동의하지 않으면 로그인이 불가능합니다."
                }
            });
        }
        if (!isEmailVerified) {
            return res.json({
                success: false,
                token: access_token,
                error: {
                    title: "카카오 로그인 실패",
                    message: "이 앱에서는 인증된 이메일만을 활용합니다. 카카오에서 해당 이메일을 인증했는지 확인하세요."
                }
            })
        }
        common.socialJoinAndLogin({ email, name, avatar }, res);
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
                success: false,
                error: {
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
                message: "카카오로 로그인하기 실패"
            }
        })
    }
}

export const googleLogin = async (req, res) => {
    try {
        common.socialJoinAndLogin(req.body, res);
    } catch (err) {
        console.log(err);
        //react-google-login 이용하기 때문에 프론트에서 에러 핸들링
        return res.json({ success: false })
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
        common.socialJoinAndLogin({ name, avatar, email }, res);
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            token,
            error: {
                title: "ERROR",
                message: "네이버로 로그인하기 실패"
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
                message: "네이버로 로그인하기 실패"
            }
        })
    }
}

export const updateUserInfo = async (req, res) => {
    try {
        const { name } = req.body;
        const file = req.file;
        if (!name) {
            return res.json({ success: false, message: "이름을 입력하세요." })
        }
        const user = req.user;
        if (file) {
            user.avatar = process.env.NODE_ENV === "production" ? file.location : `http://localhost:4000/${file.path}`;
        }
        if (name !== user.name) {
            //이름이 이전과 다르다면, 중복여부 검사
            const nameExists = await User.findOne({ name });
            if (nameExists || name.match(/\W/)) {
                return res.json({ success: false, message: "이미 사용 중인 닉네임이거나 조건에 맞지 않습니다." })
            }
            //중복 안되면,
            user.name = name.toLowerCase().replace(/ /g, "");
        }
        await user.save();
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: "업데이트 요청에 실패하였습니다." });
    }
}

export const updateUserPwd = async (req, res) => {
    try {
        const { pwd, newPwd } = req.body;
        const user = req.user;
        const match = await User.verifyPwd(pwd, user.pwd);
        if (!match) {
            return res.json({ success: false, message: "현재 비밀번호가 틀립니다." })
        }
        user.pwd = newPwd;
        await user.save();
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: "비밀번호 변경 요청에 실패하였습니다." });
    }
}

export const updateBlogInfo = async (req, res) => {
    try {
        const { introduction, name } = req.body;
        const user = req.user;
        user.blogInfo = { introduction, name };
        await user.save();
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: "업데이트 요청에 실패하였습니다." });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        await Folder.deleteMany({ owner: userId });
        await Post.deleteMany({ author: userId });
        await User.findByIdAndRemove(userId);
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: "사용자 삭제 요청에 실패하였습니다."
        });
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