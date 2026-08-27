const prisma = require("../config/prisma");
const { comparePassword, hashPassword } = require("../utils/password");

async function getMyProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, isActive: true, createdAt: true, updatedAt: true },
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    return res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const { name } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, name: true, email: true, isActive: true, createdAt: true, updatedAt: true },
    });

    return res.json({ success: true, message: "Profile updated.", data: { user } });
  } catch (err) {
    next(err);
  }
}

async function changeMyPassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "currentPassword and newPassword are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const match = await comparePassword(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    return res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyProfile, updateMyProfile, changeMyPassword };
