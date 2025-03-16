import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
  Dimensions,
} from "react-native";
import { PanResponder } from "react-native";

// 📌 화면 너비 계산
const SCREEN_WIDTH = Dimensions.get("window").width;
const DAY_WIDTH = SCREEN_WIDTH / 7; // 7등분한 너비
const MARGIN = (SCREEN_WIDTH - DAY_WIDTH * 7) / 2; // 남는 너비를 margin으로 설정

interface WeekViewProps {
  onDateSelect: (date: Date) => void; // 📌 선택된 날짜를 상위 컴포넌트로 전달하는 콜백
  resetToToday?: boolean; // 📌 today 버튼을 눌렀을 때 리셋하는 상태 추가
}

const WeekView: React.FC<WeekViewProps> = ({ onDateSelect, resetToToday }) => {
  // 📌 오늘 날짜 저장
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  // 📌 현재 주의 기준 날짜
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(today);


  // 📌 주간 날짜 목록 생성 (오늘 날짜 체크 수정)
  const getWeekDays = (date: Date) => {
    return Array.from({ length: 7 }, (_, i) => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + i);
      return {
        key: i.toString(),
        fullDate: newDate, // 📌 전체 날짜 정보 전달
        date: newDate.getDate(),
        month: newDate.getMonth(),
        year: newDate.getFullYear(),
        day: ["일", "월", "화", "수", "목", "금", "토"][newDate.getDay()],
        isToday:
          newDate.getDate() === todayDate &&
          newDate.getMonth() === todayMonth &&
          newDate.getFullYear() === todayYear, // 📌 오늘 날짜 체크
      };
    });
  };

  // 📌 애니메이션 적용
  const scrollX = new Animated.Value(0);

  // 📌 스와이프 이벤트 핸들러 (지난주 & 다음주 이동)
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderRelease: (event: GestureResponderEvent, gestureState) => {
      if (gestureState.dx > 50) {
        setCurrentDate((prevDate) => {
          const newDate = new Date(prevDate);
          newDate.setDate(prevDate.getDate() - 7);
          return newDate;
        });
      } else if (gestureState.dx < -50) {
        setCurrentDate((prevDate) => {
          const newDate = new Date(prevDate);
          newDate.setDate(prevDate.getDate() + 7);
          return newDate;
        });
      }
    },
  });
  // 📌 "Today" 버튼이 눌렸을 때, 이번 주 & 오늘 날짜로 변경
  useEffect(() => {
    if (resetToToday) {
      setCurrentDate(today);
      setSelectedDate(today);
      onDateSelect(today); // 📌 선택한 날짜 업데이트
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToToday]);
  
  // 📌 날짜 클릭 시 선택한 날짜 변경 및 상위 컴포넌트에 전달
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date); // 📌 상위 컴포넌트(Todo)로 전달
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.FlatList
        horizontal
        data={getWeekDays(currentDate)}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.dayBox,
              item.isToday && styles.today, // 📌 오늘 날짜 강조
              selectedDate.getDate() === item.date &&
              selectedDate.getMonth() === item.month &&
              selectedDate.getFullYear() === item.year
                ? styles.selected
                : null, // 📌 선택한 날짜 강조
            ]}
            onPress={() => handleDateSelect(item.fullDate)} // 날짜 클릭 시 선택
          >
            <Text
              style={[
                styles.dayText,
                (item.isToday ||
                  (selectedDate.getDate() === item.date &&
                    selectedDate.getMonth() === item.month &&
                    selectedDate.getFullYear() === item.year)) &&
                  styles.selectedText,
              ]}
            >
              {item.day}
            </Text>
            <Text
              style={[
                styles.dateText,
                (item.isToday ||
                  (selectedDate.getDate() === item.date &&
                    selectedDate.getMonth() === item.month &&
                    selectedDate.getFullYear() === item.year)) &&
                  styles.selectedText,
              ]}
            >
              {item.date}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ marginHorizontal: MARGIN }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    borderColor: "#ccc",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    width: "100%",
  },
  dayBox: {
    width: DAY_WIDTH, // 📌 7등분한 너비 적용
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    margin: 2,
  },
  today: {
    backgroundColor: "#e0e0e0",
  },
  selected: {
    backgroundColor: "#DEE9F9", // 📌 선택된 날짜 배경색 변경
    borderRadius: 10,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedText: {
    color: "black", // 📌 선택된 날짜 글자색 변경
  },
});

export default WeekView;
