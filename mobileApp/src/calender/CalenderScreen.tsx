import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  SafeAreaView,
  Pressable,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import AddScheduleModal from '../modal/AddScheduleModal';

// 타입 정의
type DayInfo = {
  date: number | null;
  isToday?: boolean;
  isSelected?: boolean;
  scheduleColors: string[];
};

type Schedule = {
  id: string;
  title: string;
  time: string;
  detail?: string;
  lunarDate?: string;
  color?: string;
  date: string; // 시작 날짜 (YYYY-MM-DD)
  endDate?: string; // 종료 날짜 (YYYY-MM-DD, 없으면 단일 이벤트)
};

// 날짜 포맷 함수
const formatDate = (year: number, month: number, day: number) => {
  const m = month < 10 ? '0' + month : month.toString();
  const d = day < 10 ? '0' + day : day.toString();
  return `${year}-${m}-${d}`;
};

// 달력 매트릭스 생성 함수
function buildCalendarMatrix(
  year: number,
  month: number,
  selectedDay: number,
  schedules: Schedule[]
): DayInfo[][] {
  const matrix: DayInfo[][] = [];
  const firstDayIndex = new Date(year, month - 1, 1).getDay();
  const totalDays = new Date(year, month, 0).getDate();
  const realToday = new Date();

  let currentDay = 1;
  for (let row = 0; row < 6; row++) {
    const weekRow: DayInfo[] = [];
    for (let col = 0; col < 7; col++) {
      if ((row === 0 && col < firstDayIndex) || currentDay > totalDays) {
        weekRow.push({ date: null, scheduleColors: [] });
      } else {
        const formattedDate = formatDate(year, month, currentDay);
        const schedulesForDay = schedules.filter(s => {
          if (s.endDate) {
            // 종료 날짜가 있다면 날짜 범위 내에 있는지 확인
            return formattedDate >= s.date && formattedDate <= s.endDate;
          }
          return s.date === formattedDate;
        });
        const scheduleColors = schedulesForDay.map(s => s.color || '#ccc');
        const isToday =
          year === realToday.getFullYear() &&
          month === realToday.getMonth() + 1 &&
          currentDay === realToday.getDate();

        weekRow.push({
          date: currentDay,
          isToday,
          isSelected: currentDay === selectedDay,
          scheduleColors,
        });
        currentDay++;
      }
    }
    matrix.push(weekRow);
  }
  return matrix;
}

