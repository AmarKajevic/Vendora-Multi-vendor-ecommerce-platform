import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imageKit";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
import { Request, Response,NextFunction } from "express";

//get product categories
export const getCategories = async(req: Request, res:Response, next:NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst();

        if(!config) {
            return res.status(404).json({message : "Categories not found!"})
        }

        return res.status(200).json({
            categories: config.categories, subCategories: config.subCategories, success:true
        })
    } catch (error) {
        return next(error)
    }
}
//create discount codes
export const createDiscountCode = async(req: any, res:Response, next:NextFunction) => {
    try {
        const {public_name, discountType, discountValue, discountCode} = req.body;

        const isDiscountCodeExists = await prisma.discount_codes.findUnique({
            where:{discountCode}
        })

        if(isDiscountCodeExists){
            return next(new ValidationError("Discount code is already available please use a different code!"))
        }

        const discount_code = await prisma.discount_codes.create({
            data: {
                public_name,
                discountType,
                discountCode,
                discountValue: parseFloat(discountValue),
                sellerId: req.seller.id
            }
        })

        res.status(201).json({success: true, discount_code})
        
    } catch (error) {
        return next(error)
        
    }
}

export const getDiscountCodes = async(req: any, res:Response, next:NextFunction) => {
    try {
        const discount_codes = await prisma.discount_codes.findMany({
            where:{
                sellerId: req.seller.id,
            }
        })

        res.status(200).json({
            success: true, discount_codes
        })


    } catch (error) {
        return next(error)
    }
}
//delete discount code

export const deleteDiscountCode = async (req: any, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params
        const sellerId = req.seller?.id

        const discountCode = await prisma.discount_codes.findUnique({where:{id}, select: {id:true, sellerId: true}})

        if(!discountCode){
            return next (new NotFoundError("Discount code not Found"))
        }

        if(discountCode.sellerId !== sellerId){
            return next(new ValidationError("Unathorized access!"))
        }
        await prisma.discount_codes.delete({where: {id}})

        return res.status(200).json({message: "Discount code successfully deleted"})
    } catch (error) {
        return next(error)
    }
}

//upload product image

export const uploadProductImage = async(req:Request, res: Response, next: NextFunction) => {
    try {
        const {fileName} = req.body;
        console.log(fileName)

        const response = await imagekit.upload({
            file: fileName,
            fileName: `product-${Date.now()}.jpg`,
            folder: "/products",

        })

        res.status(201).json({
            file_url: response.url,
            fileId: response.fileId,
        })
    } catch (error: any) {
    console.log("UPLOAD ERROR:", error);
    res.status(500).json({
        message: "Upload failed",
        error: error?.message || error
    });
}
}

//delete image
export const deleteProductImage = async (req:Request, res: Response, next: NextFunction) => {
    try {
        const {fileId} = req.body
        
        const response = await imagekit.deleteFile(fileId);

        res.status(200).json({success: true, response})
    } catch (error: any) {
        
        console.log("UPLOAD ERROR:", error);
    res.status(500).json({
        message: "Upload failed",
        error: error?.message || error
    });
    }
}

export const createProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      totalSales,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes = [],   // 🔥 FIX: default empty array
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties = {},
      images = [],
    } = req.body;

    // Validacija obaveznih polja
    if (
      !title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !sale_price ||
      !images ||              // ako ne želiš da proveravaš da li ima slika, izbaci ovo
      !tags ||
      !stock ||
      !regular_price
    ) {
      return next(new ValidationError("Missing required fields"));
    }

    // Provera da li slike postoje (ako su obavezne)
    if (!images.length) {
      return next(new ValidationError("At least one image is required"));
    }

    // Provera seller-a i shop-a
    if (!req.seller?.id) {
      return next(new AuthError("Only seller can create products!"));
    }
    if (!req.seller?.shop?.id) {
      return next(new AuthError("Seller does not have a shop"));
    }

    // Provera dupliciranog sluga
    const slugChecking = await prisma.products.findUnique({
      where: { slug },
    });
    if (slugChecking) {
      return next(new ValidationError("Slug already exists! Please use a different slug!"));
    }

    // Parsiranje brojeva
    const parsedStock = parseInt(stock);
    const parsedSalePrice = parseFloat(sale_price);
    const parsedRegularPrice = parseFloat(regular_price);
    if (isNaN(parsedStock) || isNaN(parsedSalePrice) || isNaN(parsedRegularPrice)) {
      return next(new ValidationError("Stock, sale price and regular price must be valid numbers"));
    }

    // Priprema tagova
    const tagsArray = Array.isArray(tags) ? tags : tags.split(",").map((t:any) => t.trim());

    const randomTotalSales = Math.floor(Math.random() * 1000) + 1;

    // Kreiranje proizvoda
    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        totalSales: randomTotalSales,
        shopId: req.seller.shop.id,
        tags: tagsArray,
        brand,
        video_url,
        category,
        subCategory,
        colors: colors || [],
        discount_codes: discountCodes.map((codeId: string) => codeId), // sad sigurno radi
        sizes: sizes || [],
        stock: parsedStock,
        sale_price: parsedSalePrice,
        regular_price: parsedRegularPrice,
        custom_properties: customProperties || {},
        custom_specifications: custom_specifications || {},
       images: {
            create: images
                .filter((img:any) => img && img.fileId && img.file_url)
                .map((img:any) => ({ file_id: img.fileId, url: img.file_url }))
            }
      },
      include: { images: true },
    });

    res.status(201).json({
      success: true,
      newProduct,
    });
  } catch (error) {
    next(error);
    console.log(error)
  }
};

