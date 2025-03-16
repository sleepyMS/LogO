import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const ToggleTabs = ({ onSelect }: { onSelect: (tab: string) => void }) => {
  const [selectedTab, setSelectedTab] = useState("할 일");

  const handleSelect = (tab: string) => {
    setSelectedTab(tab);
    onSelect(tab); // 상위 컴포넌트에 선택된 탭 전달
  };

  return (
    <View style={styles.container}>
      {/* 할 일 버튼 */}
      <TouchableOpacity
        style={[styles.tab, selectedTab === "할 일" ? styles.activeTab : styles.inactiveTab]}
        onPress={() => handleSelect("할 일")}
      >
        <Text style={[styles.tabText, selectedTab === "할 일" ? styles.activeText : styles.inactiveText]}>
          할 일
        </Text>
      </TouchableOpacity>

      {/* 루틴 버튼 */}
      <TouchableOpacity
        style={[styles.tab, selectedTab === "루틴" ? styles.activeTab : styles.inactiveTab]}
        onPress={() => handleSelect("루틴")}
      >
        <Text style={[styles.tabText, selectedTab === "루틴" ? styles.activeText : styles.inactiveText]}>
          루틴
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0
  },
  activeTab: {
    backgroundColor: "black",
  },
  inactiveTab: {
    backgroundColor: "#ddd",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  activeText: {
    color: "white",
  },
  inactiveText: {
    color: "#888",
  },
});

export default ToggleTabs;
