# 🗺️ GPX Route Generator

A modern, feature-rich web application for creating and managing GPX routes. Perfect for runners, cyclists, and walkers who want to plan their activities with precision.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-lightgrey.svg)](https://flask.palletsprojects.com/)

![GPX Route Generator](https://img.shields.io/badge/Version-1.0.0-orange)

## ✨ Features

### 🎯 Core Features
- **Interactive Map** - Click to create route points, drag markers to adjust
- **Multiple Activity Types** - Running 🏃, Cycling 🚴, Walking 🚶
- **GPX Export** - Generate files compatible with Strava, Garmin, and other apps
- **Multi-Lap Support** - Create loop routes with multiple laps
- **Real-time Statistics** - Live distance and point count tracking
- **Location Search** - Built-in search to find locations easily

### ⭐ Favorite Routes
- **Save Templates** - Save your favorite routes for quick access
- **One-Click Load** - Instantly load saved routes with all settings
- **Route Management** - Add descriptions, view stats, and delete routes
- **Persistent Storage** - Routes saved in browser localStorage

### 🎨 Modern UI/UX
- **Beautiful Design** - Gradient backgrounds and card-based layout
- **Dark Mode** - Toggle between light and dark themes
- **Fully Responsive** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Polished interactions throughout
- **Intuitive Controls** - Easy-to-use interface

## 🚀 Quick Start

### Prerequisites
- Python 3.7 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- pip (Python package manager)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/gpx-route-generator.git
cd gpx-route-generator
```

2. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

3. **Start the backend server**
```bash
python server.py
```

The server will start on `http://127.0.0.1:5000`

4. **Open the application**
- Simply open `index.html` in your web browser
- Or serve it through a local web server

## 📖 How to Use

### Creating a Route

1. **Add Points** - Click on the map to add route points
2. **Adjust Route** - Drag markers to fine-tune your route
3. **Use Search** - Type location names in the search bar to find places
4. **Set Parameters** - Configure pace, activity type, and laps

### Configuring Settings

- **Pace**: Set your expected pace in minutes per kilometer
- **Activity Type**: Choose between Running, Cycling, or Walking
- **Laps**: Set number of laps (route will auto-close for loops)

### Saving Favorites

1. Click **"Save Current Route"**
2. Enter a name (e.g., "Morning Run at Park")
3. Add optional description
4. Click **"Save Route"**

### Loading Favorites

- Click on any saved route in the Favorites list
- Route will load automatically with all settings
- Map will zoom to fit the route

### Generating GPX

1. Create or load a route (minimum 2 points)
2. Configure your settings
3. Click **"Generate & Download GPX"**
4. File downloads automatically
5. Upload to your favorite fitness app!

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Modern semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **JavaScript (ES6+)** - Modern JS features
- **Leaflet.js** - Interactive maps
- **Leaflet GeoSearch** - Location search functionality
- **Google Fonts** - Inter font family

### Backend
- **Python 3** - Core language
- **Flask** - Lightweight web framework
- **Flask-CORS** - Cross-origin resource sharing
- **gpxpy** - GPX file generation library

## 📁 Project Structure

```
gpx-route-generator/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── app.js              # Frontend JavaScript logic
├── server.py           # Flask backend server
├── requirements.txt    # Python dependencies
├── .gitignore         # Git ignore rules
├── README.md          # This file
└── LICENSE            # MIT License
```

## 🎨 Features in Detail

### Interactive Mapping
- **OpenStreetMap** tiles for accurate mapping
- **Click to Add** points to your route
- **Drag to Edit** marker positions
- **Auto-routing** with polylines between points
- **Zoom & Pan** controls

### Favorites System
- **Unlimited Storage** - Save as many routes as you need
- **Rich Metadata** - Name, description, activity type, and stats
- **Quick Access** - One-click loading of saved routes
- **Easy Management** - Delete routes you no longer need

### Dark Mode
- **System Integration** - Remembers your preference
- **Full Coverage** - All UI elements adapt to dark theme
- **Map Adaptation** - Tile layer inverts for dark mode
- **Easy Toggle** - Switch themes with one click

### GPX Generation
- **Activity Support** - Running, cycling, walking activities
- **Time Calculation** - Based on your pace settings
- **Elevation Data** - Includes elevation (default: 700m for Bandung)
- **Multi-Lap** - Support for multiple laps with route closing
- **Point Interpolation** - Smooth tracking with 5m intervals

## 🌟 Tips & Best Practices

1. **Start with Search** - Use the search bar to quickly find your starting location
2. **Plan Loops** - Use the laps feature for circular routes that close automatically
3. **Save Variations** - Save different versions of popular routes
4. **Monitor Distance** - Check the distance display as you create your route
5. **Test Small First** - Create a short test route before planning long activities

## 🔧 Configuration

### Default Settings
- **Map Center**: Bandung, Indonesia (-6.9175, 107.6191)
- **Default Pace**: 6 min/km
- **Default Activity**: Running
- **Default Laps**: 1
- **Elevation**: 700m (Bandung average)

### Customization
You can modify these defaults in the respective files:
- Map settings: `app.js` (initMap function)
- UI styles: `styles.css` (CSS variables)
- Backend logic: `server.py`

## 🐛 Troubleshooting

### Backend Not Running
**Error**: "Failed to create GPX file. Make sure the backend server is running."

**Solution**: 
```bash
python server.py
```
Ensure the server is running on port 5000.

### Points Not Saving
**Issue**: Favorites not persisting between sessions.

**Solution**: Check browser localStorage is enabled and not full.

### Map Not Loading
**Issue**: Map tiles not displaying.

**Solution**: Check internet connection - tiles load from OpenStreetMap servers.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) - Map data
- [Leaflet](https://leafletjs.com/) - Interactive mapping library
- [Flask](https://flask.palletsprojects.com/) - Web framework
- [gpxpy](https://github.com/tkrajina/gpxpy) - GPX library

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/gpx-route-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gpx-route-generator/discussions)

## 🗺️ Roadmap

- [ ] Export to multiple formats (KML, GeoJSON)
- [ ] Import existing GPX files
- [ ] Route sharing via URL
- [ ] Elevation profile visualization
- [ ] Weather integration
- [ ] Social features

---

**Made with ❤️ for the running and cycling community**

⭐ Star this repo if you find it useful!