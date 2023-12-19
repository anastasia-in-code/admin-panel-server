import User from "../models/User.js";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const userStats = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "affiliatestats",
          localField: "_id",
          foreignField: "userId",
          as: "affiliateStats",
        },
      },
      { $unwind: "$affiliateStats" },
    ]);

    const salesTransdactions = await Promise.all(
        userStats[0].affiliateStats.affiliateSales.map(id => Transaction.findById(id))
    )

    const filteredSalesTransactions = salesTransdactions.filter(transaction => transaction !=null)
    
    res.status(200).json({user: userStats[0], sales: filteredSalesTransactions});
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
