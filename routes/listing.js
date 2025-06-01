const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema,  reviewValidationSchema} = require("../schema.js");
const Listing = require("../models/listing.js")


const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(".");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

//index route
router.get("/", async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
});

//new route
router.get("/new", (req,res)=> {
    res.render("listings/new.ejs");
});

//show route
router.get("/:id", wrapAsync(async(req, res)=> {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("review");
    res.render("listings/show.ejs", {listing}); 
}));


//create route
router.post(
  "/", 
  validateListing,
  wrapAsync(async (req, res, next) => {
    const listingData = req.body.listing;

    // Set default filename or empty string if none present
    if (!listingData.image) listingData.image = {};
    if (!listingData.image.filename) listingData.image.filename = ""; // or a default placeholder

    const newListing = new Listing(listingData);
    await newListing.save();
    res.redirect("/listings");
  })
);

//edit route
router.get("/:id/edit", wrapAsync(async(req, res)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

router.put("/:id", validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id); // fetch existing data

  const { "image.url": imageUrl, "image.filename": imageFilename, ...rest } = req.body.listing;

  const updatedListing = {
    ...rest,
  };

  if (imageUrl && imageUrl.trim() !== "") {
    updatedListing.image = {
      url: imageUrl,
      filename: imageFilename || listing.image?.filename || "",
    };
  } else {
    // preserve existing image
    updatedListing.image = listing.image;
  }

  await Listing.findByIdAndUpdate(id, updatedListing);
  res.redirect(`/listings/${id}`);
}));



//delete route
router.delete("/:id", wrapAsync(async (req, res)=> {
    let {id} = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
}));


module.exports = router;