// product.controller.ts
export const getShopProducts = async (req: any, res: Response, next: NextFunction) => {
  try {
    // 1. Prvo pokušaj da uzmeš shopId iz query stringa
    const shopId = req.query.shopId || req?.seller?.shop?.id;

    if (!shopId) {
      return res.status(400).json({ success: false, message: "shopId is required" });
    }

    const products = await prisma.products.findMany({
      where: { shopId },
      include: { images: true },
      take: 10, // opcionalno – ograniči broj
    });

    res.status(200).json({ success: true, products });
  } catch (error) {
    return next(error);
  }
};
//delete products

export const deleteProduct = async (req:any, res:Response, next:NextFunction) => {
    try {
        const {productId} = req.params;
        const sellerId = req.seller?.shop?.id;

        const product = await prisma.products.findUnique({
            where: {id: productId},
            select: {id: true, shopId: true, isDeleted: true}
        })

        if(!product) {
            return next(new ValidationError("Product not found!"))
        }

        if(product.shopId !== sellerId) {
            return next(new ValidationError("Unauthorized action!"))
        }

        if(product.isDeleted) {
            return next(new ValidationError("Product is already deleted"))
        }

        const deleteProduct = await prisma.products.update({
            where: {id: productId},
            data: {
                isDeleted:true,
                deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000 )
            }
        })

        return res.status(200).json({
            message: "Products is scheduled for deletion in 24 hours. You can restore it within this period",
            deletedAt: deleteProduct.deletedAt
        })
    } catch (error) {
        return next(error)
    }
}

export const restoreProduct = async (req:any, res:Response, next:NextFunction) => {
    try {
        const {productId} = req.params;

        const sellerId = req.seller?.shop?.id;

        const product = await prisma.products.findUnique({
            where: {id: productId},
            select: {id: true, shopId: true, isDeleted: true}
        })

        if(!product) {
            return next(new ValidationError("Product not found"))
        }

        if(product.shopId !== sellerId){
            return next(new ValidationError("Unathorized action"))
        }

        if(!product.isDeleted) {
            return res.status(400).json({message: "Product is not in delete state"})
        }

        await prisma.products.update({
            where: {id:productId},
            data: {isDeleted: false,deletedAt:null}
        })

        return res.status(200).json({message: "Product successfully restored!"})
    } catch (error) {
        return res.status(500).json({message: "Error restoring product", error})
    }
}

// get all products
// export const getAllProducts = async(req: Request, res: Response, next: NextFunction) => {
//     try {
//         const page = parseInt(req.query.page as string) || 1;
//         const limit = parseInt(req.query.limit as string) || 20;
//         const skip = (page - 1) * limit;
//         const type = req.query.type;

//         const baseFilter = {
//             OR:[{
//                 starting_date:null,

//             }, {
//                 ending_date:null,
//             }]
//         }

//         const orderBy: Prisma.productsOrderByWithRelationInput =
//         type === "latest" 
//         ? {createdAt: "desc" as Prisma.SortOrder}
//         : {totalSales: "desc" as Prisma.SortOrder}

        
//         const [products,total, top10Products] = await Promise.all([
//             prisma.products.findMany({
//                 skip,
//                 take: limit,
//                 include: {
//                     images: true,
//                     Shop:true,
//                 },
//                 where: baseFilter,
//                 orderBy:{
//                     totalSales: "desc",
//                 }
//             }),
//             prisma.products.count({where: baseFilter}),
//             prisma.products.findMany({
//                 take: 10,
//                 where: baseFilter,
//                 orderBy
//             })
//         ])

