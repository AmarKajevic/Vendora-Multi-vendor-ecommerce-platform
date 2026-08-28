

//get all products

import { ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imageKit";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request,Response } from "express";

export const getAllProducts = async (req: Request, res:Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page-1) * limit;

        const [products, totalProducts] = await Promise.all([
            prisma.products.findMany({


                where: {
                    isDeleted: false,
                    status: "Active",
                },
                skip,
                take: limit,
                orderBy: {createdAt: "desc"},
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    sale_price: true,
                    stock: true,
                    createdAt: true,
                    ratings: true,
                    category: true,
                    images: {
                        select: {url: true},
                        take: 1
                    },
                    Shop: {
                        select: {name: true}
                    }
                }
            }),
            
           prisma.products.count({
                where:{
                isDeleted:false,
                status:"Active"
                }
            }),
           
        ])

        const totalPages = Math.ceil(totalProducts/limit)

        res.status(200).json({
            success: true,
            data: products,
            meta: {
                totalProducts,
                currentPage: page,
                totalPages
            }
        })
    } catch (error) {
        next(error)
        
    }
}

export const getAllEvents = async (req: Request, res:Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page-1) * limit;

        const [products, totalProducts] = await Promise.all([
            prisma.products.findMany({


                where: {
                    starting_date: {
                        not:null
                    }
                },
                skip,
                take: limit,
                orderBy: {createdAt: "desc"},
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    sale_price: true,
                    stock: true,
                    createdAt: true,
                    ratings: true,
                    category: true,
                    images: {
                        select: {url: true},
                        take: 1
                    },
                    Shop: {
                        select: {name: true}
                    }
                }
            }),
            
           prisma.products.count({
                where:{
                starting_date: {
                        not:null
                    }
                }
            }),
           
        ])

        const totalPages = Math.ceil(totalProducts/limit)

        res.status(200).json({
            success: true,
            data: products,
            meta: {
                totalProducts,
                currentPage: page,
                totalPages
            }
        })
    } catch (error) {
        next(error)
        
    }
}


export const getAllAdmins = async(req: Request, res:Response, next: NextFunction) => {
    try {
        const admins = await prisma.users.findMany({
            where: {
                role: "admin"
            }
        })

        res.status(201).json({
            success:true,
            admins
        })

    } catch (error) {
        next(error)
    }
}

export const addNewAdmin = async (req: Request, res:Response, next: NextFunction) => {
    try {
        const {email, role} = req.body
        const isUser = await prisma.users.findUnique({where: {email}})
        if(!isUser) {
            return next(new ValidationError("Something went wrong!"))
        }

        const updatedRole = await prisma.users.update({
            where: {email},
            data: {
                role,
            }
        })

        res.status(201).json({
            success:true,
            updatedRole
        })
        
    } catch (error) {
        next(error)
    }

}

export const getAllCustomizations = async (req: Request, res:Response, next: NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst();

        return res.status(200).json({
            categories: config?.categories || [],
            subCategories: config?.subCategories || {},
            logo: config?.logo || null,
            banner: config?.banner || null
        })
    } catch (error) {
        return next(error)
        
    }
}
export const getAllUsers = async (req: Request, res:Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page-1) * limit;

        const [users, totalUsers] = await Promise.all([
            prisma.users.findMany({
               skip,
               take: limit,
               orderBy: {createdAt: "desc"},
               select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
               }
            }),
            prisma.users.count({
                where: {
                    role: "user"
                }
            })
        ])
        

        const totalPages = Math.ceil(totalUsers/limit)

        res.status(200).json({
            success: true,
            data: users,
            meta: {
                totalUsers,
                currentPage: page,
                totalPages
            }
        })
    } catch (error) {
        next(error)
    }
}

export const getAllSellers = async (req: Request, res:Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page-1) * limit;

        const [sellers, totalSellers] = await Promise.all([
            prisma.sellers.findMany({
               skip,
                take: limit,
                orderBy: {createdAt: "desc"},
                select:{
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    shop: {
                        select: {
                            name: true,
                            avatar: true,
                            address: true,  


                    }
                }
            }}),
            prisma.sellers.count()
        ])

        const totalPages = Math.ceil(totalSellers/limit)

        res.status(200).json({
            success: true,
            data: sellers,
            meta: {
                totalSellers,
                currentPage: page,
                totalPages
            }
        })

    }catch(error) {
        next(error)
    }
}

export const banUser = async (req: Request, res:Response, next: NextFunction) => {
    try {
        const {userId} = req.params;
        const user = await prisma.users.findUnique({where: {id: userId}})

        if(!user) {
            return next(new ValidationError("User not found"))
        }

        const updatedUser = await prisma.users.update({
            where: {id: userId},
            data: {
                isBanned: true
            }
        })

        res.status(200).json({
            success: true,
            data: updatedUser
        })

    }catch(error) {
        next(error)
    }
}

// get all notifications

export const getAllNotifications = async (req:Request, res:Response, next:NextFunction) => {
    try {
        

        const notifications = await prisma.notifications.findMany({
            where: {
                receiverId: "admin",
            },
            orderBy: {
                createdAt: "desc"
            }
        })
        res.status(200).json({
            success:true,
            notifications
        })
    } catch (error) {
        next(error)
    }

}

