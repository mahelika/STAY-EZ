const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const app = express();
const mongo_url = 'mongodb://127.0.0.1:27017/wanderlust';
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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

//index route
app.get("/listings", async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
});

//new route
app.get("/listings/new", (req,res)=> {
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id", async(req, res)=> {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing}); 
});

//create route
app.post("/listings", async (req, res)=> {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");

});

//edit route
app.get("/listings/:id/edit", async(req, res)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

//update route
// app.put("/listings/:id", async (req, res)=>{
//     let {id} = req.params;
//     await Listing.findByIdAndUpdate(id, {...req.body.listing});
//     res.redirect(`/listings/${id}`);
// });
app.put("/listings/:id", async (req, res) => {
    const { id } = req.params;
  
    // Extract the nested image fields
    const { "image.url": imageUrl, "image.filename": imageFilename, ...rest } = req.body.listing;
  
    // Build the updated listing object
    const updatedListing = {
      ...rest,
      image: {
        url: imageUrl,
        filename: imageFilename,
      },
    };
  
    await Listing.findByIdAndUpdate(id, updatedListing);
    res.redirect(`/listings/${id}`);
  });

//delete route
app.delete("/listings/:id", async (req, res)=> {
    let {id} = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
});


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



app.listen(8080, () => {
    console.log("server is listening to port 8080");
})