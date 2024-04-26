const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser')
const app = express();
const mongoose = require('mongoose');
const collection = require('./Backend/dbconnection');

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

/*mongoose.connect(`mongodb+srv://${process.env.MONGO_DBCONNECTION}`).then(()=>{
console.log('Connected successfully');
});*/



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




app.listen(3000,()=>{
    console.log('server is running');
})

