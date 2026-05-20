// =======================================================


import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
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

// Запасные данные на случай сбоя сети или ошибки API
const FALLBACK_CITIES = [
  { id: '1', name: 'Москва', latitude: 55.7558, longitude: 37.6173, weather: '☀️', temp: '+21°C', wind: '🡪 3 м/с', cloudiness: 0.2 },
  { id: '2', name: 'Химки', latitude: 55.8941, longitude: 37.4440, weather: '☁️', temp: '+19°C', wind: '🡪 4 м/с', cloudiness: 0.6 },
  { id: '3', name: 'Подольск', latitude: 55.4312, longitude: 37.5458, weather: '🌧️', temp: '+16°C', wind: '🡪 5 м/с', cloudiness: 0.9 },
  { id: '4', name: 'Мытищи', latitude: 55.9114, longitude: 37.7308, weather: '☀️', temp: '+20°C', wind: '🡪 2 м/с', cloudiness: 0.1 },
  { id: '5', name: 'Люберцы', latitude: 55.6772, longitude: 37.8932, weather: '☁️', temp: '+18°C', wind: '🡪 4 м/с', cloudiness: 0.5 },
  { id: '6', name: 'Одинцово', latitude: 55.6789, longitude: 37.2831, weather: '❄️', temp: '+12°C', wind: '🡪 4 м/с', cloudiness: 0.7 },
];

export default function App() {
  const mapRef = useRef(null);
  const [cities, setCities] = useState(FALLBACK_CITIES);
  const [layer, setLayer] = useState('temp');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '☁️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code