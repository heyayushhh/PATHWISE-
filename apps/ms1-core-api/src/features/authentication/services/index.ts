import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import * as repositories from "../repositories";
import * as utils from "../utils";
import { config } from "../../../config";
import type { RegisterInput, LoginInput } from "../validators";
import type { JwtPayload } from "../types";

const googleClient = new OAuth2Client(config.googleClientId);

export async function registerUser(data: RegisterInput) {
  const existingUser = await repositories.getUserByEmail(data.email);
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await repositories.createUser({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    passwordHash,
    authProvider: "email",
    emailVerified: false,
    phoneVerified: false,
    role: "user",
    accountStatus: "active",
    lastLogin: null,
  });

  const profile = await repositories.createProfile({
    userId: user.id,
    currentStage: data.stage ?? "unspecified",
    assessmentStatus: "not_started",
  });

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = utils.generateAccessToken(payload);
  const refreshToken = utils.generateRefreshToken(payload);

  await repositories.updateUserLastLogin(user.id);

  return { user, profile, accessToken, refreshToken };
}

export async function loginUser(data: LoginInput) {
  const user = await repositories.getUserByEmail(data.email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Google-only accounts don't have a password — tell the user to use Google Sign-In
  if (!user.passwordHash) {
    throw new Error(
      "This account uses Google Sign-In. Please continue with Google.",
    );
  }

  const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);
  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  if (user.accountStatus !== "active") {
    throw new Error("Account is not active");
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = utils.generateAccessToken(payload);
  const refreshToken = utils.generateRefreshToken(payload);

  await repositories.updateUserLastLogin(user.id);

  const profile = await repositories.getProfileByUserId(user.id);
  if (!profile) {
    throw new Error("User profile not found");
  }

  return { user, profile, accessToken, refreshToken };
}

export async function googleAuthUser(credential: string) {
  // Verify the Google ID token
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: config.googleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error("Invalid Google credential: could not extract user info");
  }

  const { email, given_name, family_name } = payload;
  const firstName = given_name ?? email.split("@")[0];
  const lastName = family_name ?? "";

  // Check if user already exists
  let user = await repositories.getUserByEmail(email);
  let profile = user ? await repositories.getProfileByUserId(user.id) : null;
  let isNewUser = false;

  if (!user) {
    // New Google user — create account with authProvider="google"
    isNewUser = true;
    user = await repositories.createUser({
      firstName,
      lastName,
      email,
      phoneNumber: "",
      passwordHash: null,
      authProvider: "google",
      emailVerified: true,
      phoneVerified: false,
      role: "user",
      accountStatus: "active",
      lastLogin: null,
    });

    profile = await repositories.createProfile({
      userId: user.id,
      currentStage: "unspecified",
      assessmentStatus: "not_started",
    });
  } else {
    // Existing user — verify account is active
    if (user.accountStatus !== "active") {
      throw new Error("Account is not active");
    }
  }

  await repositories.updateUserLastLogin(user.id);

  // Fetch profile for existing users (may have been loaded above for new users)
  if (!profile) {
    profile = await repositories.getProfileByUserId(user.id);
    if (!profile) {
      throw new Error("User profile not found");
    }
  }

  const jwtPayload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = utils.generateAccessToken(jwtPayload);
  const refreshToken = utils.generateRefreshToken(jwtPayload);

  return { user, profile, accessToken, refreshToken, isNewUser };
}

export async function getCurrentUser(userId: string) {
  const user = await repositories.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const profile = await repositories.getProfileByUserId(userId);
  return { user, profile };
}

export async function updateStage(userId: string, stage: string) {
  const profile = await repositories.updateProfileStage(userId, stage);
  if (!profile) {
    throw new Error("Profile not found");
  }
  return profile;
}
