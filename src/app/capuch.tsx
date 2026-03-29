import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function CapuchScreen() {
  return (
    <View style={styles.root}>
      <Image
        source={require('@/assets/images/capuch.jpeg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
