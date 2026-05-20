
import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import MapView from 'react-native-maps';

const MOSCOW_REGION = {
  latitude: 55.7558,
  longitude: 37.6173,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Шаг 1: Вывод базовой карты */}
      <MapView style={styles.map} initialRegion={MOSCOW_REGION} />
      
      <View style={styles.header}>
        <Text style={styles.headerText}>Карта погоды (ИУК2-42Б)</Text>
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
});