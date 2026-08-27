const prisma = require("../config/prisma");
const { hashPassword } = require("../utils/password");
const { generateInviteToken } = require("../utils/token");
const { sanitizeScholar } = require("./authController");

const INVITE_EXPIRY_DAYS = 7;

// ------------------------------------------------------------------
// Create a FULL scholar account directly (admin sets name/email/password).
// Status becomes ACTIVE immediately.
// ------------------------------------------------------------------
async function createScholarFull(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      fiqah,
      bio,
      specialization,
      qualifications,
      yearsOfExperience,
      languages,
      location,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const existing = await prisma.scholar.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ success: false, message: "A scholar with this email already exists." });
    }

    const hashed = await hashPassword(password);

    const scholar = await prisma.scholar.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed,
        fiqah: fiqah || undefined,
        bio,
        specialization,
        qualifications,
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
        languages: languages ? (Array.isArray(languages) ? languages : String(languages).split(",").map((l) => l.trim())) : [],
        location,
        picture: req.file ? `uploads/scholars/${req.file.filename}` : null,
        status: "ACTIVE",
        createdByAdminId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Scholar account created successfully.",
      data: { scholar: sanitizeScholar(scholar, req) },
    });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// Invite a scholar by email only. Admin can optionally pre-fill
// name/fiqah. Scholar completes their own registration later via
// /api/auth/scholar/complete-registration using the returned inviteToken.
// (In a real deployment this token would be emailed; here it is
// returned in the response since no email service is configured.)
// ------------------------------------------------------------------
async function inviteScholar(req, res, next) {
  try {
    const { email, name, fiqah } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "email is required." });
    }

    const existing = await prisma.scholar.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ success: false, message: "A scholar with this email already exists." });
    }

    const inviteToken = generateInviteToken();
    const inviteTokenExpiry = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const scholar = await prisma.scholar.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        fiqah: fiqah || undefined,
        status: "PENDING",
        inviteToken,
        inviteTokenExpiry,
        createdByAdminId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Scholar invited. Share the invite link/token with them to complete registration.",
      data: {
        scholar: sanitizeScholar(scholar, req),
        inviteToken, // send this via email in production
        invitationExpiresAt: inviteTokenExpiry,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// Resend / regenerate an invite token for a still-PENDING scholar
// ------------------------------------------------------------------
async function resendScholarInvite(req, res, next) {
  try {
    const { id } = req.params;
    const scholar = await prisma.scholar.findUnique({ where: { id } });

    if (!scholar) return res.status(404).json({ success: false, message: "Scholar not found." });
    if (scholar.status === "ACTIVE") {
      return res.status(409).json({ success: false, message: "Scholar has already activated their account." });
    }

    const inviteToken = generateInviteToken();
    const inviteTokenExpiry = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const updated = await prisma.scholar.update({
      where: { id },
      data: { inviteToken, inviteTokenExpiry },
    });

    return res.json({
      success: true,
      message: "Invite resent.",
      data: { scholar: sanitizeScholar(updated, req), inviteToken, invitationExpiresAt: inviteTokenExpiry },
    });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// List all scholars (admin view - includes PENDING/SUSPENDED too)
// ------------------------------------------------------------------
async function listScholarsAdmin(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};

    const [scholars, total] = await Promise.all([
      prisma.scholar.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.scholar.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        scholars: scholars.map((s) => sanitizeScholar(s, req)),
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// List all users (admin view)
// ------------------------------------------------------------------
async function listUsersAdmin(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: { id: true, name: true, email: true, isActive: true, createdAt: true, updatedAt: true },
      }),
      prisma.user.count(),
    ]);

    return res.json({
      success: true,
      data: {
        users,
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// Delete a scholar
// ------------------------------------------------------------------
async function deleteScholar(req, res, next) {
  try {
    const { id } = req.params;

    const scholar = await prisma.scholar.findUnique({ where: { id } });
    if (!scholar) {
      return res.status(404).json({ success: false, message: "Scholar not found." });
    }

    await prisma.scholar.delete({ where: { id } });

    return res.json({ success: true, message: "Scholar account deleted." });
  } catch (err) {
    next(err);
  }
}

async function videos_url(req, res, next) {
  try {
    const  { scholarId, url } = req.body;

    console.log("scholarId: " , scholarId);
    console.log("url: " , scholarId);

    if (!url || !scholarId ) {
      return res.status(404).json({ success: false, message: "Values not valids " });
    }



    return res.json({ success: true, message: "sucessfully added!" });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// Delete a user
// ------------------------------------------------------------------
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await prisma.user.delete({ where: { id } });

    return res.json({ success: true, message: "User account deleted." });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// Suspend / reactivate a scholar (soft alternative to deleting)
// ------------------------------------------------------------------
async function setScholarActiveStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive (boolean) is required." });
    }

    const scholar = await prisma.scholar.update({
      where: { id },
      data: { isActive, status: isActive ? "ACTIVE" : "SUSPENDED" },
    });

    return res.json({
      success: true,
      message: `Scholar ${isActive ? "reactivated" : "suspended"}.`,
      data: { scholar: sanitizeScholar(scholar, req) },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createScholarFull,
  inviteScholar,
  resendScholarInvite,
  listScholarsAdmin,
  listUsersAdmin,
  deleteScholar,
  deleteUser,
  videos_url,
  setScholarActiveStatus,
};
