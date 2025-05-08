/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { createContext, useState, useContext, useEffect } from "react";
import { getCurrentUser, getStoredToken, setAuthToken, isUserLoggedIn } from "../api/auth.jsx";
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
            // Check if the user is logged in based on our persistent flag
            const loggedIn = isUserLoggedIn();
            const storedUser = localStorage.getItem("user");
            
            // If we have a stored user and the logged in flag is set, use that immediately
            // to prevent flashing of login screen
            if (loggedIn && storedUser) {
                setUser(JSON.parse(storedUser));
                const storedToken = getStoredToken();
                if (storedToken) {
                    setToken(storedToken);
                }
            }
            
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
                        localStorage.setItem("user", JSON.stringify(response.data.user));
                    } else {
                        // Otherwise use the stored token if available
                        const storedToken = getStoredToken();
                        if (storedToken) {
                            setToken(storedToken);
                        }
                    }
                } else if (response.code === 401 && !loggedIn) {
                    // Only clear user data on explicit 401 Unauthorized and if not already logged in
                    console.log("Authentication failed: Unauthorized");
                    handleLogout();
                }
            } catch (error) {
                console.error("Auth validation failed:", error);
                // On error, we don't automatically logout if we already have a user
                if (!storedUser || !loggedIn) {
                    console.log("No stored user data or not logged in, redirecting to login");
                    handleLogout();
                } else {
                    console.log("Using stored user data due to validation error");
                }
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
