import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import { recommendProducts } from "../services/recommendationService";

export const getRecommendedProducts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    console.log("🔍 User ID:", userId);

    const products = await prisma.products.findMany({
      include: { images: true, Shop: true },
    });
    console.log(`📦 Ukupno proizvoda: ${products.length}`);

    let userAnalytics = await prisma.userAnalytics.findUnique({
      where: { userId },
      select: { actions: true, recommendations: true, lastTrained: true },
    });
 

    const now = new Date();
    let recommendedProducts = [];

    if (!userAnalytics) {
      console.log("⚠️ Nema userAnalytics – vraćam zadnjih 10.");
      recommendedProducts = products.slice(-10);
    } else {
      const actions = Array.isArray(userAnalytics.actions) ? userAnalytics.actions : [];
      let recommendations = Array.isArray(userAnalytics.recommendations) ? userAnalytics.recommendations : [];
      // Filtriraj undefined i null
      recommendations = recommendations.filter(id => id && typeof id === 'string' && id.length > 0);

      const lastTrainedTime = userAnalytics.lastTrained ? new Date(userAnalytics.lastTrained) : null;
      const hoursDiff = lastTrainedTime ? (now.getTime() - lastTrainedTime.getTime()) / (1000 * 60 * 60) : Infinity;

      console.log(`📊 Broj akcija: ${actions.length}`);
      console.log(`📋 Čiste preporuke:`, recommendations);
      console.log(`🕐 Zadnji trening: ${lastTrainedTime?.toISOString() || 'Nema'}, sati: ${hoursDiff.toFixed(2)}`);

      if (actions.length < 50) {
        console.log(`➡️ Manje od 50 akcija (${actions.length}) – vraćam zadnjih 10.`);
        recommendedProducts = products.slice(-10);
      } else if (hoursDiff < 3 && recommendations.length > 0) {
        console.log(`✅ Koristim keš (manje od 3 sata), broj keširanih: ${recommendations.length}`);
        recommendedProducts = products.filter(p => recommendations.includes(p.id));
        console.log(`🔢 Pronađeno u bazi: ${recommendedProducts.length}`);
      } else {
        console.log(`🔄 Pokrećem model...`);
        const recommendedIds = await recommendProducts(userId, products);
        console.log(`🧠 Model vratio:`, recommendedIds);
        const validIds = recommendedIds.filter(id => id && typeof id === 'string' && id.length > 0);
        console.log(`✅ Validnih ID-ova: ${validIds.length}`);

        recommendedProducts = products.filter(p => validIds.includes(p.id));
        console.log(`📌 Filtriranih proizvoda: ${recommendedProducts.length}`);

        await prisma.userAnalytics.update({
          where: { userId },
          data: {
            recommendations: validIds,
            lastTrained: now,
          },
        });
        console.log(`💾 Spremljeno ${validIds.length} preporuka.`);
      }
    }

    console.log(`🏁 Konačan broj preporuka: ${recommendedProducts.length}`);
    res.status(200).json({
      success: true,
      recommendations: recommendedProducts,
    });
  } catch (error) {
    console.error("❌ Greška:", error);
    return next(error);
  }
};