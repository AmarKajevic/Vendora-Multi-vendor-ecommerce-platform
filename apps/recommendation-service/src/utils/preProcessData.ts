// apps/recommendation-service/src/utils/preProcessData.ts
import { products } from "@prisma/client";

export const preProcessData = (userActions: any[], userId: string, allProducts: any[]) => {


  const interactions: any[] = [];

  userActions.forEach((action: any) => {

    if (!action.productId || !action.action) {
      return;
    }

    interactions.push({
      userId: userId,
      productId: action.productId,
      actionType: action.action,
    });
  });



  return { interactions, products: allProducts };
};