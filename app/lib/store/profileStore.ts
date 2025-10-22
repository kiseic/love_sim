import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProfileStore, ProfileData } from '../types/store';

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profileData: null,
      isGenerating: false, // 初期値はfalse
      setProfileData: (data: ProfileData) => set({ profileData: data }),
      clearProfileData: () => set({ profileData: null }),
      setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
    }),
    {
      name: 'profile-storage',
    }
  )
);
