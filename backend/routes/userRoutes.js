
const Router  = require('express')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const User = require('../model/user')


const router = Router()

router.post('/register',async (req,res) => {
    const name = req.body.name
    const email = req.body.email
    const mobile = req.body.mobile
    const password = req.body.password

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)

    const record = await User.findOne({email:email});
    if(record){
        return res.status(400).send({
            message:"Emal already registerred"
        })
    }else{

    const user = new User({
        name:name,
        email:email,
        password:hashedPassword,
        mobile:mobile
    })  

    const result = user.save();

    const _id = result._id;

    const token = jwt.sign({_id:_id},"secret")

    res.cookie("jwt",token,{
        httpOnly:true,
        maxAge:24*60*60*1000
    })

    res.send({
        message:"success"
    })

   }
})


router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        
        if (!user) {
            return res.status(400).send({
                message: "User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).send({
                message: "Password not correct"
            });
        }

        const token = jwt.sign({ _id: user._id }, "secret");

        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.send({
            message: "Success"
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send({
            message: "Internal server error"
        });
    }
});





router.post('/logout',(req,res) => {
    res.cookie("jwt","",{maxAge:0})
})


router.get('/user',async (req,res) => {
    try{
       const cookie = req.cookies['jwt']

       const claims = jwt.verify(cookie,"secret")

       if(!claims){
        return res.status(401).send({
            message:"unauthenticated"
        })
       }

       const user = await User.findOne({_id:claims._id})
       
       const {password,...data} = await user.toJSON()
          console.log(data);
       res.send(data)

    }catch(err){
        return res.status(401).send({
            message:"unauthenticated"
        }) 
    }   
})

module.exports = router


