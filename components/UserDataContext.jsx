import { createContext, useState } from 'react';

export const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userSummary, setUserSummary] = useState(null);
    const [gamesList, setGamesList] = useState([]);
    const [gameData, setGameData] = useState([]);
    const [totals, setTotals] = useState(null);
    const [playCount, setPlayCount] = useState(null);
    const [userConnections, setUserConnections] = useState(null);
    const [userExp, setUserExp] = useState(null);
    const [userBans, setUserBans] = useState(null);

    const contextValue = {
        isLoading, setIsLoading,
        userSummary, setUserSummary,
        gamesList, setGamesList,
        gameData, setGameData,
        totals, setTotals,
        playCount, setPlayCount,
        userConnections, setUserConnections,
        userExp, setUserExp,
        userBans, setUserBans
    };

    return (
        <UserDataContext.Provider value={contextValue}>
            {children}
        </UserDataContext.Provider>
    );
};