const prisma = require("../config/prisma");
const { sanitizeScholar } = require("./authController");

// ------------------------------------------------------------------
// PUBLIC: Browse / search / filter scholars.
// Only ACTIVE + isActive scholars are shown to users.
//
// Query params:
//   search    - matches name, bio, specialization (case-insensitive)
//   fiqah     - exact enum match (HANAFI, SHAFI, MALIKI, HANBALI, JAFARI, OTHER)
//   location  - partial, case-insensitive match
//   language  - matches a language in the languages array
//   page, limit - pagination
//   sortBy    - "newest" | "name" (default: newest)
// ------------------------------------------------------------------
async function browseScholars(req, res, next) {
  try {
    const { search, fiqah, location, language, page = 1, limit = 12, sortBy = "newest" } = req.query;

    const where = {
      status: "ACTIVE",
      isActive: true,
    };

    if (fiqah) where.fiqah = fiqah;
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (language) where.languages = { has: language };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { specialization: { contains: search, mode: "insensitive" } },
        { qualifications: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy = sortBy === "name" ? { name: "asc" } : { createdAt: "desc" };

    const [scholars, total] = await Promise.all([
      prisma.scholar.findMany({
        where,
        orderBy,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.scholar.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        scholars: scholars.map((s) => sanitizeScholar(s, req)),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// PUBLIC: View a single scholar's profile
// ------------------------------------------------------------------
async function getScholarById(req, res, next) {
  try {
    const { id } = req.params;

    const scholar = await prisma.scholar.findUnique({ where: { id } });

    if (!scholar || scholar.status !== "ACTIVE" || !scholar.isActive) {
      return res.status(404).json({ success: false, message: "Scholar not found." });
    }

    return res.json({ success: true, data: { scholar: sanitizeScholar(scholar, req) } });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// SCHOLAR (self): view own full profile (works even if not yet "public")
// ------------------------------------------------------------------
async function getMyScholarProfile(req, res, next) {
  try {
    const scholar = await prisma.scholar.findUnique({ where: { id: req.user.id } });
    if (!scholar) return res.status(404).json({ success: false, message: "Profile not found." });

    return res.json({ success: true, data: { scholar: sanitizeScholar(scholar, req) } });
  } catch (err) {
    next(err);
  }
}
async function increaseScholarPopularity(scholarId, value = 1) {
  return await prisma.scholar.update({
    where: {
      id: scholarId,
    },
    data: {
      popularityScore: {
        increment: value,
      },
    },
  });
}

async function askScholar(req, res, next) {
  try {
    const { id } = req.params;

    console.log("Request Received!");
    console.log("Scholar ID:", id);
    console.log("Question:", req.body.question);
    console.log("History:", req.body.history);
    const { question, history, conversationId, conversationName } = req.body;

    const scholar = await prisma.scholar.findUnique({
      where: { id },
    });

    if (!scholar || scholar.status !== "ACTIVE" || !scholar.isActive) {
      return res.status(404).json({
        success: false,
        message: "Scholar not found.",
      });
    }
    await increaseScholarPopularity(id, 1);
    return res.json({
      success: true,
      data: {
        answer: "Wa Alaikum Assalam. Allah Hafiz.",
        askedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// SCHOLAR (self): update own profile, including picture
// ------------------------------------------------------------------
async function updateMyScholarProfile(req, res, next) {
  try {
    const { name, fiqah, bio, specialization, qualifications, yearsOfExperience, languages, location } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (fiqah !== undefined) data.fiqah = fiqah;
    if (bio !== undefined) data.bio = bio;
    if (specialization !== undefined) data.specialization = specialization;
    if (qualifications !== undefined) data.qualifications = qualifications;
    if (yearsOfExperience !== undefined) data.yearsOfExperience = Number(yearsOfExperience);
    if (languages !== undefined) {
      data.languages = Array.isArray(languages) ? languages : String(languages).split(",").map((l) => l.trim());
    }
    if (location !== undefined) data.location = location;
    if (req.file) data.picture = `uploads/scholars/${req.file.filename}`;

    const scholar = await prisma.scholar.update({ where: { id: req.user.id }, data });

    return res.json({
      success: true,
      message: "Profile updated.",
      data: { scholar: sanitizeScholar(scholar, req) },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  browseScholars,
  getScholarById,
  getMyScholarProfile,
  updateMyScholarProfile,
  askScholar,
  increaseScholarPopularity,
};
