const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image_path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    last_update: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    hooks: {
        beforeSave: (post, options) => {
            post.created_at = new Date().getTime();
        },
        beforeUpsert: (post, options) => {
            post.last_update = new Date().getTime();
            post.slug = generateSlug(post.title, post.id);
        },
    }
});

const generateSlug = (text, id) => {
    const textSliced = text.split(" ");
    const slug = id + "-" + textSliced.join("-");
    return slug;
}

module.exports = Post;