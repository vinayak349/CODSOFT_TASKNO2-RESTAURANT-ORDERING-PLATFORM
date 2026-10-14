import { prisma, isDatabaseReachable } from '@/lib/prisma';
import { store, MenuItemRecord, CategoryRecord } from '@/lib/db-store';

export interface MenuFilterOptions {
  categorySlug?: string;
  search?: string;
  dietary?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
  onlyAvailable?: boolean;
}

export class MenuService {
  // Categories
  static async getCategories(): Promise<CategoryRecord[]> {
    if (await isDatabaseReachable()) {
      try {
        const dbCategories = await prisma.category.findMany({
          orderBy: { sortOrder: 'asc' },
        });
        if (dbCategories.length > 0) {
          return dbCategories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            sortOrder: c.sortOrder,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          }));
        }
      } catch {
        // Fallback
      }
    }
    return [...store.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  static async createCategory(data: { name: string; slug: string; description?: string; sortOrder?: number }): Promise<CategoryRecord> {
    const slug = data.slug.toLowerCase().trim().replace(/\s+/g, '-');
    const sortOrder = data.sortOrder ?? store.categories.length + 1;
    const now = new Date();

    if (await isDatabaseReachable()) {
      try {
        const created = await prisma.category.create({
          data: {
            name: data.name.trim(),
            slug,
            description: data.description?.trim() || null,
            sortOrder,
          },
        });
        return {
          id: created.id,
          name: created.name,
          slug: created.slug,
          description: created.description,
          sortOrder: created.sortOrder,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        };
      } catch {
        // Fallback
      }
    }

    const newCat: CategoryRecord = {
      id: `cat-${Date.now()}`,
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    };
    store.categories.push(newCat);
    return newCat;
  }

  // Menu Items
  static async getMenuItems(options: MenuFilterOptions = {}): Promise<MenuItemRecord[]> {
    let items: MenuItemRecord[] = [];

    if (await isDatabaseReachable()) {
      try {
        const dbItems = await prisma.menuItem.findMany({
          include: { category: true },
          orderBy: { name: 'asc' },
        });
        if (dbItems.length > 0) {
          items = dbItems.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            price: Number(item.price),
            imageUrl: item.imageUrl,
            isAvailable: item.isAvailable,
            preparationTime: item.preparationTime,
            dietaryLabels: item.dietaryLabels,
            categoryId: item.categoryId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));
        }
      } catch {
        // Fallback
      }
    }

    if (items.length === 0) {
      items = [...store.menuItems];
    }

    // Apply Filters
    if (options.onlyAvailable) {
      items = items.filter((i) => i.isAvailable);
    }

    if (options.categorySlug && options.categorySlug !== 'all') {
      const categories = await this.getCategories();
      const targetCategory = categories.find((c) => c.slug === options.categorySlug);
      if (targetCategory) {
        items = items.filter((i) => i.categoryId === targetCategory.id);
      }
    }

    if (options.search && options.search.trim() !== '') {
      const query = options.search.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.description.toLowerCase().includes(query) ||
          (i.dietaryLabels && i.dietaryLabels.toLowerCase().includes(query))
      );
    }

    if (options.dietary && options.dietary !== 'all') {
      items = items.filter((i) => i.dietaryLabels && i.dietaryLabels.includes(options.dietary!));
    }

    // Apply Sorting
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'price-asc':
          items.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          items.sort((a, b) => b.price - a.price);
          break;
        case 'name-asc':
          items.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          items.sort((a, b) => b.name.localeCompare(a.name));
          break;
      }
    }

    return items;
  }

  static async getItemBySlug(slug: string): Promise<MenuItemRecord | null> {
    if (await isDatabaseReachable()) {
      try {
        const item = await prisma.menuItem.findUnique({
          where: { slug },
        });
        if (item) {
          return {
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            price: Number(item.price),
            imageUrl: item.imageUrl,
            isAvailable: item.isAvailable,
            preparationTime: item.preparationTime,
            dietaryLabels: item.dietaryLabels,
            categoryId: item.categoryId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        }
      } catch {
        // Fallback
      }
    }

    const memItem = store.menuItems.find((i) => i.slug === slug);
    return memItem ?? null;
  }

  static async getItemById(id: string): Promise<MenuItemRecord | null> {
    if (await isDatabaseReachable()) {
      try {
        const item = await prisma.menuItem.findUnique({
          where: { id },
        });
        if (item) {
          return {
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            price: Number(item.price),
            imageUrl: item.imageUrl,
            isAvailable: item.isAvailable,
            preparationTime: item.preparationTime,
            dietaryLabels: item.dietaryLabels,
            categoryId: item.categoryId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        }
      } catch {
        // Fallback
      }
    }
    const memItem = store.menuItems.find((i) => i.id === id);
    return memItem ?? null;
  }

  static async createMenuItem(data: {
    name: string;
    slug?: string;
    description: string;
    price: number;
    imageUrl: string;
    isAvailable?: boolean;
    preparationTime?: number;
    dietaryLabels?: string;
    categoryId: string;
  }): Promise<MenuItemRecord> {
    const slug = data.slug || data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const now = new Date();

    if (await isDatabaseReachable()) {
      try {
        const created = await prisma.menuItem.create({
          data: {
            name: data.name.trim(),
            slug,
            description: data.description.trim(),
            price: data.price,
            imageUrl: data.imageUrl,
            isAvailable: data.isAvailable ?? true,
            preparationTime: data.preparationTime ?? 15,
            dietaryLabels: data.dietaryLabels || null,
            categoryId: data.categoryId,
          },
        });
        return {
          id: created.id,
          name: created.name,
          slug: created.slug,
          description: created.description,
          price: Number(created.price),
          imageUrl: created.imageUrl,
          isAvailable: created.isAvailable,
          preparationTime: created.preparationTime,
          dietaryLabels: created.dietaryLabels,
          categoryId: created.categoryId,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        };
      } catch {
        // Fallback
      }
    }

    const newItem: MenuItemRecord = {
      id: `item-${Date.now()}`,
      name: data.name.trim(),
      slug,
      description: data.description.trim(),
      price: data.price,
      imageUrl: data.imageUrl,
      isAvailable: data.isAvailable ?? true,
      preparationTime: data.preparationTime ?? 15,
      dietaryLabels: data.dietaryLabels || null,
      categoryId: data.categoryId,
      createdAt: now,
      updatedAt: now,
    };
    store.menuItems.push(newItem);
    return newItem;
  }

  static async updateMenuItem(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      isAvailable: boolean;
      preparationTime: number;
      dietaryLabels: string;
      categoryId: string;
    }>
  ): Promise<MenuItemRecord | null> {
    if (await isDatabaseReachable()) {
      try {
        const updated = await prisma.menuItem.update({
          where: { id },
          data: {
            ...data,
            price: data.price !== undefined ? data.price : undefined,
          },
        });
        return {
          id: updated.id,
          name: updated.name,
          slug: updated.slug,
          description: updated.description,
          price: Number(updated.price),
          imageUrl: updated.imageUrl,
          isAvailable: updated.isAvailable,
          preparationTime: updated.preparationTime,
          dietaryLabels: updated.dietaryLabels,
          categoryId: updated.categoryId,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        };
      } catch {
        // Fallback
      }
    }

    const item = store.menuItems.find((i) => i.id === id);
    if (!item) return null;

    Object.assign(item, data, { updatedAt: new Date() });
    return item;
  }

  static async toggleAvailability(id: string): Promise<MenuItemRecord | null> {
    const item = await this.getItemById(id);
    if (!item) return null;
    return this.updateMenuItem(id, { isAvailable: !item.isAvailable });
  }

  static async deleteMenuItem(id: string): Promise<boolean> {
    if (await isDatabaseReachable()) {
      try {
        await prisma.menuItem.delete({ where: { id } });
        return true;
      } catch {
        // Fallback
      }
    }
    const idx = store.menuItems.findIndex((i) => i.id === id);
    if (idx !== -1) {
      store.menuItems.splice(idx, 1);
      return true;
    }
    return false;
  }
}
