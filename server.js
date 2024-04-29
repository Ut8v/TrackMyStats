const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
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
    const token = req.query.token;
    const username = req.query.username;
    // Render the home page with the username and token
    res.render('home', { username: username, token: token });
})

// Route to handle mystat page for each user
app.get('/mystat/:username', (req, res) => {
    const username = req.params.username;
    const token = req.query.token;
    //console.log('token =', token);
    const verified = jwt.verify(token, process.env.Secret_Key);
    console.log(verified);
    if(verified.username !== username ){
        res.send('no access')
    }
    else {
        res.render('posts',{ username: username, token: token})
    }
});

app.get('/addstats/:username',(req,res)=>{
    const username = req.params.username;
    const token = req.query.token;
    //console.log('token =', token);
    const verified = jwt.verify(token, process.env.Secret_Key);
    console.log(verified);
    if(verified.username !== username ){
        res.send('no access')
    }
    else {
        res.render('addstats',{ username: username, token: token})
    }
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
            const token = jwt.sign({username:userExists.username},process.env.Secret_Key,{expiresIn:process.env.expiresIn })
            res.redirect('/home?token=' + token + '&username=' + userExists.username)
        } else {
            const newUser = new User(signup);
            console.log(newUser);
            newUser.save().then(()=>{
                const token = jwt.sign({username:newUser.username},process.env.Secret_Key,{expiresIn:process.env.expiresIn })
                res.redirect('/home?token=' + token + '&username=' + newUser.username)
            }).catch(err=> console.log(err));
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
            const token = jwt.sign({username:user.username},process.env.Secret_Key,{expiresIn:process.env.expiresIn })
            //console.log(token);
            res.redirect('/home?token=' + token + '&username=' + user.username)
        } else {
            res.send('Incorrect username or password');
        }
    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).send('Internal Server Error');
    }
});

//
app.listen(3000,()=>{
    console.log('server is running');
})

