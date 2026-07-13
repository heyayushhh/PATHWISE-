import bcrypt from "bcrypt";
import * as repositories from "../repositories";
import * as utils from "../utils";
import type { RegisterInput, LoginInput } from "../validators";
import type { JwtPayload } from "../types";

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

  await repositories.createProfile({
    userId: user.id,
    currentStage: data.stage,
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

  return { user, accessToken, refreshToken };
}

export async function loginUser(data: LoginInput) {
  const user = await repositories.getUserByEmail(data.email);
  if (!user) {
    throw new Error("Invalid email or password");
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

  return { user, accessToken, refreshToken };
}

export async function getCurrentUser(userId: string) {
  const user = await repositories.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const profile = await repositories.getProfileByUserId(userId);
  return { user, profile };
}
