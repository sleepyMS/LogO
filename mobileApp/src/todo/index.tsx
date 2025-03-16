// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   FlatList,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
// } from "react-native";
// import WeekView from "./WeekView/WeekView";
// import ToggleTabs from "./ToggleTabs/ToggleTabs";
// interface Task {
//   id: string;
//   title: string;
//   dueDate: string;
//   repeat: string;
//   isImportant: boolean;
//   isCompleted: boolean;
// }
// const Todo = () => {
//   const [task, setTask] = useState("");
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [selectedDate, setSelectedDate] = useState(new Date()); // 📌 선택한 날짜 저장
//   const [selectedTab, setSelectedTab] = useState("할 일");
//   const [resetToToday, setResetToToday] = useState(false); // 📌 today 버튼 클릭 여부 상태

//   // 📌 날짜를 YYYY-MM-DD 포맷으로 변환 (키 값으로 활용)
//   const formatDateKey = (date: Date) => {
//     return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
//   };

//   // 📌 WeekView에서 선택한 날짜 업데이트
//   const handleDateSelect = (date: Date) => {
//     setSelectedDate(date);
//   };

//   // 📌 today 버튼 클릭 시 WeekView를 리셋
//   const handleTodayPress = () => {
//     setResetToToday(true); // 📌 true로 설정하여 useEffect 트리거
//     setTimeout(() => setResetToToday(false), 100); // 📌 상태를 다시 false로 변경
//   };
//   // ✅ 할 일 추가
//   const addTask = () => {
//     if (task.trim() === "") return;

//     const newTask: Task = {
//       id: Date.now().toString(),
//       title: task,
//       dueDate: "마감일: 당일",
//       repeat: "매일 8시",
//       isImportant: false,
//       isCompleted: false,
//     };

//     setTasks((prevTasks) => [...prevTasks, newTask]);
//     setTask(""); // 입력 필드 초기화
//   };
//   // ✅ 완료 체크
//   const toggleCompleted = (id: string) => {
//     setTasks((prevTasks) =>
//       prevTasks.map((task) =>
//         task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
//       )
//     );
//   };

//   // ✅ 중요 태스크를 위로 정렬
//   const sortedTasks = [...tasks].sort((a, b) =>
//     a.isImportant === b.isImportant ? 0 : a.isImportant ? -1 : 1
//   );
//   // ✅ 중요 토글
//   const toggleImportant = (id: string) => {
//     setTasks((prevTasks) =>
//       prevTasks.map((task) =>
//         task.id === id ? { ...task, isImportant: !task.isImportant } : task
//       )
//     );
//   };


//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.body}>
//         {/* ✅ 날짜 + 버튼 영역 */}
//         <View style={styles.section}>
//           <Text style={styles.todayText}>{formatDateKey(selectedDate)}</Text>
//           <View style={styles.bottnSection}>
//             <TouchableOpacity style={styles.button} onPress={handleTodayPress}>
//               <Text style={styles.buttonText}>today</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.button}>
//               <Text style={styles.buttonText}>달력보기</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* ✅ 주간 달력 */}
//         <View style={styles.section}>
//           <WeekView resetToToday={resetToToday} onDateSelect={handleDateSelect} />
//         </View>

//         {/* ✅ 토글 버튼 추가 */}
//         <View style={styles.section}>
//           <ToggleTabs onSelect={setSelectedTab} />
//         </View>

//         {/* ✅ 선택된 탭에 따라 다른 내용 표시 */}
//         <View style={styles.content}>
//           {selectedTab === "할 일" ? (
//             <Text style={styles.contentText}>할 일 목록이 여기에 표시됩니다.</Text>
//           ) : (
//             <Text style={styles.contentText}>루틴 목록이 여기에 표시됩니다.</Text>
//           )}
//         </View>

