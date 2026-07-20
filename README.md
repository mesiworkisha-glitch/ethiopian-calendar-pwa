# Ethiopian Calendar & Bahire Hasab PWA 🇪🇹 📅

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

A comprehensive, fully offline-capable Progressive Web App (PWA) designed to provide accurate Ethiopian calendar calculations, Bahire Hasab (computus), holiday tracking, and complex date conversions. Built with a strong focus on accessibility and multi-language support.

**[🚀 View Live Demo Here](https://mesiworkisha-glitch.github.io/ethiopian-calendar-pwa/)*
   
---

## 🌟 Key Features

The application is divided into several powerful modules, accessible via a seamless tabbed interface:

*   **📅 Today's Full Details (ዛሬ):**
    *   Displays the current date across Ethiopian, Gregorian, Julian, Hebrew, and Tabular Hijri calendars.
    *   Calculates and displays detailed Bahire Hasab metrics (Medeb, Wenber, Abekte, Metqe, Tinte Qemer, Mebaja Hamer, and Wengelawi/Evangelist).
    *   Shows the current Liturgical and Climatic seasons, alongside active fasting periods (with progress tracking).
    *   Provides live moon phase calculations, Addis Ababa sunrise/sunset times, Zodiac signs, and Awde Negest signs.
    *   Highlights upcoming movable feasts, national holidays, and daily Ethiopian Orthodox Synaxarium (ስንክሳር) entries.
*   **🎉 National Holidays (ብሔራዊ በዓላት):**
    *   Lists all national holidays and memorial days for the current Ethiopian year, cross-referenced with exact Gregorian dates and weekdays.
*   **🌙 Islamic Calendar (ሂጅሪ አቆጣጠር):**
    *   Displays the current date in the Tabular Hijri calendar.
    *   Highlights major Islamic events (e.g., Ramadan, Eid al-Fitr, Eid al-Adha, Ashura, Mawlid) for the current year.
*   **🔄 Date Converter & Search (ቀን መፈለጊያና መቀየሪያ):**
    *   Robust two-way conversion between **Ethiopian, Gregorian, Julian, Hebrew, and Hijri** calendars.
    *   Supports flexible queries: search by specific year, month, or an exact full date.
*   **📖 Synaxarium Search (በስንክሳር ውስጥ ፍለጋ):**
    *   An offline search engine for the Ethiopian Orthodox Synaxarium.
    *   Query specific Saints or Feasts in Amharic (e.g., "ሚካኤል") to find their exact commemoration dates.
*   **🩸 Menstrual Cycle Tracker (የወር አበባ ዑደት):**
    *   A localized health tool allowing users to track their menstrual cycle purely using the Ethiopian calendar.
    *   Calculates the estimated next period date and days remaining based on user-defined parameters.
*   **⏳ Exact Age Calculator (ዕድሜ ማስያ):**
    *   Calculates precise age in years, months, and days based on an Ethiopian birthdate, along with total days lived.
*   **👶 Pregnancy & Due Date Calculator (የእርግዝና ጊዜ መገመቻ):**
    *   Calculates the Expected Due Date (EDD) based on the Last Menstrual Period (LMP) entered in the Ethiopian calendar. Provides gestational age and current trimester.

## 🛠️ Additional Functionalities

*   **Multi-Language Support:** Instantly toggle between Amharic (አማርኛ), English, Afaan Oromoo, and Tigrinya (ትግርኛ).
*   **Ge'ez Numerals Toggle:** Switch between standard Arabic numerals (1, 2, 3) and traditional Ge'ez numerals (፩, ፪, ፫) throughout the app.
*   **Dark Mode:** Built-in theme toggle for comfortable nighttime viewing.
*   **Live Clock:** Displays real-time Ethiopian time, dynamically converting standard time into the traditional 12-hour cycle (Day/Night) and displaying traditional time units (Kekros/Kaelit).
*   **Accessibility First:** Fully optimized for screen readers with proper ARIA labels, semantic HTML, and dynamic status announcers for visually impaired users.

## 💻 Technology Stack

*   **Frontend:** Pure HTML5, CSS3, and Vanilla JavaScript (No heavy frameworks or external dependencies).
*   **PWA:** Utilizes a Service Worker (`sw.js`) and Web App Manifest (`manifest.json`) for full offline capabilities and installability on desktop and mobile devices.
*   **Data Handling:** Uses `localStorage` to securely save user preferences and tracker data locally on the client side.
*   **SEO/SMO:** Implements `schema.org` structured data (JSON-LD) and full Open Graph/Twitter Card meta tags for rich social sharing.

## 🚀 Local Installation & Setup

Because this project uses vanilla web technologies, setup is incredibly straightforward.

1. **Clone the repository:**
   ```bash
git clone [https://github.com/mesiworkisha-glitch/ethiopian-calendar-pwa.git)                
