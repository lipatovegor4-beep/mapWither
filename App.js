
import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MOSCOW_REGION = {
  latitude: 55.7558,
  longitude: 37.6173,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

const OVERVIEW_REGION = {
  latitude: 55.7558,
  longitude: 37.6173,
  latitudeDelta: 3.5,
  longitudeDelta: 3.5,
};

const INITIAL_CITIES = [
  { id: '1', name: 'Москва', latitude: 55.7558, longitude: 37.6173, weather: '☀️', temp: '+22°C' },
  { id: '2', name: 'Химки', latitude: 55.8941, longitude: 37.4440, weather: '☁️', temp: '+20°C' },
  { id: '3', name: 'Подольск', latitude: 55.4312, longitude: 37.5458, weather: '🌧️', temp: '+17°C' },
  { id: '4', name: 'Мытищи', latitude: 55.9114, longitude: 37.7308, weather: '☀️', temp: '+21°C' },
  { id: '5', name: 'Люберцы', latitude: 55.6772, longitude: 37.8932, weather: '☁️', temp: '+19°C' },
  { id: '6', name: 'Одинцово', latitude: 55.6789, longitude: 37.2831, weather: '❄️', temp: '+14°C' },
];

export default function App() {
  const mapRef = useRef(null);
  const [cities, setCities] = useState(INITIAL_CITIES);
  const [showTemperature, setShowTemperature] = useState(true);

  const goToCenter = () => {
    mapRef.current?.animateToRegion(MOSCOW_REGION, 1000);
  };

  const showAllMarkers = () => {
    mapRef.current?.animateToRegion(OVERVIEW_REGION, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={MOSCOW_REGION}>
        {cities.map(city => (
          <Marker
            key={city.id}
            coordinate={{ latitude: city.latitude, longitude: city.longitude }}
            title={city.name}
            description={`Погода: ${city.weather} Темп: ${city.temp}`}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerIcon}>{city.weather}</Text>
              {showTemperature && <Text style={styles.markerTemp}>{city.temp}</Text>}
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.headerText}>Карта погоды (ИУК2-42Б)</Text>
      </View>

      <View style={styles.navigationPanel}>
        <TouchableOpacity style={styles.navButton} onPress={goToCenter}>
          <Text style={styles.navButtonText}>📍 Центр</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={showAllMarkers}>
          <Text style={styles.navButtonText}>🌍 Все города</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { ...StyleSheet.absoluteFillObject },
  header: {
    position: 'absolute', top: 50, alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 8, paddingHorizontal: 20,
    borderRadius: 20, elevation: 4
  },
  headerText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  navigationPanel: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
    flexDirection: 'row', justifyContent: 'space-between'
  },
  navButton: { backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 25, flex: 0.48, alignItems: 'center', elevation: 4 },
  navButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  markerContainer: { backgroundColor: 'rgba(255,255,255,0.9)', padding: 5, borderRadius: 8, borderWidth: 1, borderColor: '#007AFF', alignItems: 'center', width: 50 },
  markerIcon: { fontSize: 18 },
  markerTemp: { fontSize: 10, fontWeight: 'bold', color: '#333', marginTop: 2 }
});