//         {/* ✅ 입력창 */}
//         <TextInput
//           style={styles.input}
//           placeholder="할 일을 입력하세요..."
//           value={task}
//           onChangeText={setTask}
//         />
//         <Button title="추가" onPress={addTask} />
// {/* ✅ 할 일 목록 */}
// <FlatList
//         data={sortedTasks}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.taskCard}>
//             {/* ✅ 왼쪽 체크박스 */}
//             <TouchableOpacity onPress={() => toggleCompleted(item.id)}>
//               <View style={[styles.checkbox, item.isCompleted && styles.checked]}>
//                 {/* {item.isCompleted && <MaterialIcons name="check" size={18} color="white" />} */}
//                 {item.isCompleted && <span>v</span>}
//               </View>
//             </TouchableOpacity>

//             {/* ✅ 텍스트 정보 */}
//             <View style={styles.taskInfo}>
//               <Text style={[styles.taskTitle, item.isCompleted && styles.taskCompleted]}>
//                 {item.title}
//               </Text>
//               <Text style={styles.taskDetail}>{item.dueDate}</Text>
//             </View>

//             {/* ✅ 반복 시간 */}
//             <Text style={styles.repeatText}>{item.repeat}</Text>

//             {/* ✅ 중요 버튼 */}
//             <TouchableOpacity onPress={() => toggleImportant(item.id)}>
//               {/* <Feather
//                 name="bookmark"
//                 size={20}
//                 color={item.isImportant ? "#6A0DAD" : "#B0B0B0"}
//               /> */}
//             </TouchableOpacity>
//           </View>
//         )}
//       />
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f9fa",
//   },
//   body: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 16,
//   },
//   section: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     width: "100%",
//     paddingVertical: 5,
//   },
//   bottnSection: {
//     flexDirection: "row",
//   },
//   todayText: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   button: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: "#333",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   input: {
//     width: "100%",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 12,
//     marginBottom: 10,
//     fontSize: 16,
//     fontWeight: "400",
//     borderRadius: 5,
//   },
//   task: {
//     fontSize: 18,
//     fontWeight: "500",
//     padding: 10,
//     backgroundColor: "white",
//     width: "100%",
//     marginTop: 5,
//     borderRadius: 5,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   content: {
//     marginTop: 20,
//     padding: 16,
//     backgroundColor: "white",
//     borderRadius: 5,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   contentText: {
//     fontSize: 16,
//     fontWeight: "500",
//   },  taskInfo: {
//     flex: 1,
//   },
//   taskTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   taskDetail: {
//     fontSize: 12,
//     color: "#888",
//   },
//   taskCompleted: {
//     textDecorationLine: "line-through",
//     color: "#888",
//   },
//   repeatText: {
//     fontSize: 12,
//     color: "#888",
//     marginRight: 8,
//   },
//   taskCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "white",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 8,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },  checkbox: {
//     width: 24,
//     height: 24,
//     borderRadius: 6,
//     borderWidth: 2,
//     borderColor: "#B0B0B0",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//   },
//   checked: {
//     backgroundColor: "#6A0DAD",
//     borderColor: "#6A0DAD",
//   },
// });

// export default Todo;
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
// } from "react-native";
// import WeekView from "./WeekView/WeekView";
// import ToggleTabs from "./ToggleTabs/ToggleTabs";
// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import FontAwesome from "react-native-vector-icons/FontAwesome";
// import Feather from "react-native-vector-icons/Feather";

// interface Task {
//   id: string;
//   title: string;
//   dueDate: string;
//   repeat: string;
//   isImportant: boolean;
//   isCompleted: boolean;
//   category: string;
// }

// const Todo = () => {
//   const [task, setTask] = useState("");
//   const [tasks, setTasks] = useState<Record<string, Task[]>>({}); // 📌 날짜별 할 일 저장
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [selectedTab, setSelectedTab] = useState("할 일");
//   const [resetToToday, setResetToToday] = useState(false);

//   // 📌 날짜를 YYYY-MM-DD 포맷으로 변환
//   const formatDateKey = (date: Date) => {
//     return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
//   };

//   // 📌 WeekView에서 선택한 날짜 업데이트
//   const handleDateSelect = (date: Date) => {
//     setSelectedDate(date);
//   };

