import Test from '../models/Test.js';

export const testController = async (req, res) => {
    // const test = await Test.create({
    //     content: "초기 설정 중입니다."
    // });
    const data = await Test.find();
    console.log(data);
    return res.status(200).json({
        content: "TEST Sucess!"
    });
}