//         res.status(200).json({
//             products,
//             top10By: type === "latest" ? "latest" : "topSales",
//             top10Products,
//             total,
//             currentPage: page,
//             totalPages: Math.ceil(total/ limit)
//         })
//     } catch (error) {
//         next(error);
//     }
// }

export const getAllProducts = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const type = req.query.type;


        
        const [products,total,top10Products] = await Promise.all([
    prisma.products.findMany({
        skip,
        take: limit,
        include:{
            images:true,
            Shop:true,
        },
        where:{
          isDeleted:false,
          status:"Active"
        },
        orderBy:{
            totalSales:"desc"
        }
    }),

    prisma.products.count({
        where:{
          isDeleted:false,
          status:"Active"
        }
    }),

    prisma.products.findMany({
        take:10,
        where:{
          isDeleted:false,
          status:"Active"
        },
        orderBy:{
          totalSales:"desc"
        },
        include:{
          images:true,
          Shop:true
        }
    })
])
        res.status(200).json({
            products,
            top10By: type === "latest" ? "latest" : "topSales",
            top10Products,
            total,
            currentPage: page,
            totalPages: Math.ceil(total/ limit)
        })
    } catch (error) {
        next(error);
    }
}

//get-all-events
export const getAllEvents = async(req: Request, res: Response, next: NextFunction) => {
    try {
         const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const baseFilter = {
            AND: [{starting_date: {not:null}}, {ending_date: {not: null}}]
        }

        const [events, total, top10bySales] = await Promise.all([
            prisma.products.findMany({
                skip,
                take: limit,
                where: baseFilter,
                include: {
                    images:true,
                    shop:true
                },
                orderBy: {
                    totalSales: "desc"
                }
            }),
            prisma.products.count({where:baseFilter}),
            prisma.products.findMany({
                where: baseFilter,
                take:10,
                orderBy: {
                    totalSales: "desc"
                }
            })
        ])

        res.status(200).json({
            events,
            top10bySales,
            total,
            currenPage: page,
            totalPages: Math.ceil(total/limit)
        })
    } catch (error) {
        res.status(500).json({message: "Failed to fetch events"})
    }
    
}

export const getProductDetails = async(req: Request, res: Response, next: NextFunction) => {
    try {
         console.log("Ceo req.params:", req.params); // <<< OVO DODAJ
        console.log("req.params.slug:", req.params.slug);
        console.log("Primljen slug:", req.params.slug); // DODAJ OVO

        const product = await prisma.products.findUnique({
            where: {
                slug: req.params.slug!
            },
            include: {
                images: true,
                Shop: true
            },
        });
        console.log("Pronađen product:", product); // DODAJ OVO

        res.status(200).json({success: true, product}); // 201 je za CREATE, ovde koristi 200
    } catch (error) {
        return next(error)
    }
}

// get filtered products

export const getFilteredProducts = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            priceRange = [0, 10000],
            categories = [],
            colors = [],
            sizes = [],
            page = 1,
            limit =12,
        } = req.query;

        const parsedPriceRange = typeof priceRange === "string" ? priceRange.split(",").map(Number) : [0, 10000]
        const parsedPage = Number(page);
        const parsedlimit = Number(limit);

        const skip = (parsedPage - 1) *parsedlimit

        const filters: Record<string, any> = {
            sale_price: {
                gte: parsedPriceRange[0],
                lte: parsedPriceRange[1]
            },
            // starting_date:null
        }

        if(categories && (categories as string[]).length > 0) {
            filters.category = {
                in: Array.isArray(categories)? categories : String(categories).split(",")
            }
        }
         if(colors && (colors as string[]).length > 0){
            filters.colors = {
                hasSome: Array.isArray(colors) ? colors: [colors]
            }
        }
        if(sizes && (sizes as string[]).length > 0){
            filters.sizes = {
                hasSome: Array.isArray(sizes) ? sizes: [sizes]
            }
        }

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where: filters,
                skip, 
                take: parsedlimit,
                include: {
                    images: true,
                    Shop: true
                }
            }),prisma.products.count({where: filters})
        ])

        const totalPages = Math.ceil(total / parsedlimit)

        res.json({
            products, 
            pagination: {
                total, 
                page: parsedPage,
                totalPages,
            }
        })
    } catch (error) {
        next(error);
        
    }
}

