const Sequelize= require('sequelize');
require('dotenv').config();
const sequelize=new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging : false, //keeps the console clean
});
module.exports=sequelize;