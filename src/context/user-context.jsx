/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { createContext, useState, useContext, useEffect } from "react";
import { getCurrentUser, getStoredToken, setAuthToken } from "../api/auth.jsx";
import { getUsers } from "../api/message-api.jsx";

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState(() => getStoredToken());
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateAuth = async () => {
            // Even if there's no token in localStorage, we should still try to validate
            // authentication using cookies that might be present
            try {
                console.log('Attempting to validate authentication with cookies...');
                const response = await getCurrentUser();
                
                if (response.success) {
                    console.log('Authentication successful via cookies');
                    // If we get a successful response, the cookie is valid
                    setUser(response.data.user);
                    
                    // If we got a token in the response, store it
                    if (response.data.token) {
                        setToken(response.data.token);
                        setAuthToken(response.data.token);
                    } else {
                        // Otherwise use the stored token if available
                        const storedToken = getStoredToken();
                        if (storedToken) {
                            setToken(storedToken);
                        }
                    }
                } else if (response.code === 401) {
                    console.log("Authentication failed: Unauthorized");
                    // Clear user data on 401 Unauthorized
                    handleLogout();
                }
            } catch (error) {
                console.error("Auth validation failed:", error);
                // On error, we don't automatically logout - the cookie might still be valid
                // but there could be a network error or other issue
            } finally {
                setLoading(false);
            }
        };

        validateAuth();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!token) return;

            try {
                const response = await getUsers();
                if (response.success) {
                    setUsers(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        if (token) {
            fetchUsers();
        }
    }, [token]);

    const login = (userData, authToken) => {        
        setUser(userData);
        setToken(authToken);
        setAuthToken(authToken); 
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        setToken(null);
        setUsers([]);
        setAuthToken(null);
        localStorage.removeItem("user");
    };

    const logout = async () => {
        if (token) {
            try {
                const response = await import("../api/auth.jsx").then(module => module.logout(token));
                if (response.success) {
                    handleLogout();
                }
            } catch (error) {
                console.error("Logout failed:", error);
                handleLogout();
            }
        } else {
            handleLogout();
        }
    };

    const updateUser = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem("user", JSON.stringify(newUserData));
    };
    
    const value = {
        user,
        token,
        users,
        loading,
        login,
        logout,
        updateUser
    };

    return (
        <UserContext.Provider value={value}>
            {!loading && children}
        </UserContext.Provider>
    );
};