//   // 📌 today 버튼 클릭 시 WeekView 리셋
//   const handleTodayPress = () => {
//     setResetToToday(true);
//     setTimeout(() => setResetToToday(false), 100);
//   };

//   // ✅ 할 일 추가 (날짜별로 저장)
//   const addTask = () => {
//     if (task.trim() === "") return;

//     const dateKey = formatDateKey(selectedDate);
//     const newTask: Task = {
//       id: Date.now().toString(),
//       title: task,
//       dueDate: "마감일: 당일",
//       repeat: "매일 8시",
//       isImportant: false,
//       isCompleted: false,
//       category: "LogO"
//     };

//     setTasks((prevTasks) => ({
//       ...prevTasks,
//       [dateKey]: [...(prevTasks[dateKey] || []), newTask],
//     }));

//     setTask(""); // 입력 필드 초기화
//   };

//   // ✅ 완료 체크
//   const toggleCompleted = (id: string) => {
//     const dateKey = formatDateKey(selectedDate);
//     setTasks((prevTasks) => ({
//       ...prevTasks,
//       [dateKey]: prevTasks[dateKey].map((task) =>
//         task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
//       ),
//     }));
//   };

//   // ✅ 중요 태스크를 위로 정렬
//   const sortedTasks = [...(tasks[formatDateKey(selectedDate)] || [])].sort((a, b) =>
//     a.isImportant === b.isImportant ? 0 : a.isImportant ? -1 : 1
//   );

//   // ✅ 중요 토글 (별 → 책갈피 아이콘 변경)
//   const toggleImportant = (id: string) => {
//     const dateKey = formatDateKey(selectedDate);
//     setTasks((prevTasks) => ({
//       ...prevTasks,
//       [dateKey]: prevTasks[dateKey].map((task) =>
//         task.id === id ? { ...task, isImportant: !task.isImportant } : task
//       ),
//     }));
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.body}>
//         {/* ✅ 날짜 + 버튼 영역 */}
//         <View style={styles.section}>
//           <Text style={styles.todayText}>{formatDateKey(selectedDate)}</Text>
//           <View style={styles.bottnSection}>
//             <TouchableOpacity style={styles.button} onPress={handleTodayPress}>
//               <Text style={styles.buttonText}>today</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.button}>
//               <Text style={styles.buttonText}>달력보기</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* ✅ 주간 달력 */}
//         <View style={styles.section}>
//           <WeekView resetToToday={resetToToday} onDateSelect={handleDateSelect} />
//         </View>

//         {/* ✅ 토글 버튼 추가 */}
//         <View style={styles.section}>
//           <ToggleTabs onSelect={setSelectedTab} />
//         </View>

//         {/* ✅ 입력창 */}
//         <View style={styles.inputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="할 일을 입력하세요..."
//             value={task}
//             onChangeText={setTask}
//           />
//           <TouchableOpacity onPress={addTask}>
//             <Feather name="plus-circle" size={30} color="#6A0DAD" />
//           </TouchableOpacity>
//         </View>
//         <View style={styles.sectionTitle}>
//           <Text>중요</Text>
//           <Text>카테고리 설정하기</Text>
//         </View>
        
//         {/* ✅ 할 일 목록 */}
//         <FlatList
//           data={sortedTasks}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//             <View>
//               <Text>{item.category}</Text>
//             <View style={styles.taskCard}>
//               {/* ✅ 왼쪽 체크박스 */}
//               <TouchableOpacity onPress={() => toggleCompleted(item.id)}>
//                 <MaterialIcons
//                   name={item.isCompleted ? "check-box" : "check-box-outline-blank"}
//                   size={24}
//                   color={item.isCompleted ? "#6A0DAD" : "#B0B0B0"}
//                 />
//               </TouchableOpacity>

//               {/* ✅ 텍스트 정보 */}
//               <View style={styles.taskInfo}>
//                 <Text style={[styles.taskTitle, item.isCompleted && styles.taskCompleted]}>
//                   {item.title}
//                 </Text>
//                 <Text style={styles.taskDetail}>{item.dueDate}</Text>
//               </View>

