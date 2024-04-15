"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { auth } from "../../firebase";

type AppProviderProps = {
    children: ReactNode;
};

type AppContextType = {
    user: User | null;
    userId: string | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    selectedRoom: string | null;
    setSelectedRoom: React.Dispatch<React.SetStateAction<string | null>>;
};

const defaultContextData = {
    user: null,
    userId: null,
    setUser: () => {},
    selectedRoom: null,
    setSelectedRoom: () => {},
};

const AppContext = createContext<AppContextType>(defaultContextData);


export function AppProvider({ children }: AppProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

    // ログイン・ログアウトの状態管理
    useEffect(() => {
        // onAuthStateChangedは常に更新し続けるため購読解除のunsubscribeを追加
        const unsubscribe = onAuthStateChanged(auth, (newUser) => {
            setUser(newUser);+
            setUserId(newUser ? newUser.uid : null);
        });
        
        // アンマウントでonAuthStateChangedが停止。
        return () =>{
            unsubscribe();
        };

    }, []);

    return (
        <AppContext.Provider value={{ user, userId, setUser, selectedRoom, setSelectedRoom }}>
            {children}
        </AppContext.Provider>
    )
};

export function useAppContext() {
    return useContext(AppContext);
  }