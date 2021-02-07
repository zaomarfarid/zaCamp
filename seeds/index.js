const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const Review = require('../models/review');

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
            author: '6016c8f034903f4a347eedb0',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus accusantium natus magnam quasi sunt unde animi dolorum ex alias, esse molestiae, autem voluptatum enim minima velit corrupti ab! Commodi, iure.',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/zaomarfarid/image/upload/v1612725620/zaCamp/jeu5kpbeeou0wa4dk9ob.jpg',
                    filename: 'zaCamp/jeu5kpbeeou0wa4dk9ob'
                },
                {
                    url: 'https://res.cloudinary.com/zaomarfarid/image/upload/v1612725619/zaCamp/oi2lh8ekqfivsdldzy1c.jpg',
                    filename: 'zaCamp/oi2lh8ekqfivsdldzy1c'
                }
            ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});