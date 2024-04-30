const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(`mongodb+srv://${process.env.MONGO_DBCONNECTION}`).then(()=>{
console.log('Connected successfully');
});

//schema for users
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

//schema for games
const gameSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    location: { type: String, required: true },
    opponent: { type: String, required: true },
    outcome: { type: String, enum: ['win', 'loss', 'draw'], required: true },
});

//schema for player stats
const statSchema = new mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    pointsScored: { type: Number, required: true },
    assists: { type: Number, required: true },
    rebounds: { type: Number, required: true },
    steals: { type: Number, required: true },
    blocks: { type: Number, required: true },
    fouls: { type: Number, required: true },
});

//schema for comments
const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    time: { type: Date, default: Date.now },
});

//schema for likes
const likeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, required: true }, 
    time: { type: Date, default: Date.now },
});

// models from the schemas
const User = mongoose.model('User', userSchema);
const Game = mongoose.model('Game', gameSchema);
const Stat = mongoose.model('Stat', statSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Like = mongoose.model('Like', likeSchema);


module.exports = { User, Game, Stat, Comment, Like };