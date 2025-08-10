export type AppUser = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  profileImageUrl?: string;
  searchRadiusMeters: number;
  preferredLanguage: string;
  createdAt: string;
};