import jwt from "jsonwebtoken";
import { Roles } from "../enums/roles.js";

const secretKey = process.env.JWT_SECRET;

export const authenticateToken = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    // Default roles if none are provided
    const roles =
      allowedRoles.length > 0
        ? allowedRoles
        : [
            Roles.Admin,
            Roles.Customer,
            Roles.Farmer,
            Roles.Moderator,
            Roles.Registered,
          ];

    if (!token) {
      return res.status(401).json({ message: "Access denied" });
    }

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }

      req.user = user; // Attach user information to the request object

      // Check if the user has one of the required roles
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: You do not have the required role" });
      }

      next(); // Pass control to the next middleware function
    });
  };
};
