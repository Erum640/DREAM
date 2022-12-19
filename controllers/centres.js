const Centre = require('../models/centre');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const centres = await Centre.find({});
    res.render('centres/index', { centres })
}

module.exports.renderNewForm = (req, res) => {
    res.render('centres/new');
}

module.exports.createCentre = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.centre.location,
        limit: 1
    }).send()
    const centre = new Centre(req.body.centre);
    centre.geometry = geoData.body.features[0].geometry;
    centre.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    centre.author = req.user._id;
    await centre.save();
    console.log(centre);
    req.flash('success', 'Successfully made a new centre!');
    res.redirect(`/centres/${centre._id}`)
}

module.exports.showCentre = async (req, res,) => {
    const centre = await Centre.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!centre) {
        req.flash('error', 'Cannot find that centre!');
        return res.redirect('/centres');
    }
    res.render('centres/show', { centre });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const centre = await Centre.findById(id)
    if (!centre) {
        req.flash('error', 'Cannot find that centre!');
        return res.redirect('/centres');
    }
    res.render('centres/edit', { centre });
}

module.exports.updateCentre = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const centre = await Centre.findByIdAndUpdate(id, { ...req.body.centre });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    centre.images.push(...imgs);
    await centre.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await centre.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated centre!');
    res.redirect(`/centres/${centre._id}`)
}

module.exports.deleteCentre = async (req, res) => {
    const { id } = req.params;
    await Centre.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted centre')
    res.redirect('/centres');
}