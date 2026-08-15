const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { prisma, inMemoryStore } = require('../config/prisma');

// Strict Email Regex for real email format validation
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) return false;
  
  const [localPart, domain] = email.split('@');
  if (!localPart || localPart.length < 2 || !domain) return false;
  
  const parts = domain.split('.');
  if (parts.length < 2) return false;
  const tld = parts[parts.length - 1];
  if (tld.length < 2 || /^\d+$/.test(tld)) return false;
  
  const blockedDomains = ['example.com', 'test.com', 'invalid.com', 'localhost'];
  if (blockedDomains.includes(domain.toLowerCase())) return false;

  return true;
};

// 1. Direct Candidate Registration
const register = async (req, res, next) => {
  try {
    const { name, email, password, title, experienceLevel } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email address, and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Deliverable Email Validation Check
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid, deliverable email address (e.g. name@company.com).'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existingUserPrisma = prisma ? await prisma.user.findUnique({ where: { email: cleanEmail } }).catch(() => null) : null;
    const existingUserMemory = inMemoryStore.users.find(u => u.email === cleanEmail);

    if (existingUserPrisma || existingUserMemory) {
      return res.status(400).json({
        success: false,
        message: 'User with this email address already exists. Please sign in or click Forgot Password.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const newUser = {
      id: userId,
      email: cleanEmail,
      name: name.trim(),
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newProfile = {
      id: `prof_${Date.now()}`,
      userId,
      title: title || 'Software Engineer Candidate',
      experienceLevel: experienceLevel || 'Mid',
      skills: JSON.stringify([]),
      preferredRoles: JSON.stringify(['Software Engineer', 'Full Stack Developer']),
      preferredLocations: JSON.stringify(['Remote', 'Hybrid', 'Bangalore', 'New Delhi', 'Mumbai', 'New York']),
      remotePreference: 'Hybrid',
      updatedAt: new Date()
    };

    if (prisma) {
      try {
        await prisma.user.create({
          data: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            passwordHash: newUser.passwordHash,
            profile: {
              create: newProfile
            }
          }
        });
      } catch (dbErr) {
        console.warn('Postgres connection fallback to in-memory store:', dbErr.message);
        inMemoryStore.users.push(newUser);
        inMemoryStore.user_profiles.push(newProfile);
      }
    } else {
      inMemoryStore.users.push(newUser);
      inMemoryStore.user_profiles.push(newProfile);
    }

    const token = jwt.sign({ id: userId, email: cleanEmail, name: newUser.name }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: userId,
        name: newUser.name,
        email: cleanEmail,
        profile: newProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Google OAuth & Gmail Account Sign In / Sign Up Handler
const googleAuth = async (req, res, next) => {
  try {
    const { email, name, googleId, picture, title, experienceLevel } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication failed: Gmail address not provided.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userName = name || cleanEmail.split('@')[0];

    let user = prisma ? await prisma.user.findUnique({ where: { email: cleanEmail }, include: { profile: true } }).catch(() => null) : null;

    if (!user) {
      user = inMemoryStore.users.find(u => u.email === cleanEmail);
      if (user) {
        const profile = inMemoryStore.user_profiles.find(p => p.userId === user.id);
        user = { ...user, profile };
      }
    }

    // Auto-create candidate user with their real Gmail address
    if (!user) {
      const userId = `usr_g_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const passwordHash = await bcrypt.hash(`google_oauth_${googleId || Date.now()}`, 10);

      const newUser = {
        id: userId,
        email: cleanEmail,
        name: userName,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newProfile = {
        id: `prof_${Date.now()}`,
        userId,
        title: title || 'Software Engineer Candidate',
        experienceLevel: experienceLevel || 'Mid',
        skills: JSON.stringify([]),
        preferredRoles: JSON.stringify(['Software Engineer', 'Full Stack Developer']),
        preferredLocations: JSON.stringify(['Remote', 'Hybrid', 'Bangalore', 'New York']),
        remotePreference: 'Hybrid',
        updatedAt: new Date()
      };

      if (prisma) {
        try {
          await prisma.user.create({
            data: {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              passwordHash: newUser.passwordHash,
              profile: {
                create: newProfile
              }
            }
          });
        } catch (dbErr) {
          console.warn('Postgres connection fallback for Google user:', dbErr.message);
          inMemoryStore.users.push(newUser);
          inMemoryStore.user_profiles.push(newProfile);
        }
      } else {
        inMemoryStore.users.push(newUser);
        inMemoryStore.user_profiles.push(newProfile);
      }

      user = { ...newUser, profile: newProfile };
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });

    res.json({
      success: true,
      message: 'Google authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email address and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    let user = prisma ? await prisma.user.findUnique({ where: { email: cleanEmail }, include: { profile: true } }).catch(() => null) : null;

    if (!user) {
      user = inMemoryStore.users.find(u => u.email === cleanEmail);
      if (user) {
        const profile = inMemoryStore.user_profiles.find(p => p.userId === user.id);
        user = { ...user, profile };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address. Please register a new account.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password entered. Did you forget your password?'
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Registered email address and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    let userPrisma = prisma ? await prisma.user.findUnique({ where: { email: cleanEmail } }).catch(() => null) : null;
    let userMemory = inMemoryStore.users.find(u => u.email === cleanEmail);

    if (!userPrisma && !userMemory) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address.'
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    if (prisma && userPrisma) {
      try {
        await prisma.user.update({
          where: { email: cleanEmail },
          data: { passwordHash: newPasswordHash, updatedAt: new Date() }
        });
      } catch (err) {
        console.warn('Prisma reset password fallback:', err.message);
      }
    }

    if (userMemory) {
      userMemory.passwordHash = newPasswordHash;
      userMemory.updatedAt = new Date();
    }

    res.json({
      success: true,
      message: 'Password updated successfully! You can now sign in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let user = prisma ? await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }).catch(() => null) : null;

    if (!user) {
      user = inMemoryStore.users.find(u => u.id === userId);
      if (user) {
        const profile = inMemoryStore.user_profiles.find(p => p.userId === userId);
        user = { ...user, profile };
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  googleAuth,
  login,
  resetPassword,
  getMe
};
