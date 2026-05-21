import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

const API_KEY = '4c455ade3962863e890c1a5bafbff65f';

const MOSCOW_REGION = {
  latitude: 55.7558,
  longitude: 37.6173,
  latitudeDelta: 0.9,
  longitudeDelta: 0.9,
};

const OVERVIEW_REGION = {
  latitude: 55.2,
  longitude: 37.0,
  latitudeDelta: 3.5,
  longitudeDelta: 3.5,
};

const INITIAL_CITIES = [
  { id: '1', name: 'Москва', latitude: 55.7558, longitude: 37.6173 },
  { id: '2', name: 'Химки', latitude: 55.8941, longitude: 37.4440 },
  { id: '3', name: 'Подольск', latitude: 55.4312, longitude: 37.5458 },
  { id: '4', name: 'Мытищи', latitude: 55.9114, longitude: 37.7308 },
  { id: '5', name: 'Люберцы', latitude: 55.6772, longitude: 37.8932 },
  { id: '6', name: 'Одинцово', latitude: 55.6789, longitude: 37.2831 },
  { id: '7', name: 'Калуга', latitude: 54.5293, longitude: 36.2754 },
];

const FALLBACK_DATA = {
  temp: 18,
  weather_icon: '02d',
  wind_speed: 4,
  wind_deg: 180,
  clouds: 45,
  pressure: 755,
  description: 'малооблачно'
};

