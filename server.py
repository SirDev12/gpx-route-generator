"""
GPX Route Generator - Backend Server
Generates GPX files from route coordinates with activity data
"""

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import gpxpy
import gpxpy.gpx
from datetime import datetime, timedelta
from io import BytesIO
import math

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two coordinates using Haversine formula
    Returns distance in meters
    """
    R = 6371000  # Earth radius in meters
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat / 2) ** 2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * 
         math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def interpolate_points(points, target_interval=5):
    """
    Interpolate points to have consistent spacing
    Target interval in meters
    """
    if len(points) < 2:
        return points
    
    interpolated = [points[0]]
    
    for i in range(len(points) - 1):
        p1 = points[i]
        p2 = points[i + 1]
        
        distance = calculate_distance(p1['lat'], p1['lon'], p2['lat'], p2['lon'])
        num_segments = max(1, int(distance / target_interval))
        
        for j in range(1, num_segments):
            ratio = j / num_segments
            interpolated_point = {
                'lat': p1['lat'] + (p2['lat'] - p1['lat']) * ratio,
                'lon': p1['lon'] + (p2['lon'] - p1['lon']) * ratio
            }
            interpolated.append(interpolated_point)
        
        interpolated.append(p2)
    
    return interpolated


@app.route('/generate_gpx', methods=['POST'])
def generate_gpx():
    """
    Generate GPX file from route data
    
    Expected JSON payload:
    {
        "points": [{"lat": float, "lon": float}, ...],
        "pace_minutes": float,
        "activity_type": str,
        "laps": int
    }
    """
    try:
        data = request.json
        
        # Validate input
        if not data or 'points' not in data:
            return jsonify({'error': 'No points provided'}), 400
        
        points = data['points']
        pace_minutes = data.get('pace_minutes', 6)
        activity_type = data.get('activity_type', 'Run')
        laps = data.get('laps', 1)
        
        if len(points) < 2:
            return jsonify({'error': 'At least 2 points required'}), 400
        
        # Create GPX object
        gpx = gpxpy.gpx.GPX()
        gpx.creator = "GPX Route Generator - Bandung Edition"
        
        # Create track
        gpx_track = gpxpy.gpx.GPXTrack()
        gpx_track.name = f"{activity_type} Activity"
        gpx_track.type = activity_type
        gpx.tracks.append(gpx_track)
        
        # Process laps
        for lap in range(laps):
            # Create segment for this lap
            gpx_segment = gpxpy.gpx.GPXTrackSegment()
            gpx_track.segments.append(gpx_segment)
            
            # Use original points for first lap, or close the loop for subsequent laps
            lap_points = points.copy()
            if lap > 0 or laps > 1:
                # Close the loop by adding first point at the end
                if lap_points[0] != lap_points[-1]:
                    lap_points.append(lap_points[0])
            
            # Interpolate points for smooth tracking
            interpolated_points = interpolate_points(lap_points, target_interval=5)
            
            # Calculate total distance for time calculation
            total_distance = 0
            for i in range(1, len(interpolated_points)):
                p1 = interpolated_points[i - 1]
                p2 = interpolated_points[i]
                total_distance += calculate_distance(p1['lat'], p1['lon'], p2['lat'], p2['lon'])
            
            # Calculate time per point based on pace
            pace_seconds_per_meter = (pace_minutes * 60) / 1000
            total_time_seconds = total_distance * pace_seconds_per_meter
            time_per_segment = total_time_seconds / max(1, len(interpolated_points) - 1)
            
            # Start time (offset by lap)
            start_time = datetime.now() + timedelta(seconds=lap * total_time_seconds)
            current_time = start_time
            
            # Add points to segment
            for i, point in enumerate(interpolated_points):
                gpx_point = gpxpy.gpx.GPXTrackPoint(
                    latitude=point['lat'],
                    longitude=point['lon'],
                    elevation=700,  # Default elevation for Bandung (~700m)
                    time=current_time
                )
                gpx_segment.points.append(gpx_point)
                
                # Increment time for next point
                if i < len(interpolated_points) - 1:
                    current_time += timedelta(seconds=time_per_segment)
        
        # Convert GPX to XML string
        gpx_xml = gpx.to_xml()
        
        # Create BytesIO object to send file
        gpx_bytes = BytesIO(gpx_xml.encode('utf-8'))
        gpx_bytes.seek(0)
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'route_{activity_type.lower()}_{timestamp}.gpx'
        
        return send_file(
            gpx_bytes,
            mimetype='application/gpx+xml',
            as_attachment=True,
            download_name=filename
        )
    
    except Exception as e:
        print(f"Error generating GPX: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'GPX Route Generator',
        'version': '1.0.0'
    })


if __name__ == '__main__':
    print("=" * 50)
    print("GPX Route Generator - Backend Server")
    print("=" * 50)
    print("Server running on: http://127.0.0.1:5000")
    print("Health check: http://127.0.0.1:5000/health")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    app.run(debug=True, host='127.0.0.1', port=5000)