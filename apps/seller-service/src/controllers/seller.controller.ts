import { ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imageKit";
import prisma from "@packages/libs/prisma";
import { Request,Response,NextFunction } from "express";

//fetching notifications for sellers
export const sellerNotifications = async (req:any, res:Response, next:NextFunction) => {
    try {
        const sellerId = req.seller.id;

        const notifications = await prisma.notifications.findMany({
            where: {
                receiverId: sellerId,
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


export const uploadAvatar = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { fileData, fileName } = req.body;

    if (!fileData) {
      return next(new ValidationError("No file data provided"));
    }

    // 1. Ensure the seller and shop exist (middleware should set req.seller)
    const seller = req.seller;
    if (!seller || !seller.shop) {
      return res.status(401).json({ message: "Unauthorized or shop not found" });
    }
    const shopId = seller.shop.id;

    // 2. Upload to ImageKit
    const response = await imagekit.upload({
      file: fileData, // base64 string (without prefix)
      fileName: fileName || `avatar-${Date.now()}.jpg`,
      folder: "/shop/avatar",
    });

    // 3. Find or create the avatar record for this shop
    let avatar = await prisma.shopAvatar.findUnique({
      where: { shopId },
    });

    if (!avatar) {
      avatar = await prisma.shopAvatar.create({
        data: {
          shopId,          // ✅ use the scalar foreign key
          url: response.url,
        },
      });
    } else {
      // Update existing avatar with the new URL
      avatar = await prisma.shopAvatar.update({
        where: { shopId },
        data: { url: response.url },
      });
    }

    res.status(201).json({
      file_url: response.url,
      fileId: response.fileId,
      avatar, // optional
    });
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({
      message: "Upload failed",
      error: error?.message || error,
    });
  }
}
// sellerController.ts ili negde gde su ti seller rute

export const uploadCoverBanner = async (req: any, res: Response, next: NextFunction) => {
  try {
    // 1. Provera da li je seller ulogovan i ima shop
    const seller = req.seller;
    if (!seller || !seller.shop) {
      return res.status(401).json({ message: "Niste autorizovani ili nemate prodavnicu" });
    }

    const shopId = seller.shop.id;

    // 2. Uzmi podatke iz tela zahteva
    const { fileData, fileName } = req.body;
    if (!fileData) {
      return next(new ValidationError("Nije poslat fajl"));
    }

    // 3. Upload na ImageKit
    const response = await imagekit.upload({
      file: fileData, // očekujemo base64 string BEZ prefiksa (npr. "data:image/png;base64,...")
      fileName: fileName || `cover-${Date.now()}.jpg`,
      folder: "/shop/cover",
    });

    // 4. Ažuriraj prodavnicu - postavi novi URL za coverBanner
    const updatedShop = await prisma.shops.update({
      where: { id: shopId },
      data: { coverBanner: response.url },
    });

    // 5. Vrati uspešan odgovor
    res.status(200).json({
      message: "Cover banner uspešno postavljen",
      coverBanner: response.url,
      shop: updatedShop,
    });
  } catch (error: any) {
    console.error("GREŠKA PRI UPLOAD-U COVER BANNERA:", error);
    res.status(500).json({
      message: "Upload cover bannera nije uspeo",
      error: error?.message || error,
    });
  }
};

// seller.controller.ts (ili gde već imaš seller kontrolere)

export const getShop = async (req: any, res: Response, next: NextFunction) => {
  try {
    // 1. Provera da li je seller autentifikovan i ima shop
    const seller = req.seller;
    if (!seller || !seller.shop) {
      return res.status(401).json({ message: "Niste autorizovani ili nemate prodavnicu" });
    }

    const shopId = seller.shop.id;

    // 2. Dohvati podatke o prodavnici sa svim vezanim podacima
    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
      include: {
        avatar: true,        // uključuje shopAvatar (url)
        // ako imaš i druge relacije koje želiš
        // products: true,   // ako želiš da brojiš proizvode, ali bolje count
        // orders: true,
      },
    });

    if (!shop) {
      return res.status(404).json({ message: "Prodavnica nije pronađena" });
    }

    // 3. Izračunaj dodatne brojeve (ako nisu direktno u modelu)
    const [productsCount, ordersCount, followersCount] = await Promise.all([
      prisma.products.count({ where: { shopId: shop.id } }),
      prisma.orders.count({ where: { shopId: shop.id } }),
      // ako imaš model za praćenje (followers) – pretpostavimo da ne postoji, pa vraćamo 0
      Promise.resolve(0), // zameni sa stvarnim brojem ako imaš
    ]);

    // 4. Formatiraj odgovor – vrati sve što frontend očekuje
    const responseData = {
      id: shop.id,
      name: shop.name,
      bio: shop.bio,
      category: shop.category,
      address: shop.address,
      opening_hours: shop.opening_hours,
      website: shop.website,
      socialLinks: shop.socialLinks,
      coverBanner: shop.coverBanner,
      ratings: shop.ratings,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
      // avatar – uzmi url iz relacije ili null
      avatar: shop.avatar ? { url: shop.avatar.url } : null,
      // dodatne brojke
      productsCount,
      ordersCount,
      followersCount,
      // možeš dodati i druge statuse
      isVerified: true, // ako imaš polje za verifikaciju
    };

    res.status(200).json({
      success: true,
      shop: responseData,
    });
  } catch (error: any) {
    console.error("GREŠKA PRI DOHVATANJU PRODAVNICE:", error);
    res.status(500).json({
      message: "Došlo je do greške pri učitavanju podataka",
      error: error?.message || error,
    });

    return next(error)
  }
};