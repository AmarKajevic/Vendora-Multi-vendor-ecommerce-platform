import {create} from "zustand";

type AuhtState = {
    isLoggedIn: boolean;
    setLoggedIn: (value: boolean) => void;

}


export const useAuthStore = create<AuhtState>((set ) => ({
    isLoggedIn: true,
    setLoggedIn: (value) => set({isLoggedIn: value})
}))