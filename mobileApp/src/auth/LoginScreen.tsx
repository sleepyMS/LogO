// mobileApp/src/auth/LoginScreen.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>logO</Text>
      <Text style={styles.title}>로그인</Text>
      <Text style={styles.subtitle}>주간 할 일 관리를 시작하세요</Text>

      <TouchableOpacity style={styles.button}>
        <Icon name="google" size={20} color="#555" style={styles.icon} />
        <Text style={styles.buttonText}>Google로 계속하기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Icon name="apple" size={20} color="#555" style={styles.icon} />
        <Text style={styles.buttonText}>Apple로 계속하기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Icon name="navicon" size={20} color="#555" style={styles.icon} />
        <Text style={styles.buttonText}>네이버로 계속하기</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  logoText: {
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 10,
  },
  icon: {
    width: 24,
  },
});