//get all users notifications
export const getUserNotifications = async (req:any, res:Response, next:NextFunction) => {
    try {
        const userId = req.user.id;

        const notifications = await prisma.notifications.findMany({
            where: {
                receiverId: userId,
            },
            orderBy: {
                createdAt: "desc"
            }
        })
        res.status(200).json({
            success:true,
            notifications
        })
    } catch (error) {
        next(error)
    }

}

//mark notification as read
export const markNotificationAsRead = async (
    req:any, res:Response, next:NextFunction
) => {
    try {
        const {notificationId} = req.body;

        if(!notificationId) {
            return next(new ValidationError("Notification Id is required"))
        }

        const notification = await prisma.notifications.update({
            where: {id: notificationId},
            data: {status: "Read"}
        })

        res.status(200).json({
            success: true,
            notification
        })
    } catch (error) {
        next(error)
    }
}


export const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.body;

    if (!category || typeof category !== 'string' || !category.trim()) {
      return next(new ValidationError("Category name is required and must be a non-empty string."));
    }

    // Pronađi trenutnu konfiguraciju (pretpostavljamo da postoji samo jedan dokument)
    let config = await prisma.site_config.findFirst();

    if (!config) {
      // Ako ne postoji, kreiraj novi dokument sa praznim nizom kategorija
      config = await prisma.site_config.create({
        data: {
          categories: [],
          subCategories: {},
        },
      });
    }

    // Provjeri da li kategorija već postoji (osjetljivo na velika/mala slova)
    if (config.categories.some((cat: string) => cat.toLowerCase() === category.trim().toLowerCase())) {
      return next(new ValidationError("Category already exists."));
    }

    // Ažuriraj: dodaj novu kategoriju na kraj niza
    const updatedConfig = await prisma.site_config.update({
      where: { id: config.id },
      data: {
        categories: {
          push: category.trim(),
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedConfig,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dodaje novu podkategoriju u određenu kategoriju
 */
export const addSubcategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, subCategory } = req.body;

    if (!category || typeof category !== 'string' || !category.trim()) {
      return next(new ValidationError("Category name is required."));
    }
    if (!subCategory || typeof subCategory !== 'string' || !subCategory.trim()) {
      return next(new ValidationError("Subcategory name is required and must be a non-empty string."));
    }

    // Pronađi konfiguraciju
    let config = await prisma.site_config.findFirst();
    if (!config) {
      return next(new ValidationError("Site configuration not found. Please add categories first."));
    }

    // Provjeri da li kategorija postoji
    if (!config.categories.includes(category.trim())) {
      return next(new ValidationError(`Category "${category}" does not exist.`));
    }

    // Trenutne subkategorije kao objekat
    const subCategories = (config.subCategories as Record<string, string[]>) || {};

    // Ako kategorija nema svoj niz, inicijalizuj ga
    if (!subCategories[category.trim()]) {
      subCategories[category.trim()] = [];
    }

    // Provjera duplikata (osjetljivo na velika/mala slova)
    const exists = subCategories[category.trim()].some(
      (sub: string) => sub.toLowerCase() === subCategory.trim().toLowerCase()
    );
    if (exists) {
      return next(new ValidationError("Subcategory already exists in this category."));
    }

    // Dodaj novu podkategoriju
    subCategories[category.trim()].push(subCategory.trim());

    // Ažuriraj dokument
    const updatedConfig = await prisma.site_config.update({
      where: { id: config.id },
      data: {
        subCategories: subCategories,
      },
    });

    res.status(200).json({
      success: true,
      data: updatedConfig,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadLogo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName, fileData } = req.body;
    if (!fileData) {
      return next(new ValidationError("No file data provided."));
    }

    // Base64 string direktno za ImageKit
    const response = await imagekit.upload({
      file: fileData, // ImageKit prima base64 bez prefiksa
      fileName: `logo-${Date.now()}-${fileName || 'image'}`,
      folder: "/site-config/logo",
    });

    // Ažuriraj bazu
    let config = await prisma.site_config.findFirst();
    if (!config) {
      config = await prisma.site_config.create({
        data: { categories: [], subCategories: {} },
      });
    }
    const updated = await prisma.site_config.update({
      where: { id: config.id },
      data: { logo: response.url },
    });

    res.status(200).json({
      success: true,
      logoUrl: response.url,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { files } = req.body; // očekujemo niz objekata { fileName, fileData }
    if (!files || files.length === 0) {
      return next(new ValidationError("No files provided."));
    }

    // Upload svih na ImageKit
    const uploadPromises = files.map((file: any) =>
      imagekit.upload({
        file: file.fileData,
        fileName: `banner-${Date.now()}-${file.fileName || 'image'}`,
        folder: "/site-config/banner",
      })
    );
    const results = await Promise.all(uploadPromises);
    const newUrls = results.map((r) => r.url);

    // Dohvati i ažuriraj konfiguraciju
    let config = await prisma.site_config.findFirst();
    if (!config) {
      config = await prisma.site_config.create({
        data: { categories: [], subCategories: {} },
      });
    }
    const currentBanner = (config.banner as string[]) || [];
    const updatedBanner = [...currentBanner, ...newUrls];

    const updated = await prisma.site_config.update({
      where: { id: config.id },
      data: { banner: updatedBanner },
    });

    res.status(200).json({
      success: true,
      bannerUrls: newUrls,
      allBanners: updatedBanner,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};