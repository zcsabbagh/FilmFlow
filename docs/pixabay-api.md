# Pixabay API Documentation

Base URL: `https://pixabay.com/api/`
Video URL: `https://pixabay.com/api/videos/`
Rate limit: 100 requests per 60 seconds

## Image Search
GET `https://pixabay.com/api/?key=API_KEY&q=QUERY&image_type=photo&per_page=5`

Key response fields: id, tags, webformatURL, largeImageURL, imageWidth, imageHeight, user

## Video Search  
GET `https://pixabay.com/api/videos/?key=API_KEY&q=QUERY&per_page=5`

Key response fields: id, tags, duration, videos.large.url, videos.medium.url, user

## Categories
backgrounds, fashion, nature, science, education, feelings, health, people, religion, places, animals, industry, computer, food, sports, transportation, travel, buildings, business, music
