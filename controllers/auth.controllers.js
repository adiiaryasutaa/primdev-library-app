import bcrypt from 'bcryptjs';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import prisma from '../database/config.database.js';

export const register = async (req, res) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }

  const { name, email, password } = req.body;

  const count = await prisma.users.count({ where: { email } });

  if (count > 0) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  try {
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS),
    );

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({ message: 'Registration successful', user });
  } catch (error) {
    res.status(500).json({
      error: 'An error occurred during registration',
      details: error.message,
    });
  }
};

export const login = async (req, res) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    const { password: _, ...userWithoutPassword } = user;
    res
      .status(200)
      .json({ message: 'Login successful', user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({
      error: 'An error occurred during login',
      details: error.message,
    });
  }
};
