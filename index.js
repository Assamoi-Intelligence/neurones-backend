const express = require('express');
const app = express();
const helmet = require("helmet");
const cors = require("cors"); 
const db = require('./config/db');
const port = process.env.PORT || 8000;
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const User = require('./models/user');
const Post = require('./models/post');
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const path = require('path');

app.use('/storage', express.static(path.join(__dirname, 'storage')));
app.use("/auth", userRoutes);
app.use("/post", postRoutes);

User.hasMany(Post);
Post.belongsTo(User);

db.sync({force: true}).then(() => {
    app.listen(port, () => console.log(`Serveur listen to ${port}`));
}).catch(err => console.log(err));