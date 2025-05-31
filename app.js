const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const app = express();
const mongo_url = 'mongodb://127.0.0.1:27017/wanderlust';
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,  reviewValidationSchema} = require("./schema.js");
const Review = require("./models/review"); 

const listings =  require("./routes/listing.js");

main().then(() => {
    console.log("connected to database.")
}).catch((err)=> console.log(err));

async function main() {
    await mongoose.connect(mongo_url);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req,res)=> {
    res.send("hi i am groot.");
});

const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(".");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    let { error } = reviewValidationSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(".");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

app.use("/listings", listings);

//reviews
//post review route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review); // ✅ now using Mongoose model
    listing.review.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//delete review route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));


// app.get("/testListing", async (req,res)=> {
//     let sampleListing = new Listing({
//         title: "New Apartment",
//         description: "by the beach",
//         price: 1500,
//         location: "Vagator, Goa",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("testing successful."); 
// });

app.all("*", (req, res, next)=> {
    next(new ExpressError(404, "Page Not Found!"));
})

app.use((err, req, res, next)=> {
    let {statusCode=500, message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", { err });
    // res.status(statusCode).send(message);
})

app.listen(8080, () => {
    console.log("server is listening to port 8080");
})