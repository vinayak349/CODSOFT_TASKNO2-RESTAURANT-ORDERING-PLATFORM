import bcrypt from 'bcryptjs';
import { prisma, isDatabaseReachable } from '@/lib/prisma';
import { store, Role } from '@/lib/db-store';
import { RegisterInput } from '@/lib/validation/auth.schema';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  createdAt: Date;
}

export class UserService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async findByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    if (await isDatabaseReachable()) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: normalized },
        });
        if (user) return user;
      } catch {
        // Fallback to store
      }
    }
    const memUser = store.users.find((u) => u.email.toLowerCase() === normalized);
    return memUser ?? null;
  }

  static async findById(id: string): Promise<SafeUser | null> {
    if (await isDatabaseReachable()) {
      try {
        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            createdAt: true,
          },
        });
        if (user) return user as SafeUser;
      } catch {
        // Fallback
      }
    }
    const memUser = store.users.find((u) => u.id === id);
    if (!memUser) return null;
    return {
      id: memUser.id,
      name: memUser.name,
      email: memUser.email,
      role: memUser.role,
      phone: memUser.phone,
      createdAt: memUser.createdAt,
    };
  }

  static async registerCustomer(input: RegisterInput): Promise<SafeUser> {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await this.hashPassword(input.password);
    const now = new Date();

    if (await isDatabaseReachable()) {
      try {
        const created = await prisma.user.create({
          data: {
            name: input.name.trim(),
            email: input.email.toLowerCase().trim(),
            passwordHash,
            role: 'CUSTOMER',
            phone: input.phone?.trim() || null,
          },
        });
        return {
          id: created.id,
          name: created.name,
          email: created.email,
          role: created.role as Role,
          phone: created.phone,
          createdAt: created.createdAt,
        };
      } catch {
        // Fallback to store
      }
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      passwordHash,
      role: 'CUSTOMER' as Role,
      phone: input.phone?.trim() || null,
      createdAt: now,
      updatedAt: now,
    };
    store.users.push(newUser);
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      createdAt: newUser.createdAt,
    };
  }

  static async getAllUsers(): Promise<SafeUser[]> {
    if (await isDatabaseReachable()) {
      try {
        const users = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            createdAt: true,
          },
        });
        if (users.length > 0) return users as SafeUser[];
      } catch {
        // Fallback
      }
    }
    return store.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      createdAt: u.createdAt,
    }));
  }

  static async updateUserRole(userId: string, newRole: Role): Promise<SafeUser | null> {
    if (await isDatabaseReachable()) {
      try {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { role: newRole },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            createdAt: true,
          },
        });
        return updated as SafeUser;
      } catch {
        // Fallback
      }
    }
    const user = store.users.find((u) => u.id === userId);
    if (!user) return null;
    user.role = newRole;
    user.updatedAt = new Date();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    };
  }
}
