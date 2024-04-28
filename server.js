const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser')
const app = express();
const {User} = require('./Backend/dbconnection');


app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());


//for landing page
app.get('/', (req,res)=>{
    res.render('landing')
})

//for signin page
app.get('/signin',(req,res)=>{
    res.render('signin')
})

//for sign up page 
app.get('/signup',(req,res)=>{
    res.render('signup')
})

//for home page
app.get('/home',(req,res)=>{
    res.render('home')
})

//to signup

app.post('/signup', async (req,res)=>{
     //save
    const signup = {
        username : req.body.username,
        email : req.body.email,
        password : req.body.password
    }
    const hashedPassword = await bcrypt.hash(signup.password,process.env.BCRYPT_COST_FACTOR);
    signup.password = hashedPassword;
    //console.log(signup.username);
    //check if user already exists
    User.findOne({ email: signup.email, password: signup.password }).exec()
    .then(userExists => {
        if (userExists) {
        console.log('Username:', userExists.username);
        res.redirect('/home?username=' + userExists.username);
        } else {
            const newUser = new User(signup);
            console.log(newUser);
            newUser.save();
            //res.redirect('/home?username=' + signup.username);
            res.render('signin');
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('Internal Server Error'); // Handle error appropriately
    });
})

//to sign in 
app.post('/signin', async (req, res) => {
    try {
        const signin = {
            email: req.body.email,
            password: req.body.password
        };

        //console.log(signin.email);

        // Find user by email
        const user = await User.findOne({ email: signin.email });

        if (!user) {
            return res.render('usernotfound');
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(signin.password, user.password);

        if (passwordMatch) {
            res.redirect('/home?username=' + user.username);
        } else {
            res.send('Incorrect username or password');
        }
    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).send('Internal Server Error');
    }
});




app.listen(3000,()=>{
    console.log('server is running');
})