//               {/* ✅ 반복 시간 */}
//               <Text style={styles.repeatText}>{item.repeat}</Text>

//               {/* ✅ 중요 버튼 (책갈피 아이콘 적용) */}
//               <TouchableOpacity onPress={() => toggleImportant(item.id)}>
//                 <FontAwesome
//                   name={item.isImportant ? "bookmark" : "bookmark-o"}
//                   size={20}
//                   color={item.isImportant ? "#6A0DAD" : "#B0B0B0"}
//                 />
//               </TouchableOpacity>
//             </View>
//             </View>
//           )}
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8f9fa" },
//   body: { flex: 1, padding: 16 },
//   section: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
//   bottnSection: { flexDirection: "row" },
//   todayText: { fontSize: 18, fontWeight: "bold" },
//   button: { padding: 8, marginLeft: 10 },
//   buttonText: { fontSize: 14, fontWeight: "600" },
//   inputContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
//   input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 5 },
//   taskCard: { flexDirection: "row", alignItems: "center", padding: 12, marginBottom: 8, backgroundColor: "white", borderRadius: 8 },
//   taskInfo: { flex: 1, marginLeft: 10 },
//   taskTitle: { fontSize: 16, fontWeight: "bold" },
//   taskDetail: { fontSize: 12, color: "#888" },
//   taskCompleted: { textDecorationLine: "line-through", color: "#888" },
//   repeatText: { fontSize: 12, color: "#888", marginRight: 8 },
//   sectionTitle: { flexDirection: "row", justifyContent:"space-between", margin:5}
// });

// export default Todo;
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
  Easing
} from "react-native";
import WeekView from "./WeekView/WeekView";
import ToggleTabs from "./ToggleTabs/ToggleTabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // ✅ 날짜 선택 라이브러리

