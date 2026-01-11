// lib/authStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "auth_user";

export const saveUser = async (user: any) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = async () => {
    const value = await AsyncStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
};

export const clearUser = async () => {
    await AsyncStorage.removeItem(USER_KEY);
};
