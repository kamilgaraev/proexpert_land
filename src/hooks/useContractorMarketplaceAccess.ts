import { useCanAccess } from '@/hooks/usePermissions';

export const useContractorMarketplaceAccess = () => {
  const hasModule = useCanAccess({ module: 'contractor-portal' });
  const hasCategoriesPermission = useCanAccess({ permission: 'contractor_marketplace.categories.view' });
  const hasSearchPermission = useCanAccess({ permission: 'contractor_marketplace.search.view' });
  const hasProfilePermission = useCanAccess({ permission: 'contractor_marketplace.profile.view' });
  const hasOffersPermission = useCanAccess({ permission: 'contractor_marketplace.offers.view' });
  const hasCreateOfferPermission = useCanAccess({ permission: 'contractor_marketplace.offers.create' });
  const hasCancelOfferPermission = useCanAccess({ permission: 'contractor_marketplace.offers.cancel' });
  const hasReviewOfferPermission = useCanAccess({ permission: 'contractor_marketplace.offers.review' });

  const canSearchContractors = hasModule && hasSearchPermission;
  const canViewProfile = hasModule && hasProfilePermission;
  const canViewOffers = hasModule && hasOffersPermission;

  return {
    canUseMarketplace: canSearchContractors || canViewProfile || canViewOffers,
    canViewCategories: hasModule && hasCategoriesPermission,
    canSearchContractors,
    canViewProfile,
    canViewOffers,
    canCreateOffer: hasModule && hasCreateOfferPermission,
    canCancelOffer: hasModule && hasCancelOfferPermission,
    canReviewOffer: hasModule && hasReviewOfferPermission,
  };
};
