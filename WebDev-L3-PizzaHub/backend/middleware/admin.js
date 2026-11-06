// exports.isAdmin = async (req, res, next) => {
//   try {
//     if (req.user.role !== "Admin") {
//       return res.status(403).json({
//         success: false,
//         message: "This is a protected route for Admin only",
//       });
//     }

//     next();
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "User role cannot be verified, please try again",
//     });
//   }
// }


exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "This is a protected route for Admin only",
    });
  }

  next();
};