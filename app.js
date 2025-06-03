const express = require("express");
const mongoose = require("mongoose");
const app = express();
const mongo_url = 'mongodb://127.0.0.1:27017/wanderlust';
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const reviewRouter = require("./routes/review.js");
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


app.use("/listings", listings);
app.use("/listings/:id/reviews", reviewRouter);


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