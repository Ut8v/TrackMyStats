const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();
const {User,Stat,Game} = require('./Backend/dbconnection');

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

app.get('/logout',(req,res)=>{
    res.render('landing')
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
        res.status(500).send('Internal Server Error'); 
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
// Route to handle mystat page for each user
app.get('/mystat/:username', (req, res) => {
    const username = req.params.username;
    const token = req.query.token;
    //console.log('token =', token);
    const verified = jwt.verify(token, process.env.Secret_Key);
    //console.log(verified);
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
    //console.log(verified);
    if(verified.username !== username ){
        res.send('no access')
    }
    else {
        res.render('addstats',{ username: username, token: token})
    }
})

app.post('/savestat', async (req, res) => {
    try {
        const { Player, token, gameDate, location, opponent, outcome, pointsScored, assists, rebounds, steals, blocks, fouls } = req.body;
        // Find the user ID
        //console.log(token);
        const verified = jwt.verify(token, process.env.Secret_Key);
        if(verified.username !== username ){
            res.send('no access')
        }//else {
        const user = await User.findOne({ username: Player });
        if (!user) {
            return res.status(404).send('User not found');
        }
        // Create a new game
        const newGame = new Game({
            date: gameDate,
            location: location,
            opponent: opponent,
            outcome: outcome
        });
        // Save the game
        await newGame.save();
        // Create a new stat associated with the game and user
        const stat = new Stat({
            player: user._id, 
            game: newGame._id, 
            pointsScored: pointsScored,
            assists: assists,
            rebounds: rebounds,
            steals: steals,
            blocks: blocks,
            fouls: fouls
        });
        // Save the stat
        await stat.save();
        // Render the posts page
        res.redirect(`/mystat/${Player}?token=${token}`);
    //}
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});
//to get individual stat
app.get('/stats/:username', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const username = req.params.username;
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.Secret_Key);
        if(verified.username !== username ){
            res.send('no access')
        }//else {
        const user = await User.findOne({ username: username });
        if (user) {
            const userId = user._id;
           // console.log(userId);
            const stats = await Stat.find({ player: userId }).populate('game');
           // console.log(stats);
            res.json(stats);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    //}
    } catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//for stats to show in the home page
app.get('/allstats', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const username = req.headers.username;
        //console.log('username =',username);
        //console.log('token =',token);
        if(!token || !username ){
            return res.status(401).json({ error: 'Unauthorized' });
        }
        //verify the jwt token
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.Secret_Key);
        if (verified.username !== username) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const randomStats = await Stat.aggregate([{ $sample: { size: 10 } }]);
        //console.log(randomStats);
        // Extract player and game IDs
        const playerIds = randomStats.map(stat => stat.player);
        const gameIds = randomStats.map(stat => stat.game);

        // Populate player and game fields
        const populatedStats = await Promise.all([
            User.find({ _id: { $in: playerIds } }).select('-password -email'),
            Game.find({ _id: { $in: gameIds } })
        ]);

        // Map player and game data to stats
        randomStats.forEach((stat, index) => {
            stat.player = populatedStats[0].find(user => user._id.equals(stat.player));
            stat.game = populatedStats[1].find(game => game._id.equals(stat.game));
        });
        res.json(randomStats);
        
    } catch (err) {
        console.error('Error fetching random stats:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
//delete stats
app.post('/delete',(req,res)=>{
    const statId = req.body.statId;
    const gameId = req.body.gameId;
    const token = req.headers.authorization;
    const username = req.headers.username;
    //console.log('statid =',statId);
    //console.log('gameid =',gameId);
    if(!token || !username ){
        return res.status(401).json({ error: 'Unauthorized' });
    }
    //verify the jwt token
    const verified = jwt.verify(token.replace('Bearer ', ''), process.env.Secret_Key);
    if (verified.username !== username) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    Promise.all([
        Stat.findOneAndDelete({ _id: statId }),
        Game.findOneAndDelete({ _id: gameId })
    ])
    .then(([deletedStat, deletedGame]) => {
        if (!deletedStat || !deletedGame) {
            return res.status(404).send('Stat or Game not found');
        }
        res.send('Stat and Game deleted successfully');
    })
    .catch(err => {
        console.error('Error deleting stat or game:', err);
        res.status(500).send('Error deleting stat or game');
    });
})


//
app.listen(3000,()=>{
    console.log('server is running');
})