const CalendarScreen: React.FC = () => {
  // 날짜 관련 상태: 오늘 날짜를 기본값으로 사용
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number>(now.getDate());

  // Picker 모달 상태
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);
  const [pickerYear, setPickerYear] = useState<number>(selectedYear);
  const [pickerMonth, setPickerMonth] = useState<number>(selectedMonth);

  // 일정 목록 상태 (예시 데이터 포함)
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      title: '팀 미팅',
      time: '10:00 ~ 11:00',
      detail: '프로젝트 진행 상황 공유',
      lunarDate: '음력 3월 12일',
      color: '#bdbdbd',
      date: '2025-03-10',
    },
    {
      id: '2',
      title: '점심 약속',
      time: '12:30',
      detail: '회사 근처 식당 예약 완료',
      color: '#4caf50',
      date: '2025-03-10',
    },
    {
      id: '3',
      title: '개인 공부',
      time: '15:00 ~ 17:00',
      detail: 'React Native 복습',
      color: '#ffa726',
      date: '2025-03-10',
      endDate: '2025-03-11', // 2일간 진행
    },
    {
      id: '4',
      title: '친구 모임',
      time: '19:00',
      detail: '저녁 식사',
      color: '#ff5252',
      date: '2025-03-15',
    },
    {
      id: '5',
      title: '프로젝트 발표',
      time: '09:00 ~ 11:00',
      detail: '최종 발표',
      color: '#673ab7',
      date: '2025-03-19',
      endDate: '2025-03-21', // 3일간 진행
    },
  ]);

  // 일정 추가 모달 표시 상태
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // 일정 상세 모달 상태
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // 달력 데이터 생성, 선택된 날짜 문자열, 해당 날짜의 일정 필터링
  const calendarData = buildCalendarMatrix(selectedYear, selectedMonth, selectedDay, schedules);
  const selectedDateString = formatDate(selectedYear, selectedMonth, selectedDay);
  const filteredSchedules = schedules.filter(s => {
    if (s.endDate) {
      return selectedDateString >= s.date && selectedDateString <= s.endDate;
    }
    return s.date === selectedDateString;
  });

  // 새 일정 추가: AddScheduleModal에서 전달받은 데이터를 처리
  const handleSaveNewSchedule = (data: {
    title: string;
    time: string;
    detail: string;
    color: string;
    endDate: string;
    notificationEnabled: boolean;
  }) => {
    const newSchedule: Schedule = {
      id: Date.now().toString(),
      title: data.title,
      time: data.time || '시간 미정',
      detail: data.detail || '세부 내용 없음',
      lunarDate: '음력 정보 없음',
      color: data.color,
      date: selectedDateString,
    };
    if (data.endDate.trim()) {
      newSchedule.endDate = data.endDate.trim();
    }
    // 알림(notificationEnabled) 관련 로직은 추가로 구현 가능
    setSchedules(prev => [...prev, newSchedule]);
    setModalVisible(false);
  };

  // Picker 적용: 선택한 연/월을 달력에 반영
  const applyPicker = () => {
    setSelectedYear(pickerYear);
    setSelectedMonth(pickerMonth);
    setSelectedDay(1);
    setShowMonthPicker(false);
  };

  // 오늘로 이동
  const goToToday = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth() + 1);
    setSelectedDay(today.getDate());
  };

  // 일정 상세 모달 열기
  const handlePressSchedule = (item: Schedule) => {
    setSelectedSchedule(item);
    setDetailModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logoText}>logo</Text>
        <View style={styles.iconGroup}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings-outline" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Header: 연/월 선택 및 TODAY 버튼 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            setPickerYear(selectedYear);
            setPickerMonth(selectedMonth);
            setShowMonthPicker(true);
          }}
        >
          <Text style={styles.monthText}>
            {selectedYear}년 {selectedMonth}월
          </Text>
        </TouchableOpacity>
        <View style={styles.headerButtonGroup}>
          <TouchableOpacity style={styles.outlinedButton} onPress={goToToday}>
            <Text style={styles.outlinedButtonText}>TODAY</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Picker Modal */}
      <Modal visible={showMonthPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>연/월 선택</Text>
            <View style={styles.pickerRow}>
              <Picker
                selectedValue={pickerYear}
                style={styles.picker}
                onValueChange={val => setPickerYear(val)}
              >
                {Array.from({ length: 11 }, (_, i) => i + 2020).map(year => (
                  <Picker.Item key={year} label={`${year}`} value={year} />
                ))}
              </Picker>
              <Picker
                selectedValue={pickerMonth}
                style={styles.picker}
                onValueChange={val => setPickerMonth(val)}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <Picker.Item key={month} label={`${month}월`} value={month} />
                ))}
              </Picker>
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalButton} onPress={applyPicker}>
                <Text style={styles.modalButtonText}>적용</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setShowMonthPicker(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <View style={styles.weekRow}>
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>
        {calendarData.map((week, rowIndex) => (
          <View key={`week-${rowIndex}`} style={styles.weekRow}>
            {week.map((dayInfo, colIndex) => {
              if (!dayInfo.date) {
                return <View key={`empty-${colIndex}`} style={styles.dayCell} />;
              }
              const { scheduleColors } = dayInfo;
              const colorCount = scheduleColors.length;
              return (
                <TouchableOpacity
                  key={`day-${rowIndex}-${colIndex}`}
                  style={[styles.dayCell, dayInfo.isSelected && styles.daySelected]}
                  onPress={() => setSelectedDay(dayInfo.date!)}
                >
                  {colorCount > 0 && (
                    <View style={styles.splitColorContainer}>
                      {colorCount === 1 ? (
                        <View style={[styles.stackedColorBar, { backgroundColor: scheduleColors[0], top: 0, bottom: 0 }]} />
                      ) : (
                        (() => {
                          const displayedCount = Math.min(colorCount, 4);
                          const cellHeight = cellSize;
                          const overlap = 10;
                          const blockHeight = (cellHeight + (displayedCount - 1) * overlap) / displayedCount;
                          const step = blockHeight - overlap;
                          return scheduleColors.slice(0, displayedCount).map((color, i) => (
                            <View
                              key={i}
                              style={[styles.stackedColorBar, { backgroundColor: color, top: i * step, height: blockHeight }]}
                            />
                          ));
                        })()
                      )}
                      {colorCount > 4 && (
                        <View style={styles.moreIndicator}>
                          <Text style={styles.moreIndicatorText}>+{colorCount - 4}</Text>
                        </View>
                      )}
                    </View>
                  )}
                  <Text style={[styles.dayText, dayInfo.isToday && styles.todayText]}>
                    {dayInfo.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* 일정 리스트 헤더 */}
      <View style={styles.scheduleHeader}>
        <Text style={styles.scheduleHeaderText}>
          {selectedDateString} 일정 ({filteredSchedules.length})
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>일정 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 일정 리스트 */}
      <FlatList
        data={filteredSchedules}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => handlePressSchedule(item)} style={styles.scheduleCard}>
            <View style={styles.scheduleCardLeft}>
              <View style={[styles.scheduleColorDot, { backgroundColor: item.color }]} />
              <View style={styles.scheduleTextGroup}>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                {item.lunarDate && <Text style={styles.scheduleSubText}>{item.lunarDate}</Text>}
              </View>
            </View>
            <Text style={styles.scheduleTime}>{item.time}</Text>
          </Pressable>
        )}
        style={styles.scheduleList}
      />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home-outline" size={24} color="#666" />
          <Text style={styles.tabItemText}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="calendar-outline" size={24} color="#666" />
          <Text style={styles.tabItemText}>달력</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="checkmark-done-outline" size={24} color="#666" />
          <Text style={styles.tabItemText}>목표</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.tabItemText}>프로필</Text>
        </TouchableOpacity>
      </View>

      {/* 일정 상세 모달 */}
      <Modal visible={detailModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContainer}>
            {selectedSchedule && (
              <>
                <Text style={styles.detailModalTitle}>{selectedSchedule.title}</Text>
                <Text style={styles.detailModalSubText}>{selectedSchedule.time}</Text>
                <Text style={styles.detailModalSubText}>{selectedSchedule.lunarDate}</Text>
                <Text style={styles.detailModalDesc}>{selectedSchedule.detail}</Text>
              </>
            )}
            <TouchableOpacity
              style={[styles.modalButton, { alignSelf: 'flex-end', marginTop: 16 }]}
              onPress={() => setDetailModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AddScheduleModal: 별도로 분리한 일정 추가 모달 */}
      <AddScheduleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveNewSchedule}
        defaultYear={selectedYear}
        defaultMonth={selectedMonth}
        defaultDay={selectedDay}
      />
    </SafeAreaView>
  );
};

