import jwt from "jsonwebtoken";

const authDoctor = (req, res, next) => {
  try {
    const dToken = req.headers.authorization?.split(" ")[1];
    if (!dToken) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(dToken, process.env.JWT_SECRETS);
    req.docId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

export default authDoctor;
