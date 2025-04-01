import React, { useRef, useState } from "react";
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
import RepeatSelector from "./RepeatSelector";

interface Task {
  id: string;
  title: string;        // 할 일 제목
  dueDate: string;      // 날짜
  memo: string;         // 메모(선택)
  alarmTime: string;    // 시간 알림(선택)
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
  const [routineModalVisible, setRoutineModalVisible] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("할 일");

  // 애니메이션
  const scaleAnim = useState(new Animated.Value(0))[0];
  const leftAnim = useState(new Animated.Value(0))[0];
  const upAnim = useState(new Animated.Value(0))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];

  // 카테고리 모달, 작성 모달
  const [circleButtonX, setCircleButtonX] = useState(0);
  const [circleButtonY, setCircleButtonY] = useState(0);
  const [circleButtonWidth, setCircleButtonWidth] = useState(0);
  const [circleButtonHeight, setCircleButtonHeight] = useState(0);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // 날짜 피커 모달
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  // 메모
  const [showMemoInput, setShowMemoInput] = useState(false);
  // 알람
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alarmTime, setAlarmTime] = useState(""); // 선택된 알람 시각

  // 루틴용
  const [routinePickerVisible, setRoutinePickerVisible] = useState(false);
  const [repeatValue, setRepeatValue] = useState<"매일" | "매주" | "매월" | "매년">("매일");
  
  const circleRef = useRef<TouchableOpacity | null>(null);

  // 새 할 일 상태
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: "",
    memo: "",
    alarmTime: "",
    category: categories[0],
  });

  // ✅ RepeatSelector에서 값이 바뀔 때
  const handleRepeatChange = (option: "매일" | "매주" | "매월" | "매년") => {
    setRepeatValue(option);
    console.log("선택된 반복 옵션:", option);
  };

  // 오늘 날짜
  const todayString = new Date();

  // 날짜 포맷
  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 주간 달력
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // DateTimePickerModal (날짜 선택)
  const handleConfirmDate = (date: Date) => {
    setDatePickerVisibility(false);
    setNewTask((prev) => ({
      ...prev,
      dueDate: formatDateKey(date),
    }));
  };

  // 새 할 일 추가
  const addTask = () => {
    if (newTask.title.trim() === "") return;

    const dateKey = newTask.dueDate ? newTask.dueDate : formatDateKey(selectedDate);

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

    setTasks((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), task],
    }));

    // reset
    setNewTask({
      title: "",
      dueDate: "",
      memo: "",
      alarmTime: "",
      category: categories[0],
    });
    setModalVisible(false);
  };

  // 시간 알람 확인
  const onConfirmTime = (time: Date) => {
    setShowTimePicker(false);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const formatted = `${hours}시 ${minutes}분`;
    setAlarmTime(formatted);
  };
  const onCancelTime = () => {
    setShowTimePicker(false);
  };

  // 중요 토글
  const toggleImportant = (id: string) => {
    const dateKey = formatDateKey(selectedDate);
    setTasks((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((task) =>
        task.id === id ? { ...task, isImportant: !task.isImportant } : task
      ),
    }));
  };

  // 완료 토글
  const toggleCompleted = (id: string) => {
    const dateKey = formatDateKey(selectedDate);
    setTasks((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      ),
    }));
  };

  // 정렬 로직
  function buildCategoryOrder(tasks: Task[]): Record<string, number> {
    const categoryOrder: Record<string, number> = {};
    let orderIndex = 0;
    for (let i = 0; i < tasks.length; i++) {
      const catTitle = tasks[i].category.title;
      if (categoryOrder[catTitle] === undefined) {
        categoryOrder[catTitle] = orderIndex;
        orderIndex++;
      }
    }
    return categoryOrder;
  }
  function customSort(tasks: Task[]): Task[] {
    if (!tasks || tasks.length === 0) return [];

    const categoryOrder = buildCategoryOrder(tasks);

    return [...tasks].sort((a, b) => {
      // 중요 먼저
      if (a.isImportant && !b.isImportant) return -1;
      if (!a.isImportant && b.isImportant) return 1;

      // 카테고리 순
      const aCat = categoryOrder[a.category.title];
      const bCat = categoryOrder[b.category.title];
      if (aCat !== bCat) {
        return aCat - bCat;
      }

      // 등록 순
      const aID = parseInt(a.id, 10);
      const bID = parseInt(b.id, 10);
      return aID - bID;
    });
  }

  const dateKey = formatDateKey(selectedDate);
  const rawTasks = tasks[dateKey] || [];
  const sortedTasks = customSort(rawTasks);

  // ✅ "중요" / "일반" 분리
  const importantTasks = sortedTasks.filter((t) => t.isImportant);
  const normalTasks = sortedTasks.filter((t) => !t.isImportant);

  // + 버튼 애니메이션
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

  // ✅ "renderTaskItem" 공통 로직
  const renderTaskItem = (taskList: Task[]) => {
    return ({ item, index }: { item: Task; index: number }) => {
      // 카테고리 표시 로직
      let showCategoryTitle = false;
      if (index === 0) {
        showCategoryTitle = true;
      } else {
        const prevCategory = taskList[index - 1].category.title;
        if (prevCategory !== item.category.title) {
          showCategoryTitle = true;
        }
      }

      return (
        <View>
          {/* 카테고리 제목 표시 */}
          {showCategoryTitle && (
            <Text style={styles.taskCategory}>{item.category.title}</Text>
          )}

          {/* 할 일 카드 */}
          <View style={styles.taskCard}>
            {/* 왼쪽 색상 띠 */}
            <View style={[styles.taskCColor, { backgroundColor: item.category.color }]} />

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
            <TouchableOpacity onPress={() => toggleImportant(item.id)} style={{ paddingRight: 10 }}>
              <FontAwesome
                name={item.isImportant ? "bookmark" : "bookmark-o"}
                size={20}
                color={item.isImportant ? "#6A0DAD" : "#B0B0B0"}
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        {/* 주간 달력 */}
        <WeekView onDateSelect={handleDateSelect} />
        <ToggleTabs onSelect={setSelectedTab} />
        

        <View style={styles.sectionTitle}>
          <Text>카테고리 설정하기</Text>
        </View>

        {/* ------------------ 중요 목록 ------------------ */}
        {selectedTab == "할 일" && 
        <View>{importantTasks.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginVertical: 5 }}>중요</Text>
            <FlatList
              data={importantTasks}
              keyExtractor={(item) => item.id}
              renderItem={renderTaskItem(importantTasks)}
            />
          </>
        )}

        {/* ------------------ 일반 목록 ------------------ */}
        <FlatList
          data={normalTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem(normalTasks)}
        />
        </View>
        }
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
            <TouchableOpacity
              style={styles.fabButton}
              onPress={() => setRoutineModalVisible(true)}
            >
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

      {/* ===== 새 할 일 작성 모달 ===== */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            {/* 카테고리 + 제목 */}
            <View style={styles.inputWithCategory}>
              <TouchableOpacity
                ref={circleRef}
                style={[styles.categoryCircle, { backgroundColor: newTask.category.color }]}
                onPress={() => {
                  circleRef.current?.measureInWindow((x, y, w, h) => {
                    setCircleButtonX(x);
                    setCircleButtonY(y);
                    setCircleButtonWidth(w);
                    setCircleButtonHeight(h);
                    setCategoryModalVisible(true);
                  });
                }}
              />
              <TextInput
                style={styles.input}
                placeholder="할 일 제목"
                value={newTask.title}
                onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              />
            </View>

            {/* 카테고리 선택 모달 */}
            <Modal visible={categoryModalVisible} transparent={true} animationType="none">
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setCategoryModalVisible(false)}
              />
              <View
                style={[
                  styles.dropdownContainer,
                  {
                    position: "absolute",
                    top: circleButtonY + circleButtonHeight + 8,
                    left: circleButtonX,
                  },
                ]}
              >
                <View style={styles.dropdownContent}>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.title}
                    style={{ maxHeight: 120 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.categoryItem}
                        onPress={() => {
                          if (selectedTaskId) {
                            // 기존 할 일 수정 로직
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
                  {newTask.dueDate ? newTask.dueDate : formatDateKey(selectedDate)}
                </Text>
              </TouchableOpacity>

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
              <TouchableOpacity
                style={styles.alarmButton}
                onPress={() => setShowTimePicker(true)}
              >
                <MaterialIcons name="access-alarm" size={24} />
                <Text style={styles.alarmButtonText}>시간 알람</Text>
                {alarmTime ? <Text style={styles.timeText}> {alarmTime}</Text> : null}
              </TouchableOpacity>
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

              <TouchableOpacity style={styles.alarmButton}>
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

      {/* ===== 루틴 생성 모달 ===== */}
      <Modal visible={routineModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            <View style={styles.inputWithCategory}>
              <TouchableOpacity
                ref={circleRef}
                style={[styles.categoryCircle, { backgroundColor: newTask.category.color }]}
                onPress={() => {
                  circleRef.current?.measureInWindow((x, y, w, h) => {
                    setCircleButtonX(x);
                    setCircleButtonY(y);
                    setCircleButtonWidth(w);
                    setCircleButtonHeight(h);
                    setCategoryModalVisible(true);
                  });
                }}
              />
              <TextInput
                style={styles.input}
                placeholder="루틴 작성"
                value={newTask.title}
                onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              />
            </View>

            {/* 카테고리 선택 모달 (루틴) */}
            <Modal visible={categoryModalVisible} transparent={true} animationType="none">
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setCategoryModalVisible(false)}
              />
              <View
                style={[
                  styles.dropdownContainer,
                  {
                    position: "absolute",
                    top: circleButtonY + circleButtonHeight + 8,
                    left: circleButtonX,
                  },
                ]}
              >
                <View style={styles.dropdownContent}>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.title}
                    style={{ maxHeight: 120 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.categoryItem}
                        onPress={() => {
                          if (selectedTaskId) {
                            // 기존 할 일 수정
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
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setDatePickerVisibility(true)}
              >
                <Feather name="calendar" size={20} color="black" />
                <Text style={styles.datePickerText}>
                  {newTask.dueDate ? newTask.dueDate : formatDateKey(selectedDate)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => {
                  setRoutinePickerVisible(true);
                }}
              >
                <MaterialIcons name="sync" size={20} />
                <Text style={styles.datePickerText}>반복 추가</Text>
              </TouchableOpacity>

              {routinePickerVisible && (
                <View>
                  <RepeatSelector selectedDate={selectedDate} onChange={handleRepeatChange} />
                </View>
              )}

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={() => setDatePickerVisibility(false)}
                display="inline"
              />

              {/* 메모 */}
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

              {/* 시간 알람 */}
              <TouchableOpacity style={styles.alarmButton} onPress={() => setShowTimePicker(true)}>
                <MaterialIcons name="access-alarm" size={24} />
                <Text style={styles.alarmButtonText}>시간 알람</Text>
                {alarmTime ? <Text style={styles.timeText}> {alarmTime}</Text> : null}
              </TouchableOpacity>

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

              <TouchableOpacity style={styles.alarmButton}>
                <MaterialIcons name="delete-forever" size={24} />
                <Text style={styles.alarmButtonText}>할 일 삭제하기</Text>
              </TouchableOpacity>

              {/* 저장/취소 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => setRoutineModalVisible(false)}
                >
                  <Text style={styles.saveButtonText}>저장하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setRoutineModalVisible(false)}
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

export default Todo;

// 스타일
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  body: { flex: 1, padding: 16 },
  sectionTitle: { flexDirection: "row", margin: 5, marginLeft: "auto" },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 0,
    marginBottom: 8,
    backgroundColor: "white",
    borderRadius: 8,
  },
  taskInfo: {
    flex: 1,
    marginLeft: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 5,
  },
  taskDetail: {
    fontSize: 12,
    color: "#888",
  },
  taskCompleted: {
    textDecorationLine: "line-through",
    color: "#888",
  },

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
  modalTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
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
    fontSize: 12,
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
  },
  dropdownContainer: {
    position: "absolute",
    zIndex: 999,
    width: 200,
  },
  dropdownContent: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    width: 150,
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
    gap: 5,
  },
  taskCColor: {
    width: 10,
    height: "100%",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    marginRight: 10,
  },
  taskCategory: {
    margin: 10,
    marginBottom: 5,
  },
});
