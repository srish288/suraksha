import { Router, type Request } from "express";
import { authenticateToken, type AuthRequest } from "../middleware/auth.middleware.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "@suraksha/shared";
import { User } from "../models/user.model.js";

const router = Router();

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing from apps/api/.env");
  }
  return secret;
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid registration details",
        errors: parsed.error.flatten()
      });
      return;
    }

    const { name, email, password, phone, nationality, emergencyContact } =
      parsed.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists"
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
      phone: phone ?? "",
      nationality: nationality ?? "",
      emergencyContact,
      role: "tourist"
    });

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      message: "Tourist registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to register user"
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid login details"
      });
      return;
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
      return;
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to log in"
    });
  }
});


router.get("/me", authenticateToken, async (req: Request, res) => {
  const authReq = req as AuthRequest;

  try {
    const user = await User.findById(authReq.user?.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch profile"
    });
  }
});

export default router;
