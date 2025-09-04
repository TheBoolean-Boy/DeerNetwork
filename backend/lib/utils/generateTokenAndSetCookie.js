import jwt from "jsonwebtoken"

export const generateTokenAndSetCookie = async(userId, res) => {

  const token =  jwt.sign({userId}, process.env.JWT_SECRET,{
    expiresIn: "7d"
  })

  res.cookie("jwt",token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // so basically this prevents xss(cross-site scripting attacks)
    samesite: "strict", // and this prevents CSRF(cross-site request forgery attacks)
    secure: process.env.NODE_ENV === "production"
  })
}