exports.isDeliveryAgent = (req, res, next) => {
  if (req.user?.role !== "DeliveryAgent") {
    return res.status(403).json({
      success: false,
      message: "Delivery agent access required.",
    });
  }

  next();
};
