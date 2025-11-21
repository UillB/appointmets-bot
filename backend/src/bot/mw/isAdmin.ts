import { Context } from "telegraf";
import { prisma } from "../../lib/prisma";

/**
 * Middleware to check if a Telegram user is an admin (OWNER, MANAGER, or SUPER_ADMIN)
 * and belongs to the specified organization.
 * 
 * Stores admin user and organizationId in context for later use.
 */
export async function isTelegramAdmin(
  ctx: Context,
  organizationId: number,
  next?: () => Promise<void>
): Promise<boolean> {
  const telegramId = ctx.from?.id;
  
  if (!telegramId) {
    const message = (ctx as any).tt 
      ? (ctx as any).tt("admin.accessDenied") 
      : "❌ Access denied. Telegram ID is required.";
    await ctx.reply(message);
    return false;
  }

  // Find user by Telegram ID and check if they belong to this organization
  const user = await prisma.user.findFirst({
    where: {
      telegramId: String(telegramId)
    },
    include: {
      userOrganizations: {
        where: {
          organizationId: organizationId
        },
        include: {
          organization: true
        }
      }
    }
  });

  // Check if user exists, has Telegram linked, belongs to this organization, and is admin role
  const userOrg = user?.userOrganizations?.[0];
  if (!user || !user.telegramId || !userOrg || (user.role !== 'OWNER' && user.role !== 'MANAGER' && user.role !== 'SUPER_ADMIN')) {
    const message = (ctx as any).tt 
      ? (ctx as any).tt("admin.accessDenied") 
      : "❌ Access denied. This command is only available for administrators. Please link your Telegram account first.";
    await ctx.reply(message);
    return false;
  }

  // Store admin user in context for later use
  (ctx as any).adminUser = user;
  (ctx as any).adminOrganizationId = organizationId;

  // Call next if provided (for middleware pattern)
  if (next) {
    await next();
  }

  return true;
}

/**
 * Helper function to check admin status without replying
 * Returns the user if admin, null otherwise
 */
export async function checkAdminStatus(
  telegramId: number,
  organizationId: number
): Promise<{ user: any; organizationId: number } | null> {
  const user = await prisma.user.findFirst({
    where: {
      telegramId: String(telegramId)
    },
    include: {
      userOrganizations: {
        where: {
          organizationId: organizationId
        },
        include: {
          organization: true
        }
      }
    }
  });

  const userOrg = user?.userOrganizations?.[0];
  if (!user || !user.telegramId || !userOrg || (user.role !== 'OWNER' && user.role !== 'MANAGER' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return { user, organizationId: organizationId };
}

