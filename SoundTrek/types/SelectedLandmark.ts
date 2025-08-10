export type SelectedLandmark = {
  pageId: string;
  title: string;
  lat: number;
  lon: number;
  imageUrl?: string;
  shortDescription?: string;
  fullDescription?: string;  
  selectedLanguage?: string; 
  selectedLanguageCode?: string;
  selectedGenre?: string;    
  processedText?: string;   
  listened?: boolean; // For the routes
};

export type RecommendedLandmark = {
    title: string;
    pageId: string;
    lat: number;
    lon: number;
    imageUrl: string;
    shortDescription: string;
    mainCategories: {
      mainCategoryId: number;
      mainCategoryName: string;
    }[];
    categories: {
      categoryId: number;
      categoryName: string;
    }[];
    interests: {
      interestId: number;
      interestName: string;
    }[];
      listened?: boolean; // For the routes
  };


