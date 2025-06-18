# Smart News Feed App


## Features

### Core Functionality
- Fetches articles from [NewsAPI](https://newsapi.org/)
- Displays articles in a FlatList with:
- Infinite scroll (pagination-ready)
- Pull-to-refresh support
- Offline support using `AsyncStorage`
- When offline: Loads cached articles
- Handles API failures and shows offline messages

### 🔍 Bonus Features
- Debounced **real-time search**
- **Skeleton loader** during article loading
- Swipe gestures using `react-native-gesture-handler`
- Swipe right: 👍 Like
- Swipe left: 🔖 Bookmark

---

##  Tech Stack

- React Native
- Axios
- AsyncStorage
- FlatList
- React Native Gesture Handler
- NetInfo

---



## Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/Hemantsinghs9551/Demo_News_Feed.git
cd smart-news-feed
npm install
npx react-native run-android
``
