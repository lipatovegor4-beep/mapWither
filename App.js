
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
  const [layer, setLayer] = useState('temp'); // Варианты слоев: 'temp', 'wind', 'clouds'
  const [loading, setLoading] = useState(false);

  // Загрузка погоды из сети при монтировании компонента
  useEffect(() => {
    fetchWeatherData();
  }, []);

  // Конвертер кода погоды WMO в понятные эмодзи-иконки
  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '☁️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    return '⛈️';
  };

  // Асинхронный fetch-запрос к API погоды
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
            cloudiness: data.current.cloud_cover / 100, // Значение прозрачности (от 0 до 1)
          };
        })
      );
      setCities(updatedCities);
    } catch (error) {
      console.error("Ошибка запроса погоды:", error);
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
            {/* Динамическое изменение прозрачности маркера для слоя облачности */}
            <View style={[
              styles.markerContainer, 
              layer === 'clouds' && { opacity: city.cloudiness >= 0.5 ? 1 : 0.4 }
            ]}>
              <Text style={styles.markerIcon}>{city.weather}</Text>
              
              {/* Переключение контента внутри маркера на основе активного слоя погодных данных */}
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

      {/* Индикатор загрузки сети на экране */}
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}

      {/* Кнопка ручного обновления данных */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchWeatherData}>
        <Text style={styles.refreshButtonText}>🔄 Обновить</Text>
      </TouchableOpacity>

      {/* Боковая панель переключения слоев */}
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