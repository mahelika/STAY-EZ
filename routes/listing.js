const express = require("express");
const router = express.Router();

//index route
router.get("/listings", async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
});

//new route
router.get("/listings/new", (req,res)=> {
    res.render("listings/new.ejs");
});

//show route
router.get("/listings/:id", wrapAsync(async(req, res)=> {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("review");
    res.render("listings/show.ejs", {listing}); 
}));


//create route
router.post(
  "/listings", 
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//edit route
router.get("/listings/:id/edit", wrapAsync(async(req, res)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

router.put("/listings/:id", 
    validateListing,
    wrapAsync(async (req, res) => {
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
  }));

//delete route
router.delete("/listings/:id", wrapAsync(async (req, res)=> {
    let {id} = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
}));