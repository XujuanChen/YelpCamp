const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const { campgroundSchema } = require('./schemas.js');

const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const Campground = require('./models/campground');
const mongoose = require('mongoose');
const campground = require('./models/campground');
const { join } = require('path');
mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", ()=>{
    console.log("Database connected");
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

const validateCampgroud = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

app.get('/', (req, res)=> {
    res.render('home')
})

// app.get('/makecampground', async (req, res)=> {
//     const newCamp = new Campground({
//         title: "My Backyard",
//         price: "$99",
//         description: "cheap camping",
//         location: "San Fransisco",
//     })
//     await newCamp.save();
//     res.send(newCamp)
// })

app.get('/campgrounds', catchAsync(async(req, res, next)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/new', (req, res)=>{
    res.render('campgrounds/new')
})

app.post('/campgrounds', validateCampgroud, catchAsync(async(req, res, next)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async(req, res, next)=>{
    // const id = req.params.id;
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground })
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next)=>{
    // const id = req.params.id;
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id', validateCampgroud, catchAsync(async (req, res, next)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true, new: true});
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async(req, res, next)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Error, Something Went Wrong!' } = err;
    if(!err.message) err.message = 'Sorry, something went wrong!'
    res.status(statusCode).render('error', {err});
})

app.listen(PORT, ()=>{
    console.log(`App is listening to port ${PORT}`)
})