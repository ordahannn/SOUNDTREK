// Landmark type (based on server structure)
export type WikipediaLandmark = {
    title: string;
    pageId: string;
    lat: number;
    lon: number;
    imageUrl?: string; 
    shortDescription?: string;
};

export type LandmarkToCard = {
  pageId: string;
  title: string;
  lat: number;
  lon: number;
  imageUrl: string;
  shortDescription: string;
  categories: {
    categoryId: number;
    categoryName: string;
  }[];
  interests: {
    interestId: number;
    interestName: string;
  }[];
  mainCategories: {
    mainCategoryId: number;
    mainCategoryName: string;
  }[];
};