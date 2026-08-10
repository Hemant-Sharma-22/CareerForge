const { prisma, inMemoryStore } = require('../config/prisma');

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let profile = prisma ? await prisma.userProfile.findUnique({ where: { userId } }).catch(() => null) : null;

    if (!profile) {
      profile = inMemoryStore.user_profiles.find(p => p.userId === userId);
    }

    res.json({
      success: true,
      profile: profile || {}
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      phone,
      location,
      title,
      experienceLevel,
      preferredRoles,
      preferredLocations,
      remotePreference,
      skills,
      technologies,
      bio
    } = req.body;

    const dataToUpdate = {
      phone,
      location,
      title,
      experienceLevel,
      preferredRoles: Array.isArray(preferredRoles) ? JSON.stringify(preferredRoles) : preferredRoles,
      preferredLocations: Array.isArray(preferredLocations) ? JSON.stringify(preferredLocations) : preferredLocations,
      remotePreference,
      skills: Array.isArray(skills) ? JSON.stringify(skills) : skills,
      technologies: Array.isArray(technologies) ? JSON.stringify(technologies) : technologies,
      bio,
      updatedAt: new Date()
    };

    let updatedProfile;
    if (prisma) {
      try {
        updatedProfile = await prisma.userProfile.upsert({
          where: { userId },
          update: dataToUpdate,
          create: { userId, ...dataToUpdate }
        });
      } catch (err) {
        console.warn('Prisma upsert fallback to memory store:', err.message);
      }
    }

    if (!updatedProfile) {
      let profile = inMemoryStore.user_profiles.find(p => p.userId === userId);
      if (profile) {
        Object.assign(profile, dataToUpdate);
        updatedProfile = profile;
      } else {
        updatedProfile = { id: `prof_${Date.now()}`, userId, ...dataToUpdate };
        inMemoryStore.user_profiles.push(updatedProfile);
      }
    }

    res.json({
      success: true,
      message: 'User profile updated successfully.',
      profile: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
