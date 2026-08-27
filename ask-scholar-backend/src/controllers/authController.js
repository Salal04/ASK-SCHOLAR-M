const prisma = require("../config/prisma");
const { hashPassword, comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");

function buildPictureUrl(req, picturePath) {
  if (!picturePath) return null;
  return `${process.env.BASE_URL || `${req.protocol}://${req.get("host")}`}/${picturePath}`;
}

function sanitizeScholar(scholar, req) {
  const { password, ...rest } = scholar;
  return { ...rest, picture: buildPictureUrl(req, scholar.picture) };
}

// ------------------------------------------------------------------
// USER: register + login
// ------------------------------------------------------------------

async function registerUser(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), password: hashed },
    });

    const token = signToken({ id: user.id, email: user.email, role: "USER" });
    const { password: _pw, ...userSafe } = user;

    return res.status(201).json({ success: true, message: "Account created.", data: { user: userSafe, token } });
  } catch (err) {
    next(err);
  }
}

async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = signToken({ id: user.id, email: user.email, role: "USER" });
    const { password: _pw, ...userSafe } = user;

    return res.json({ success: true, message: "Login successful.", data: { user: userSafe, token } });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// ADMIN: login only (admin account is auto-seeded, not self-registered)
// ------------------------------------------------------------------

async function loginAdmin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required." });
    }

    const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
    if (!admin) {
      console.log("AdMin Email Not Found! ");
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const match = await comparePassword(password, admin.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = signToken({ id: admin.id, email: admin.email, role: "ADMIN" });
    const { password: _pw, ...adminSafe } = admin;

    return res.json({ success: true, message: "Login successful.", data: { admin: adminSafe, token } });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// SCHOLAR: login (only once status is ACTIVE)
// ------------------------------------------------------------------

async function loginScholar(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required." });
    }

    const scholar = await prisma.scholar.findUnique({ where: { email: email.toLowerCase() } });

    if (!scholar || scholar.status !== "ACTIVE" || !scholar.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials, or your account has not been activated yet.",
      });
    }
    if (!scholar.isActive) {
      return res.status(403).json({ success: false, message: "This account has been disabled." });
    }

    const match = await comparePassword(password, scholar.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = signToken({ id: scholar.id, email: scholar.email, role: "SCHOLAR" });

    return res.json({
      success: true,
      message: "Login successful.",
      data: { scholar: sanitizeScholar(scholar, req), token },
    });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// SCHOLAR: complete self-registration using an admin-issued invite token.
// This is the flow for "admin just adds an email" -> scholar sets up
// their own password + profile details.
// ------------------------------------------------------------------

async function completeScholarRegistration(req, res, next) {
  try {
    const { inviteToken, password, name, fiqah, bio, specialization, qualifications, yearsOfExperience, languages, location } =
      req.body;

    if (!inviteToken || !password) {
      return res.status(400).json({ success: false, message: "inviteToken and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const scholar = await prisma.scholar.findUnique({ where: { inviteToken } });

    if (!scholar) {
      return res.status(400).json({ success: false, message: "Invalid invite token." });
    }
    if (scholar.status === "ACTIVE") {
      return res.status(409).json({ success: false, message: "This account has already been activated. Please log in." });
    }
    if (scholar.inviteTokenExpiry && scholar.inviteTokenExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "This invite link has expired. Ask the admin to resend it." });
    }

    const hashed = await hashPassword(password);

    const updated = await prisma.scholar.update({
      where: { id: scholar.id },
      data: {
        password: hashed,
        name: name || scholar.name,
        fiqah: fiqah || scholar.fiqah || undefined,
        bio: bio ?? scholar.bio,
        specialization: specialization ?? scholar.specialization,
        qualifications: qualifications ?? scholar.qualifications,
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : scholar.yearsOfExperience,
        languages: languages ? (Array.isArray(languages) ? languages : String(languages).split(",").map((l) => l.trim())) : scholar.languages,
        location: location ?? scholar.location,
        picture: req.file ? `uploads/scholars/${req.file.filename}` : scholar.picture,
        status: "ACTIVE",
        inviteToken: null,
        inviteTokenExpiry: null,
      },
    });

    const token = signToken({ id: updated.id, email: updated.email, role: "SCHOLAR" });

    return res.status(200).json({
      success: true,
      message: "Registration complete. You can now log in.",
      data: { scholar: sanitizeScholar(updated, req), token },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  loginScholar,
  completeScholarRegistration,
  sanitizeScholar,
};
