const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const Review = require('./models/review');

mongoose.connect('mongodb://localhost:27017/za-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => { console.log('Database connected') });

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany();
    await Review.deleteMany();
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus accusantium natus magnam quasi sunt unde animi dolorum ex alias, esse molestiae, autem voluptatum enim minima velit corrupti ab! Commodi, iure.',
            price
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});