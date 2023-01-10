const Campground = require('../models/campground');
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", ()=>{
    console.log("Database connected");
})

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]
}

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)}, ${sample(places)}`,
            image: 'https://random.imagecdn.app/500/150',
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolore pariatur modi sequi minima aliquid eveniet, cumque voluptatibus vitae quae officiis labore, odio voluptate. Vero accusantium voluptatum fugit numquam unde deleniti?",
            price,
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});

// run code to excute and save on db: 
// node seeds/index,js 