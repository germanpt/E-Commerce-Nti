const OrderModel = require("../models/Order");

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    const summary = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          isCancelled: false,
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $addFields: {
          itemTotal: { $multiply: ["$items.price", "$items.quantity"] },
        },
      },
      {
        $facet: {
          overallStats: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$itemTotal" },
                totalQuantity: { $sum: "$items.quantity" },
                totalOrders: { $sum: 1 },
              },
            },
          ],
          topProducts: [
            {
              $group: {
                _id: "$product._id",
                name: { $first: "$product.productName" },
                revenue: { $sum: "$itemTotal" },
                quantitySold: { $sum: "$items.quantity" },
              },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
          ],
          topUsers: [
            {
              $group: {
                _id: "$user._id",
                name: { $first: "$user.name" },
                email: { $first: "$user.email" },
                totalSpent: { $sum: "$itemTotal" },
                totalQuantity: { $sum: "$items.quantity" },
                ordersCount: { $sum: 1 },
              },
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
          ],
          monthlySales: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                totalRevenue: { $sum: "$itemTotal" },
                totalQuantity: { $sum: "$items.quantity" },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
        },
      },
    ]);

    res.status(200).json({
      message: `Sales report from ${startDate} to ${endDate}`,
      data: summary[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getSalesReport,
};
