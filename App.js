
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
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
  { id: '1', name: 'Москва', latitude: 55.7558, longitude: 37.6173, weather: '☀️', temp: '--', wind: '--', cloudiness: 0 },
  { id: '2', name: 'Химки', latitude: 55.8941, longitude: 37.4440, weather: '☀️', temp: '--', wind: '--', cloudiness: 0 },
  { id: '3', name: 'Подольск', latitude: 55.4312, longitude: 37.5458, weather: '☀️', temp: '--', wind: '--', cloudiness: 0 },
  { id: '4', name: 'Мытищи', latitude: 55.9114, longitude: 37.7308, weather: '☀️', temp: '--', wind: '--', cloudiness: 0 },
  { id: '5', name: 'Люберцы', latitude: 55.6772, longitude: 37.8932, weather: '☀️', temp: '--', wind: '--', cloudiness: 0 },
  { id: '6', name: 'Одинцово', latitude: 55.6789, longitude: 37.2831, weather: '☀️', temp: '--', wind: '--', cloudiness: 0 },
];

export default function App() {
  const mapRef = useRef(null);
  const [cities, setCities] = useState(INITIAL_CITIES);
  const [layer, setLayer] = useState('temp');
  const [loading, setLoading] = useState(false);

  // Автоматически загружаем погоду при старте
  useEffect(() => {
    fetchWeatherData();
  }, []);

  // Функция преобразования кода погоды WMO в эмодзи
  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '☁️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    return '⛈️';
  };

  // Асинхронный запрос к внешнему API Open-Meteo
  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const updatedCities = await Promise.all(
        cities.map(async (city) => {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code,wind_speed_10m,cloud_cover&wind_speed_unit=ms`;
          const response = await fetch(url);
          const data = await response.json();
          
          return {
            ...city,
            temp: `${Math.round(data.current.temperature_2m)}°C`,
            weather: getWeatherIcon(data.current.weather_code),
            wind: `🡪 ${Math.round(data.current.wind_speed_10m)} м/с`,
            cloudiness: data.current.cloud_cover / 100, // переводим в диапазон от 0 до 1 для opacity
          };
        })
      );
      setCities(updatedCities);
    } catch (error) {
      console.error("Ошибка сети при получении погоды:", error);
    } finally {
      setLoading(false);
    }
  };

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
            <View style={[
              styles.markerContainer, 
              layer === 'clouds' && { opacity: city.cloudiness >= 0.5 ? 1 : 0.4 }
            ]}>
              <Text style={styles.markerIcon}>{city.weather}</Text>
              {layer === 'temp' && <Text style={styles.markerDataText}>{city.temp}</Text>}
              {layer === 'wind' && <Text style={[styles.markerDataText, { color: '#007AFF' }]}>{city.wind}</Text>}
              {layer === 'clouds' && <Text style={[styles.markerDataText, { color: '#666' }]}>{Math.round(city.cloudiness * 100)}%</Text>}
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.headerText}>Карта погоды (ИУК2-42Б)</Text>
      </View>

      {/* Индикатор загрузки сети */}
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}

      {/* Кнопка обновления API */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchWeatherData}>
        <Text style={styles.refreshButtonText}>🔄 Обновить</Text>
      </TouchableOpacity>

      <View style={styles.layersPanel}>
        <Text style={styles.panelTitle}>Слои данных</Text>
        <TouchableOpacity style={[styles.panelButton, layer === 'temp' && styles.activeButton]} onPress={() => setLayer('temp')}>
          <Text style={[styles.buttonText, layer === 'temp' && styles.activeButtonText]}>Температура</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.panelButton, layer === 'wind' && styles.activeButton]} onPress={() => setLayer('wind')}>
          <Text style={[styles.buttonText, layer === 'wind' && styles.activeButtonText]}>Ветер</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.panelButton, layer === 'clouds' && styles.activeButton]} onPress={() => setLayer('clouds')}>
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
  
  refreshButton: {
    position: 'absolute', top: 50, right: 15,
    backgroundColor: '#fff', padding: 8, borderRadius: 10, elevation: 4
  },
  refreshButtonText: { fontSize: 12, fontWeight: 'bold', color: '#007AFF' },
  loader: { position: 'absolute', top: 58, right: 105, backgroundColor: 'white', padding: 4, borderRadius: 50 },

  layersPanel: {
    position: 'absolute', top: 120, left: 15,
    backgroundColor: 'rgba(255,255,255,0.95)', padding: 10,
    borderRadius: 12, elevation: 5, width: 120
  },
  panelTitle: { fontSize: 11, fontWeight: 'bold', color: '#555', marginBottom: 8, textAlign: 'center' },
  panelButton: { backgroundColor: '#f0f0f0', paddingVertical: 8, borderRadius: 6, marginBottom: 6, alignItems: 'center' },
  activeButton: { backgroundColor: '#007AFF' },
  buttonText: { fontSize: 11, fontWeight: '600', color: '#333' },
  activeButtonText: { color: '#fff' },

  navigationPanel: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
    flexDirection: 'row', justifyContent: 'space-between'
  },
  navButton: { backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 25, flex: 0.48, alignItems: 'center', elevation: 4 },
  navButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  markerContainer: { backgroundColor: 'rgba(255,255,255,0.95)', padding: 5, borderRadius: 8, borderWidth: 1, borderColor: '#007AFF', alignItems: 'center', width: 55 },
  markerIcon: { fontSize: 18 },
  markerDataText: { fontSize: 10, fontWeight: 'bold', color: '#222', marginTop: 2 }
});