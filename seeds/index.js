const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Centre = require('../models/centre');

const dbUrl = process.env.DB_URL
mongoose.connect(dbUrl)
.then(()=>{console.log("Mongoose Connection open!!!")})
.catch(err=>{
    console.log('Oh No!! mongoose connection error!!');
    console.log(err)
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Centre.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const mobile = Math.floor(Math.random() * 20) + 10;
        const camp = new Centre({
            //YOUR USER ID
            author: '5f5c330c2cd79d538f2c66d9',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            mobile,
            geometry: {
                type: "Point",
                coordinates: [-113.1331, 47.0202]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/Dream/ahfnenvca4tha00h2ubt.png',
                    filename: 'Dream/ahfnenvca4tha00h2ubt'
                },
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/Dream/ruyoaxgf72nzpi4y6cdi.png',
                    filename: 'Dream/ruyoaxgf72nzpi4y6cdi'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})