export default CalendarScreen;

const { width } = Dimensions.get('window');
const cellMargin = 4;
const calendarPadding = 16;
const availableWidth = width - 2 * calendarPadding - 6 * cellMargin;
const cellSize = availableWidth / 7;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  logoText: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  iconGroup: { flexDirection: 'row' },
  iconButton: { marginLeft: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  monthText: { fontSize: 18, fontWeight: '600' },
  headerButtonGroup: { flexDirection: 'row', marginLeft: 'auto' },
  outlinedButton: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  outlinedButtonText: { fontSize: 14, color: '#333' },
  calendarContainer: { padding: 16 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDayCell: { flex: 1, alignItems: 'center', marginBottom: 8 },
  weekDayText: { fontSize: 14, fontWeight: '600', color: '#888' },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    margin: cellMargin,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: { fontSize: 14, color: '#333', zIndex: 2 },
  todayText: { color: '#d9534f', fontWeight: 'bold' },
  daySelected: { borderWidth: 2, borderColor: '#5c6ef8', borderRadius: 8 },
  splitColorContainer: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  stackedColorBar: { position: 'absolute', left: 0, right: 0, opacity: 0.5, borderRadius: 8 },
  moreIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  moreIndicatorText: { fontSize: 10, color: '#fff' },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  scheduleHeaderText: { fontSize: 16, fontWeight: 'bold' },
  addButton: { backgroundColor: '#5c6ef8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addButtonText: { color: '#fff', fontSize: 14 },
  scheduleList: { paddingHorizontal: 16, marginTop: 8 },
  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    justifyContent: 'space-between',
  },
  scheduleCardLeft: { flexDirection: 'row', alignItems: 'center' },
  scheduleColorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  scheduleTextGroup: { flexDirection: 'column' },
  scheduleTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  scheduleSubText: { fontSize: 12, color: '#999' },
  scheduleTime: { fontSize: 14, color: '#555' },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#ddd' },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabItemText: { fontSize: 12, marginTop: 2, color: '#666' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: '#fff', borderRadius: 8, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  picker: { flex: 1 },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, fontSize: 14, marginBottom: 8 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  modalButton: { backgroundColor: '#5c6ef8', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginLeft: 8 },
  modalButtonText: { color: '#fff', fontSize: 14 },
  colorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  colorRowLabel: { fontSize: 14, marginRight: 8 },
  colorInput: { flex: 1, borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14 },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  switchLabel: { fontSize: 14, marginRight: 8 },
  detailModalContainer: { width: '80%', backgroundColor: '#fff', borderRadius: 8, padding: 16 },
  detailModalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  detailModalSubText: { fontSize: 14, color: '#666', marginBottom: 4 },
  detailModalDesc: { fontSize: 14, color: '#333', marginTop: 8 },
});