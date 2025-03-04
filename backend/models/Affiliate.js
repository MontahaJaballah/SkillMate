const mongoose = require("mongoose");

const AffiliateSchema = new mongoose.Schema({
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    unique: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected"], 
    default: "pending" 
  },
  appliedAt: { 
    type: Date, 
    default: Date.now 
  },
  acceptedAt: { 
    type: Date 
  },
  contractUrl: { 
    type: String 
  },
  perks: [{
    type: String,
    enum: ["higher_revenue_share", "priority_support", "special_badge", "featured_courses"]
  }],
  metrics: {
    totalStudents: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalCourses: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model("Affiliate", AffiliateSchema);
