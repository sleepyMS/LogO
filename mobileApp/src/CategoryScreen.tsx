import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CategoryScreen = () => {
  return (
    <View style={styles.container}>
      <Text>여기가 카테고리 설정화면</Text>
      {/* 여기서 원하는 UI/기능 구현 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default CategoryScreen;
