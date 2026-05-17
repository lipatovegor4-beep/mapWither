
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

// Расширяем статические данные городов параметрами ветра и облачности
const INITIAL_CITIES = [
  { id: '1', name: 'Москва', latitude: 55.7558, longitude: 37.6173, weather: '☀️', temp: '+22°C', wind: '🡦 3 м/с', cloudiness: 0.1 },
  { id: '2', name: 'Химки', latitude: 55.8941, longitude: 37.4440, weather: '☁️', temp: '+20°C', wind: '🡧 5 м/с', cloudiness: 0.7 },
  { id: '3', name: 'Подольск', latitude: 55.4312, longitude: 37.5458, weather: '🌧️', temp: '+17°C', wind: '🡥 8 м/с', cloudiness: 0.9 },
  { id: '4', name: 'Мытищи', latitude: 55.9114, longitude: 37.7308, weather: '☀️', temp: '+21°C', wind: '🡦 2 м/с', cloudiness: 0.2 },
  { id: '5', name: 'Люберцы', latitude: 55.6772, longitude: 37.8932, weather: '☁️', temp: '+19°C', wind: '🡪 4 м/с', cloudiness: 0.6 },
  { id: '6', name: 'Одинцово', latitude: 55.6789, longitude: 37.2831, weather: '❄️', temp: '+14°C', wind: '🡩 6 м/с', cloudiness: 0.8 },
];

export default function App() {
  const mapRef = useRef(null);
  const [cities, setCities] = useState(INITIAL_CITIES);
  
  // Состояния для управления слоями погодных данных
  const [layer, setLayer] = useState('temp'); // варианты: 'temp', 'wind', 'clouds'

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
          >
            {/* Динамический контейнер маркера, реагирующий на выбранный слой */}
            <View style={[
              styles.markerContainer, 
              layer === 'clouds' && { opacity: city.cloudiness >= 0.7 ? 1 : 0.4 } // Изменение прозрачности слоя облачности
            ]}>
              <Text style={styles.markerIcon}>{city.weather}</Text>
              
              {/* Рендеринг данных в зависимости от активного слоя */}
              {layer === 'temp' && (
                <Text style={styles.markerDataText}>{city.temp}</Text>
              )}
              {layer === 'wind' && (
                <Text style={[styles.markerDataText, { color: '#007AFF' }]}>{city.wind}</Text>
              )}
              {layer === 'clouds' && (
                <Text style={[styles.markerDataText, { color: '#666' }]}>{Math.round(city.cloudiness * 100)}%</Text>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.headerText}>Карта погоды (ИУК2-42Б)</Text>
      </View>

      {/* Вертикальная панель управления слоями погодных данных */}
      <View style={styles.layersPanel}>
        <Text style={styles.panelTitle}>Слои данных</Text>
        
        <TouchableOpacity 
          style={[styles.panelButton, layer === 'temp' && styles.activeButton]} 
          onPress={() => setLayer('temp')}
        >
          <Text style={[styles.buttonText, layer === 'temp' && styles.activeButtonText]}>Температура</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.panelButton, layer === 'wind' && styles.activeButton]} 
          onPress={() => setLayer('wind')}
        >
          <Text style={[styles.buttonText, layer === 'wind' && styles.activeButtonText]}>Ветер</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.panelButton, layer === 'clouds' && styles.activeButton]} 
          onPress={() => setLayer('clouds')}
        >
          <Text style={[styles.buttonText, layer === 'clouds' && styles.activeButtonText]}>Облачность</Text>
        </TouchableOpacity>
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
  
  // Стили для боковой панели слоев
  layersPanel: {
    position: 'absolute', top: 120, left: 15,
    backgroundColor: 'rgba(255,255,255,0.95)', padding: 10,
    borderRadius: 12, elevation: 5, width: 120
  },
  panelTitle: { fontSize: 11, fontWeight: 'bold', color: '#555', marginBottom: 8, textAlign: 'center'