interface Task {
  id: string;
  title: string;
  dueDate: string; // 날짜
  memo: string; // 메모
  alarmTime: string; // 시간 알림
  isImportant: boolean;
  isCompleted: boolean;
  category: { title: string; color: string };
}
const categories = [
  { title: "일반", color: "#B0BEC5" },
  { title: "업무", color: "#FF7043" },
  { title: "개인", color: "#8E24AA" },
  { title: "운동", color: "#26A69A" },
  { title: "공부", color: "#42A5F5" },
];
const Todo = () => {

  const [tasks, setTasks] = useState<Record<string, Task[]>>({}); // 📌 날짜별 할 일 저장
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const scaleAnim = useState(new Animated.Value(0))[0]; // 크기 애니메이션
  const leftAnim = useState(new Animated.Value(0))[0]; // '할일' 버튼 왼쪽 이동 애니메이션
  const upAnim = useState(new Animated.Value(0))[0]; // '루틴' 버튼 위쪽 이동 애니메이션
  const opacityAnim = useState(new Animated.Value(0))[0]; // 투명도 애니메이션
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // ✅ 달력 모달 상태
  const [selectedCategory, setSelectedCategory] = useState(categories[0]); // 기본 카테고리
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null); // ✅ 선택된 할 일 ID 저장
  const [selectedTab, setSelectedTab] = useState("할 일");

  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: "",
    memo: "",
    alarmTime: "",
    category: categories[0],
  });

  
  // 📌 날짜 포맷 (YYYY-MM-DD)
  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 📌 날짜 선택
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  // 📌 날짜 선택 시 처리
  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date);
    setNewTask((prev) => ({
      ...prev,
      dueDate: formatDateKey(date),
    }));
    setDatePickerVisibility(false); // 날짜 선택 후 달력 닫기
  };

  // 📌 할 일 추가
  const addTask = () => {
    if (newTask.title.trim() === "") return;
    const dateKey = formatDateKey(selectedDate);
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      dueDate: newTask.dueDate || formatDateKey(selectedDate),
      memo: newTask.memo,
      alarmTime: newTask.alarmTime,
      isImportant: false,
      isCompleted: false,
      category: newTask.category,
    };

    setTasks((prevTasks) => ({
      ...prevTasks,
      [dateKey]: [...(prevTasks[dateKey] || []), task],
    }));

    setNewTask({ title: "", dueDate: "", memo: "", alarmTime: "", category: categories[0] });
    setModalVisible(false);
  };

  // 📌 할 일의 카테고리 변경
  const changeTaskCategory = (taskId: string, newCategory: { title: string; color: string }) => {
    const dateKey = formatDateKey(selectedDate);
    setTasks((prevTasks) => ({
      ...prevTasks,
      [dateKey]: prevTasks[dateKey]?.map((task) =>
        task.id === taskId ? { ...task, category: newCategory } : task
      ) || [],
    }));
    setCategoryModalVisible(false);
  };

  // ✅ 완료 체크
  const toggleCompleted = (id: string) => {
    const dateKey = formatDateKey(selectedDate);
    setTasks((prevTasks) => ({
      ...prevTasks,
      [dateKey]: prevTasks[dateKey].map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      ),
    }));
  };

  // ✅ 중요 태스크를 위로 정렬
  const sortedTasks = [...(tasks[formatDateKey(selectedDate)] || [])].sort((a, b) =>
    a.isImportant === b.isImportant ? 0 : a.isImportant ? -1 : 1
  );

  // ✅ 중요 토글 (책갈피 아이콘)
  const toggleImportant = (id: string) => {
    const dateKey = formatDateKey(selectedDate);
    setTasks((prevTasks) => ({
      ...prevTasks,
      [dateKey]: prevTasks[dateKey].map((task) =>
        task.id === id ? { ...task, isImportant: !task.isImportant } : task
      ),
    }));
  };
   // 📌 + 버튼 클릭 시 애니메이션 실행
   const toggleFab = () => {
    if (isFabOpen) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(leftAnim, {
          toValue: 0, // 다시 원래 위치로
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(upAnim, {
          toValue: 0, // 다시 원래 위치로
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
          toValue: -70, // 왼쪽으로 이동
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(upAnim, {
          toValue: -70, // 위쪽으로 이동
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

        {/* ✅ 토글 버튼 추가 */}
       <View style={styles.section}>
          <ToggleTabs onSelect={setSelectedTab} />
        </View>

        {/* ✅ 입력창 (할 일 추가 버튼)
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Feather name="plus-circle" size={30} color="#6A0DAD" />
        </TouchableOpacity> */}
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
            <Text>{item.category.title}</Text>
            <View style={styles.taskCard}>
              {/* ✅ 체크박스 */}
              <TouchableOpacity onPress={() => toggleCompleted(item.id)}>
                <MaterialIcons
                  name={item.isCompleted ? "check-box" : "check-box-outline-blank"}
                  size={24}
                  color={item.isCompleted ? "#6A0DAD" : "#B0B0B0"}
                />
              </TouchableOpacity>

              {/* ✅ 텍스트 정보 */}
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, item.isCompleted && styles.taskCompleted]}>
                  {item.title}
                </Text>
                <Text style={styles.taskDetail}>{item.dueDate}</Text>
              </View>

              {/* ✅ 중요 버튼 */}
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
  {/* ✅ 할 일 추가 버튼 */}
  <View style={styles.fabContainer}>
        {/* 루틴 버튼 (위쪽으로 이동하는 애니메이션 적용) */}
        {isFabOpen && (
          <Animated.View
            style={[
              styles.fabItem,
              { transform: [{ translateY: upAnim }], opacity: opacityAnim },
            ]}
          >
            <TouchableOpacity style={styles.fabButton} onPress={() => console.log("루틴 추가")}>
            <Text style={{color: "white", fontWeight: "bold"}}>루틴</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        {/* 할 일 버튼 (뒤에서 왼쪽으로 이동하는 애니메이션 적용) */}
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
              <Text style={{color: "white", fontWeight: "bold"}}>할 일</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* + 버튼 */}
        <TouchableOpacity style={styles.fabMain} onPress={toggleFab}>
          <Feather name={isFabOpen ? "x" : "plus"} size={30} color="white" />
        </TouchableOpacity>
      </View>
      {/* ✅ 할 일 추가 모달 */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <View style={styles.categoryModalContent}>
          <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              {/* ✅ 원형 버튼 (카테고리 선택) */}
              <TouchableOpacity
                style={[styles.categoryCircle, { backgroundColor: item.category.color }]}
                onPress={() => {
                  setSelectedTaskId(item.id);
                  setCategoryModalVisible(true);
                }}
              />

              {/* ✅ 할 일 정보 */}
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, item.isCompleted && styles.taskCompleted]}>
                  {item.title}
                </Text>
                <Text style={styles.taskDetail}>{item.dueDate}</Text>
              </View>
            </View>
          )}
        />
          </View>
            <TextInput
              style={styles.input}
              placeholder="할 일 제목"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            />

            {/* ✅ 날짜 선택 버튼 */}
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setDatePickerVisibility(true)}
            >
              <Feather name="calendar" size={20} color="black" />
              <Text style={styles.datePickerText}>
                {newTask.dueDate ? newTask.dueDate : formatDateKey(selectedDate)}
              </Text>
            </TouchableOpacity>

            {/* ✅ 날짜 선택 모달 */}
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirmDate}
              onCancel={() => setDatePickerVisibility(false)}
              display="inline"
            />

            <TextInput
              style={styles.input}
              placeholder="메모"
              value={newTask.memo}
              onChangeText={(text) => setNewTask({ ...newTask, memo: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="시간 알림"
              value={newTask.alarmTime}
              onChangeText={(text) => setNewTask({ ...newTask, alarmTime: text })}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={addTask}>
                <Text style={styles.saveButtonText}>저장하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
       
      {/* ✅ 카테고리 선택 모달 유지 (원형 버튼 추가) */}
      <Modal visible={categoryModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.categoryModalContent}>
            <Text style={styles.modalTitle}>카테고리 선택</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.title}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => {
                    if (selectedTaskId) changeTaskCategory(selectedTaskId, item);
                  }}
                >
                  {/* ✅ 원형 버튼 추가 */}
                  <View style={[styles.categoryCircle, { backgroundColor: item.color }]} />
                  <Text style={styles.categoryText}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
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
    right: 0, // 초기 위치는 + 버튼과 동일
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
  fabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  categoryModalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    maxHeight: "50%",
  },
  categoryButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  categoryItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  body: { flex: 1, padding: 16 },
  section: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  bottnSection: { flexDirection: "row" },
  todayText: { fontSize: 18, fontWeight: "bold" },
  button: { padding: 8, marginLeft: 10 },
  buttonText: { fontSize: 14, fontWeight: "600" },
  inputContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 5 },
  taskCard: { flexDirection: "row", alignItems: "center", padding: 12, marginBottom: 8, backgroundColor: "white", borderRadius: 8 },
  taskInfo: { flex: 1, marginLeft: 10 },
  taskTitle: { fontSize: 16, fontWeight: "bold" },
  taskDetail: { fontSize: 12, color: "#888" },
  taskCompleted: { textDecorationLine: "line-through", color: "#888" },
  repeatText: { fontSize: 12, color: "#888", marginRight: 8 },
  sectionTitle: { flexDirection: "row", justifyContent:"space-between", margin:5},
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  saveButton: {flex: 1, backgroundColor: "black", padding: 12, borderRadius: 8, alignItems: "center", marginRight: 5},
  saveButtonText: {color: "white"},
  cancelButton: {flex: 1, backgroundColor: "white", borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, alignItems: "center", },
  modalContainer: {flex: 1,justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)", },
  modalContent: { width: "80%", backgroundColor: "white", padding: 20, borderRadius: 15, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,

  },
  datePickerText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  categoryCircle: { width: 24, height: 24, borderRadius: 12, marginRight: 10 },
});

export default Todo;
