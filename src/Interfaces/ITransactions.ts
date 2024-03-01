export interface Transctions {
  id: string;
  accountId: string;
  amount: {
    currencyCode: string;
    value: {
      scale: string;
      unscaledValue: string;
    };
  };
  categories: {
    pfm: {
      id: string;
      name: string;
    };
  };
  dates: {
    booked: string;
    value: string;
  };
  descriptions: {
    display: string;
    original: string;
  };
  merchantInformation?: {
    merchantCategoryCode?: string;
    merchantName?: string;
  };
  providerMutability: string;
  reference: string;
  status: string;
  types: {
    financialInstitutionTypeCode?: string;
    type: string;
  };
}
