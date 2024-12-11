const JSONBIN_API_KEY = "$2a$10$8jbqDqWs51Nhc35tki/v1.YdUelR.yU.CwO26JgH7Eb2dyJU01EJi";
const BIN_ID = "67590f18acd3cb34a8b796e5";

// Save user data to JSONBin
export const saveToJsonBin = async (username, data) => {
  try {
    const existingData = await loadAllData();
    const updatedData = {
      ...existingData,
      [username]: {
        watchlist:
          data.watchlist?.map((m) => ({
            imdbID: m.imdbID,
            title: m.title,
            addedAt: m.addedAt || Date.now(),
          })) || [],
        seenMovies:
          data.seenMovies?.map((m) => ({
            imdbID: m.imdbID,
            title: m.title,
            addedAt: m.addedAt || Date.now(),
          })) || [],
        ratings: data.ratings || {},
        lastUpdated: Date.now(),
      },
    };

    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      console.error("Failed to save data:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving to JSONBin:", error);
    return null;
  }
};

// Load data for a specific user
export const loadFromJsonBin = async (username) => {
  try {
    const allData = await loadAllData();
    const userData = allData[username];

    if (!userData) {
      return {
        watchlist: [],
        seenMovies: [],
        ratings: {},
        lastUpdated: null,
      };
    }

    return {
      watchlist: userData.watchlist || [],
      seenMovies: userData.seenMovies || [],
      ratings: userData.ratings || {},
      lastUpdated: userData.lastUpdated || null,
    };
  } catch (error) {
    console.error("Error loading from JSONBin:", error);
    return {
      watchlist: [],
      seenMovies: [],
      ratings: {},
      lastUpdated: null,
    };
  }
};

// Helper function to load all data from JSONBin
export const loadAllData = async () => {
  try {
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
      {
        headers: {
          "X-Master-Key": JSONBIN_API_KEY,
        },
      },
    );

    if (!response.ok) {
      console.error("Failed to load data:", response.statusText);
      return {};
    }

    const data = await response.json();
    return data.record || {};
  } catch (error) {
    console.error("Error loading all data from JSONBin:", error);
    return {};
  }
};

// Check if username exists
export const checkUsername = async (username) => {
  try {
    const allData = await loadAllData();
    return {
      exists: !!allData[username],
      lastUpdated: allData[username]?.lastUpdated || null,
    };
  } catch (error) {
    console.error("Error checking username:", error);
    return { exists: false, lastUpdated: null };
  }
};

// Delete user data
export const deleteUserData = async (username) => {
  try {
    const allData = await loadAllData();

    if (allData[username]) {
      delete allData[username];

      const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_API_KEY,
        },
        body: JSON.stringify(allData),
      });

      if (!response.ok) {
        console.error("Failed to delete data:", response.statusText);
        return null;
      }

      return await response.json();
    }

    return null;
  } catch (error) {
    console.error("Error deleting user data:", error);
    return null;
  }
};

// Update user ratings
export const updateUserRating = async (username, imdbID, rating) => {
  try {
    const userData = await loadFromJsonBin(username);

    const updatedData = {
      ...userData,
      ratings: {
        ...userData.ratings,
        [imdbID]: rating,
      },
      lastUpdated: Date.now(),
    };

    await saveToJsonBin(username, updatedData);
    return updatedData;
  } catch (error) {
    console.error("Error updating rating:", error);
    return null;
  }
};

// Get all usernames
export const getAllUsernames = async () => {
  try {
    const allData = await loadAllData();
    return Object.keys(allData).map((username) => ({
      username,
      lastUpdated: allData[username].lastUpdated || null,
    }));
  } catch (error) {
    console.error("Error getting usernames:", error);
    return [];
  }
};

// Backup user data
export const backupUserData = async (username) => {
  try {
    const userData = await loadFromJsonBin(username);
    return {
      ...userData,
      backupDate: Date.now(),
    };
  } catch (error) {
    console.error("Error backing up user data:", error);
    return null;
  }
};

// Restore user data from backup
export const restoreUserData = async (username, backupData) => {
  try {
    await saveToJsonBin(username, {
      ...backupData,
      lastUpdated: Date.now(),
    });
    return await loadFromJsonBin(username);
  } catch (error) {
    console.error("Error restoring user data:", error);
    return null;
  }
};