//get filtered offers

export const getFilteredEvents = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            priceRange = [0, 10000],
            categories = [],
            colors = [],
            sizes = [],
            page = 1,
            limit =12,
        } = req.query;

        const parsedPriceRange = typeof priceRange === "string" ? priceRange.split(",").map(Number) : [0, 10000]
        const parsedPage = Number(page);
        const parsedlimit = Number(limit);

        const skip = (parsedPage - 1) *parsedlimit

        const filters: Record<string, any> = {
            sale_price: {
                gte: parsedPriceRange[0],
                lte: parsedPriceRange[1]
            },
            NOT: {
                starting_date:null
            }
            
        }

        if(categories && (categories as string[]).length > 0) {
            filters.category = {
                in: Array.isArray(categories)? categories : String(categories).split(",")
            }
        }

        if(colors && (colors as string[]).length > 0){
            filters.colors = {
                hasSome: Array.isArray(colors) ? colors: [colors]
            }
        }
        if(sizes && (sizes as string[]).length > 0){
            filters.sizes = {
                hasSome: Array.isArray(sizes) ? sizes: [sizes]
            }
        }

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where: filters,
                skip, 
                take: parsedlimit,
                include: {
                    images: true,
                    Shop: true
                }
            }),prisma.products.count({where: filters})
        ])

        const totalPages = Math.ceil(total / parsedlimit)

        res.json({
            products, 
            pagination: {
                total, 
                page: parsedPage,
                totalPages,
            }
        })
    } catch (error) {
        next(error);
        
    }
}




//get filtered shops 

export const getFilteredShops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      categories = [],
      countries = [],
      page = 1,
      limit = 22,
    } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories) ? categories : String(categories).split(","),
      };
    }

    if (countries && String(countries).length > 0) {
      // Ako nemaš polje 'country', ovo će opet praviti grešku – ukloni ili zameni sa 'address'
      filters.address = {
        contains: Array.isArray(countries) ? countries.join(', ') : String(countries),
      };
    }

    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        // ✅ Ukloni 'sellers' i 'products' – ne trebaju ti za listu
        include: {
          avatar: true, // ako želiš i avatar
        },
      }),
      prisma.shops.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      shops,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET FILTERED SHOPS ERROR:", error);
    next(error);
  }
};
//search products 

export const searchProducts = async (
    req:Request,
    res: Response,
    next:NextFunction
) => {
    try {
        const query = req.query.q as string;

        if(!query || query.trim().length === 0) {
            return res.status(400).json({message: "Search query is required"})
        }

        const products = await prisma.products.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains : query,
                            mode: "insensitive",
                        }
                    },
                    {
                        short_description: {
                            contains: query,
                            mode: "insensitive"
                        }
                    }
                ]
            },
            select: {
                id: true,
                title: true,
                slug: true,
                images: true,
                sale_price: true,
                regular_price: true
            },
            take: 10,
            orderBy: {
                createdAt: "desc",
            }
        })

        return res.status(200).json({products})
    } catch (error) {
        return next(error)

    }
}

// top shops

export const topShops = async (
    req:Request,
    res:Response,
    next: NextFunction
) => {
    try {
        const topShopsData = await prisma.orders.groupBy({
            by:["shopId"],
            _sum: {
                total:true
            },
            orderBy: {
                _sum: {
                    total: "desc",
                },
            },
            take:10,
        }) 

        const shopIds = topShopsData.map((item) => item.shopId)

        const shops = await prisma.shops.findMany({
            where: {
                id: {
                    in: shopIds,
                },
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                coverBanner: true,
                address: true,
                ratings: true,
                followers: true,
                category: true
            }
        })

        //merge sales with shop data
        const enrichedShops = shops.map((shop) => {
            const salesData = topShopsData.find((s) => s.shopId === shop.id)
            return{
                ...shop,
                totalSales: salesData?._sum.total ?? 0
            }
        })

        const top10Shops = enrichedShops.sort((a, b) => b.totalSales -a.totalSales).slice(0,10)
        return res.status(200).json({shops: top10Shops})

    } catch (error) {
        console.log("error fetching data top10shops", error)
        return next(error)
        
    }
}