export default function App() {
  const mapRef = useRef(null);
  const [cities, setCities] = useState(INITIAL_CITIES);
  const [layer, setLayer] = useState('temp');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    if (API_KEY === 'YOUR_OPENWEATHER_API_KEY_HERE') {
      const demoCities = INITIAL_CITIES.map(city => ({
        ...city,
        temp: Math.floor(Math.random() * 25) + 5,
        weather_icon: ['01d', '02d', '03d', '09d', '10d'][Math.floor(Math.random() * 5)],
        wind_speed: Math.floor(Math.random() * 10) + 1,
        wind_deg: Math.floor(Math.random() * 360),
        clouds: Math.floor(Math.random() * 100),
        pressure: Math.floor(Math.random() * 30) + 740,
        description: 'демо'
      }));
      setCities(demoCities);
      return;
    }

    setLoading(true);
    try {
      const updatedCities = await Promise.all(
        INITIAL_CITIES.map(async (city) => {
          try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.latitude}&lon=${city.longitude}&appid=${API_KEY}&units=metric&lang=ru`;
            const response = await fetch(url);
            if (!response.ok) return { ...city, ...FALLBACK_DATA };
            
            const data = await response.json();
            if (!data.main || !data.weather || !data.wind) {
              return { ...city, ...FALLBACK_DATA };
            }

            const pressureMmHg = Math.round(data.main.pressure * 0.750062);

            return {
              ...city,
              temp: Math.round(data.main.temp),
              weather_icon: data.weather[0].icon,
              wind_speed: data.wind.speed,
              wind_deg: data.wind.deg,
              clouds: data.clouds.all,
              pressure: pressureMmHg,
              description: data.weather[0].description
            };
          } catch (err) {
            return { ...city, ...FALLBACK_DATA };
          }
        })
      );
      setCities(updatedCities);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить погоду.');
      const demoCities = INITIAL_CITIES.map(city => ({
        ...city,
        temp: Math.floor(Math.random() * 25) + 5,
        weather_icon: '02d',
        wind_speed: 5,
        wind_deg: 180,
        clouds: 50,
        pressure: 755,
      }));
      setCities(demoCities);
    } finally {
      setLoading(false);
    }
  };

  const getTempColor = (temp) => {
    if (temp < 0) return '#3b82f6';
    if (temp < 10) return '#60a5fa';
    if (temp < 20) return '#fbbf24';
    return '#ef4444';
  };

  const getWeatherIcon = (icon) => {
    if (icon.includes('01')) return '☀️';
    if (icon.includes('02') || icon.includes('03') || icon.includes('04')) return '☁️';
    if (icon.includes('09') || icon.includes('10')) return '🌧️';
    if (icon.includes('11')) return '⛈️';
    if (icon.includes('13')) return '❄️';
    return '🌫️';
  };

  const getWindDirection = (deg) => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    return directions[Math.round(deg / 45) % 8];
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView 
        ref={mapRef} 
        style={styles.map} 
        initialRegion={MOSCOW_REGION}
        provider={PROVIDER_DEFAULT}
      >
        {cities.map(city => (
          <Marker
            key={city.id}
            coordinate={{ latitude: city.latitude, longitude: city.longitude }}
            title={city.name}
            pinColor={layer === 'temp' ? getTempColor(city.temp) : '#007AFF'}
          />
        ))}
      </MapView>

      {/* Верхняя панель */}
      <View style={styles.topPanel}>
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>Прогноз погоды</Text>
          <Text style={styles.headerSubtitle}>ИУК2-42Б</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={fetchWeatherData}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.refreshText}>Обновить</Text>}
        </TouchableOpacity>
      </View>

      {/* Панель слоев */}
      <View style={styles.layersPanel}>
        <Text style={styles.panelHeader}>СЛОИ</Text>
        <LayerButton label="Температура" active={layer === 'temp'} onPress={() => setLayer('temp')} color="#ef4444" />
        <LayerButton label="Осадки" active={layer === 'precipitation'} onPress={() => setLayer('precipitation')} color="#3b82f6" />
        <LayerButton label="Ветер" active={layer === 'wind'} onPress={() => setLayer('wind')} color="#0ea5e9" />
        <LayerButton label="Облачность" active={layer === 'clouds'} onPress={() => setLayer('clouds')} color="#6b7280" />
        <LayerButton label="Давление" active={layer === 'pressure'} onPress={() => setLayer('pressure')} color="#22c55e" />
      </View>

      {/* ИНФОРМАЦИОННЫЕ КАРТОЧКИ ГОРОДОВ - ПОВЕРХ КАРТЫ */}
      <View style={styles.citiesPanel}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {cities.map(city => (
            <View key={city.id} style={styles.cityCard}>
              <Text style={styles.cityName}>{city.name}</Text>
              
              {layer === 'temp' && (
                <View style={[styles.cityData, { backgroundColor: getTempColor(city.temp) }]}>
                  <Text style={styles.cityValue}>{city.temp}°C</Text>
                  <Text style={styles.cityLabel}>Температура</Text>
                </View>
              )}
              
              {layer === 'precipitation' && (
                <View style={[styles.cityData, { backgroundColor: '#fff' }]}>
                  <Text style={styles.cityIcon}>{getWeatherIcon(city.weather_icon)}</Text>
                  <Text style={styles.cityLabelDark}>{city.description}</Text>
                </View>
              )}
              
              {layer === 'wind' && (
                <View style={[styles.cityData, { backgroundColor: '#e0f2fe' }]}>
                  <Text style={styles.cityValueBlue}>{getWindDirection(city.wind_deg)}</Text>
                  <Text style={styles.cityLabelDark}>{city.wind_speed} м/с</Text>
                </View>
              )}
              
              {layer === 'clouds' && (
                <View style={[styles.cityData, { backgroundColor: '#9ca3af', opacity: 0.3 + (city.clouds / 100) * 0.7 }]}>
                  <Text style={styles.cityValueWhite}>{city.clouds}%</Text>
                  <Text style={styles.cityLabelWhite}>Облачность</Text>
                </View>
              )}
              
              {layer === 'pressure' && (
                <View style={[styles.cityData, { backgroundColor: '#dcfce7' }]}>
                  <Text style={styles.cityValueGreen}>{city.pressure}</Text>
                  <Text style={styles.cityLabelGreen}>мм рт.ст.</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Навигация */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navBtn} 
          onPress={() => mapRef.current?.animateToRegion(MOSCOW_REGION, 1000)}
        >
          <Text style={styles.navBtnText}>📍 Москва</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navBtn, { marginLeft: 10 }]} 
          onPress={() => mapRef.current?.animateToRegion(OVERVIEW_REGION, 1000)}
        >
          <Text style={styles.navBtnText}>🌍 Все города</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const LayerButton = ({ label, active, onPress, color }) => (
  <TouchableOpacity 
    style={[styles.layerBtn, active && { backgroundColor: color, borderColor: color }]} 
    onPress={onPress}
  >
    <Text style={[styles.layerBtnText, active && styles.activeLayerText]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  map: { ...StyleSheet.absoluteFillObject },
  
  topPanel: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  headerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 5,
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 12, color: '#6b7280' },
  refreshButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 5,
  },
  refreshText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  layersPanel: {
    position: 'absolute',
    top: 120,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 5,
    width: 130,
  },
  panelHeader: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase' },
  layerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  layerBtnText: { fontSize: 12, color: '#374151', textAlign: 'center', fontWeight: '500' },
  activeLayerText: { color: '#fff', fontWeight: 'bold' },

  // ПАНЕЛЬ С ГОРОДАМИ - ВНИЗУ
  citiesPanel: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    maxHeight: 150,
    zIndex: 10,
  },
  cityCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    borderRadius: 12,
    padding: 12,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 5,
  },
  cityName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  cityData: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: 100,
  },
  cityValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  cityValueWhite: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  cityValueGreen: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#15803d',
  },
  cityValueBlue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0284c7',
  },
  cityLabel: {
    fontSize: 11,
    color: '#fff',
    marginTop: 4,
    textAlign: 'center',
  },
  cityLabelWhite: {
    fontSize: 11,
    color: '#fff',
    marginTop: 4,
    textAlign: 'center',
  },
  cityLabelGreen: {
    fontSize: 10,
    color: '#15803d',
    marginTop: 4,
    textAlign: 'center',
  },
  cityLabelDark: {
    fontSize: 11,
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
  },
  cityIcon: {
    fontSize: 36,
  },

  bottomNav: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
  },
  navBtn: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 5,
    flex: 1,
    alignItems: 'center',
    maxWidth: 160,
  },
  navBtnText: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
});