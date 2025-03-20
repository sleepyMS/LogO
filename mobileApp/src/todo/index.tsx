
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
} from "react-native";
import WeekView from "./WeekView/WeekView";
import ToggleTabs from "./ToggleTabs/ToggleTabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // 날짜 선택 라이브러리

interface Task {
  id: string;
  title: string; // 할 일 제목
  dueDate: string; // 날짜
  memo: string; // 메모(선택)
  alarmTime: string; // 시간 알림(선택)
  isImportant: boolean;
  isCompleted: boolean;
  category: { title: string; color: string };
}

// 카테고리 리스트
const categories = [
  { title: "일반", color: "#B0BEC5" },
  { title: "업무", color: "#FF7043" },
  { title: "개인", color: "#8E24AA" },
  { title: "운동", color: "#26A69A" },
  { title: "공부", color: "#42A5F5" },
];

const Todo = () => {
  const [tasks, setTasks] = useState<Record<string, Task[]>>({}); // 날짜별 할 일 저장
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("할 일");
  // 애니메이션 관련
  const scaleAnim = useState(new Animated.Value(0))[0];
  const leftAnim = useState(new Animated.Value(0))[0];
  const upAnim = useState(new Animated.Value(0))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  const [circleButtonX, setCircleButtonX] = useState(0);
  const [circleButtonY, setCircleButtonY] = useState(0);
  const [circleButtonWidth, setCircleButtonWidth] = useState(0);
  const [circleButtonHeight, setCircleButtonHeight] = useState(0);
  // 날짜 피커 모달
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  //메모 토글
  const [showMemoInput, setShowMemoInput] = useState(false);

  // 카테고리 모달
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  // 새 할 일에서 카테고리를 지정할 때, 새 할 일이므로 selectedTaskId는 null
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // 새 할 일 작성 상태
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: "",
    memo: "",
    alarmTime: "",
    category: categories[0], // 기본 카테고리
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alarmTime, setAlarmTime] = useState(""); // 선택된 알람 시각을 저장

  // ✅ 시간 선택 확인 (picker에서 "확인" 누르면 호출)
  const onConfirmTime = (time: Date) => {
    setShowTimePicker(false);
    // 시간 포맷 (예: HH:MM)
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const formatted = `${hours}시 ${minutes}분`; // 원하는 포맷으로
    setAlarmTime(formatted);
  };

  // ✅ 시간 선택 취소
  const onCancelTime = () => {
    setShowTimePicker(false);
  };

  //오늘 날짜
  const todayString = new Date(); 

  // 📌 날짜 형식
  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 📌 주간 달력에서 날짜 선택 시
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // 📌 DateTimePickerModal에서 날짜 선택 시
  const handleConfirmDate = (date: Date) => {
    setDatePickerVisibility(false);
    // newTask.dueDate 갱신
    setNewTask((prev) => ({
      ...prev,
      dueDate: formatDateKey(date),
    }));
  };

  // 📌 새 할 일 추가 함수
  const addTask = () => {
    // 제목이 빈 문자열이면 추가 불가
    if (newTask.title.trim() === "") return;

    const dateKey = newTask.dueDate
      ? newTask.dueDate
      : formatDateKey(selectedDate); // 만약 사용자 지정 날짜가 없으면 현재 selectedDate 사용

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      dueDate: dateKey,
      memo: newTask.memo,
      alarmTime: newTask.alarmTime,
      isImportant: false,
      isCompleted: false,
      category: newTask.category,
    };

    // 날짜별로 저장
    setTasks((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), task],
    }));

    // 입력 상태 초기화
    setNewTask({
      title: "",
      dueDate: "",
      memo: "",
      alarmTime: "",
      category: categories[0],
    });
    setModalVisible(false);
  };

  // ✅ 중요 토글
  const toggleImportant = (id: string) => {
    const dateKey = formatDateKey(selectedDate);
    setTasks((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((task) =>
        task.id === id ? { ...task, isImportant: !task.isImportant } : task
      ),
    }));
  };

  // ✅ 완료 체크
  const toggleCompleted = (id: string) => {
    const dateKey = formatDateKey(selectedDate);
    setTasks((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      ),
    }));
  };

  // ✅ 정렬: 중요 먼저
  const sortedTasks = [...(tasks[formatDateKey(selectedDate)] || [])].sort((a, b) =>
    a.isImportant === b.isImportant ? 0 : a.isImportant ? -1 : 1
  );

  // 📌 카테고리 변경 함수 (기존 할 일을 수정하는 경우, 여기서는 새 할 일에는 해당 안 됨)
  const changeTaskCategory = (taskId: string, newCategory: { title: string; color: string }) => {
    const dateKey = formatDateKey(selectedDate);
    setTasks((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((task) =>
        task.id === taskId ? { ...task, category: newCategory } : task
      ),
    }));
    setCategoryModalVisible(false);
  };

  // 📌 + 버튼 애니메이션
  const toggleFab = () => {
    if (isFabOpen) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(leftAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(upAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => setIsFabOpen(false));
    } else {
      setIsFabOpen(true);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(leftAnim, {
          toValue: -70,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(upAnim, {
          toValue: -70,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        {/* ✅ 주간 달력 */}
        <WeekView onDateSelect={handleDateSelect} />
        <ToggleTabs onSelect={setSelectedTab} />
        <View style={styles.sectionTitle}>
          <Text>중요</Text>
          <Text>카테고리 설정하기</Text>
        </View>

        {/* ✅ 할 일 목록 */}
        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              {/* 카테고리 제목 표시 */}
              <Text>{item.category.title}</Text>

              {/* 할 일 카드 */}
              <View style={styles.taskCard}>
                {/* 체크박스 */}
                <TouchableOpacity onPress={() => toggleCompleted(item.id)}>
                  <MaterialIcons
                    name={item.isCompleted ? "check-box" : "check-box-outline-blank"}
                    size={24}
                    color={item.isCompleted ? "#6A0DAD" : "#B0B0B0"}
                  />
                </TouchableOpacity>

                {/* 할 일 정보 */}
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, item.isCompleted && styles.taskCompleted]}>
                    {item.title}
                  </Text>
                  <Text style={styles.taskDetail}>{item.dueDate}</Text>
                </View>

                {/* 중요 버튼 */}
                <TouchableOpacity onPress={() => toggleImportant(item.id)}>
                  <FontAwesome
                    name={item.isImportant ? "bookmark" : "bookmark-o"}
                    size={20}
                    color={item.isImportant ? "#6A0DAD" : "#B0B0B0"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      {/* FAB */}
      <View style={styles.fabContainer}>
        {/* 루틴 버튼 (위) */}
        {isFabOpen && (
          <Animated.View
            style={[
              styles.fabItem,
              { transform: [{ translateY: upAnim }], opacity: opacityAnim },
            ]}
          >
            <TouchableOpacity style={styles.fabButton} onPress={() => console.log("루틴 추가")}>
              <Text style={{ color: "white", fontWeight: "bold" }}>루틴</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        {/* 할 일 버튼 (왼쪽) */}
        {isFabOpen && (
          <Animated.View
            style={[
              styles.fabItem,
              { transform: [{ translateX: leftAnim }], opacity: opacityAnim },
            ]}
          >
            <TouchableOpacity
              style={styles.fabButton}
              onPress={() => {
                setModalVisible(true);
                toggleFab();
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>할 일</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* + 버튼 */}
        <TouchableOpacity style={styles.fabMain} onPress={toggleFab}>
          <Feather name={isFabOpen ? "x" : "plus"} size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* ✅ 새 할 일 작성 모달 */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* 카테고리 + 할 일 제목 (한 줄) */}
            <View style={styles.inputWithCategory}>
              {/* 카테고리 원형 버튼 */}
              {/* <TouchableOpacity
                style={[styles.categoryCircle, { backgroundColor: newTask.category.color }]}
                onPress={() => {
                  setSelectedTaskId(null); // 새 할 일이므로 null
                  setCategoryModalVisible(true); // 카테고리 모달 열기
                }}
              /> */}
              <TouchableOpacity
                onLayout={(e) => {
                  const { x, y, width, height } = e.nativeEvent.layout;
                  setCircleButtonX(x);
                  setCircleButtonY(y);
                  setCircleButtonWidth(width);
                  setCircleButtonHeight(height);
                }}
                onPress={() => {
                  setCategoryModalVisible(true);
                }}
                style={[styles.categoryCircle, { backgroundColor: newTask.category.color, position: "relative" }]}
              />
              <TextInput
                style={styles.input}
                placeholder="할 일 제목"
                value={newTask.title}
                onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              />
            </View>

            {/* ✅ 카테고리 선택 모달 */}
            <Modal visible={categoryModalVisible} transparent={true} animationType="none">
              {/* 배경을 누르면 모달을 닫도록 설정 */}
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setCategoryModalVisible(false)}
              />

              {/* 실제 드롭다운 컨테이너 */}
              <View
                style={[
                  styles.dropdownContainer,
                  {
                    position: 'absolute',
                    top: circleButtonY + circleButtonHeight + 8, // 원형 버튼 아래
                    left: circleButtonX,
                  },
                ]}
              >
                <View style={styles.dropdownContent}>
                  <Text style={styles.modalTitle}>카테고리 선택</Text>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.title}
                    style={{ maxHeight: 200 }} // 5개 이상이면 스크롤
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.categoryItem}
                        onPress={() => {
                          // 기존 로직 유지
                          if (selectedTaskId) {
                            changeTaskCategory(selectedTaskId, item);
                          } else {
                            setNewTask((prev) => ({ ...prev, category: item }));
                          }
                          setCategoryModalVisible(false);
                        }}
                      >
                        <View style={[styles.categoryCircle, { backgroundColor: item.color }]} />
                        <Text style={styles.categoryText}>{item.title}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>
            <View style={styles.optionContainer}>
              {/* 날짜 선택 버튼 */}
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setDatePickerVisibility(true)}
              >
                <Feather name="calendar" size={20} color="black" />
                <Text style={styles.datePickerText}>
                  {newTask.dueDate
                    ? newTask.dueDate
                    : formatDateKey(selectedDate)}
                </Text>
              </TouchableOpacity>

              {/* DateTimePickerModal */}
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={() => setDatePickerVisibility(false)}
                display="inline"
              />

              {/* 메모(선택) */}
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() => setShowMemoInput((prev) => !prev)}
              >
                <MaterialIcons name="feed" size={24} />
                <Text style={{ marginLeft: 4 }}>메모</Text>
              </TouchableOpacity>
              {showMemoInput && (
                <TextInput
                  style={styles.memoInput}
                  placeholder="메모를 입력하세요"
                  value={newTask.memo}
                  onChangeText={(text) => setNewTask((prev) => ({ ...prev, memo: text }))}
                />
              )}

              {/* 시간 알림(선택) */}
              {/* 시간 알람 버튼 (아이콘 + 텍스트) */}
              <TouchableOpacity
                style={styles.alarmButton}
                onPress={() => setShowTimePicker(true)}
              >
                <MaterialIcons name="access-alarm" size={24} />
                <Text style={styles.alarmButtonText}>시간 알람</Text>   {alarmTime ? <Text style={styles.timeText}> {alarmTime}</Text> : null}
              </TouchableOpacity>
              {/* ✅ Time Picker 모달 */}
              <DateTimePickerModal
                isVisible={showTimePicker}
                mode="time"
                onConfirm={onConfirmTime}
                onCancel={onCancelTime}
              />
            <TouchableOpacity style={styles.alarmButton}>
              <MaterialIcons name="arrow-right-alt" size={24} />
              <Text style={styles.alarmButtonText}>
                {newTask.dueDate === formatDateKey(todayString) ? "내일하기" : "오늘로 붙여넣기"}
              </Text>
            </TouchableOpacity>

              <TouchableOpacity
                style={styles.alarmButton}
              >
                <MaterialIcons name="delete-forever" size={24} />
                <Text style={styles.alarmButtonText}>할 일 삭제하기</Text> 
              </TouchableOpacity>
              {/* 저장/취소 버튼 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={addTask}>
                  <Text style={styles.saveButtonText}>저장하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>취소</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>


    </SafeAreaView>
  );
};

// ✅ 스타일
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  body: { flex: 1, padding: 16 },
  sectionTitle: { flexDirection: "row", justifyContent: "space-between", margin: 5 },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    backgroundColor: "white",
    borderRadius: 8,
  },
  taskInfo: { flex: 1, marginLeft: 10 },
  taskTitle: { fontSize: 16, fontWeight: "bold" },
  taskDetail: { fontSize: 12, color: "#888" },
  taskCompleted: { textDecorationLine: "line-through", color: "#888" },

  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignItems: "center",
  },
  fabMain: {
    backgroundColor: "#6A0DAD",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabItem: {
    position: "absolute",
    right: 0,
  },
  fabButton: {
    backgroundColor: "#6A0DAD",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  categoryModalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    maxHeight: "50%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f1f1f1",
  },
  categoryCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  inputWithCategory: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 5,
    fontSize: 16,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    
    
    borderRadius: 8,
    marginBottom: 12,
  },
  datePickerText: {
    marginLeft: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "black",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 5,
  },
  saveButtonText: { color: "white" },
  cancelButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  }, dropdownContainer: {
    position: "absolute",
    // 위치는 state로 계산한 값을 top/left에 적용
    zIndex: 999, // 최상단으로
    width: 200, // 목록 너비
  },
  dropdownContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    elevation: 5,
  },
  memoButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  memoText: {
    marginLeft: 4,
    fontSize: 16,
  },
  memoInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 8,
  },
  alarmButton: {
    flexDirection: "row",
    alignItems: "center",
    
  },
  alarmButtonText: {
    marginLeft: 4,
    fontSize: 16,
  },
  timeText: {
    fontSize: 12,
    color: "#333",
  },
  optionContainer: {
    gap: 5
  }
});

export default Todo;
