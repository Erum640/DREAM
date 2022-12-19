const Centre = require('../models/centre');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const centre = await Centre.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    centre.reviews.push(review);
    await review.save();
    await centre.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/centres/${centre._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Centre.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/centres/${id}`);
}
