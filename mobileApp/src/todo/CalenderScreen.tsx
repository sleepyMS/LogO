// mobileApp/src/todo/CalendarScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Animated,
  PanResponder,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');
const SIDE_MARGIN = 16;
const CELL_SIZE = (width - SIDE_MARGIN * 2) / 7;
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const initialEvents = [
  { id: '1', date: '2024-03-03', title: '회의', color: 'black' },
  { id: '2', date: '2024-03-11', title: '약속', color: 'blue' },
  { id: '3', date: '2024-03-18', title: '약속', color: 'blue' },
  { id: '4', date: '2024-03-19', title: '대만 여행', color: 'pink' },
];

// 달력 데이터 생성
function generateCalendar(year: number, month: number) {
  const days = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = new Date(firstDayOfMonth);
  // 해당 주의 일요일로 조정
  startDay.setDate(startDay.getDate() - startDay.getDay());

  for (let i = 0; i < 42; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);

    const yyyy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');

    days.push({
      dateObj: d,
      dateStr: `${yyyy}-${mm}-${dd}`,
    });
  }
  return days;
}

export default function CalendarScreen() {
  const today = new Date();

  // 달력 상태
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // 일정
  const [events, setEvents] = useState(initialEvents);

  // 선택 날짜 -> 일정 목록 표시
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);

  // 연/월 모달
  const [pickerVisible, setPickerVisible] = useState(false);

  // 달력 데이터(42칸)
  const calendarDays = generateCalendar(year, month);

  // ========== 드래그 & 드롭(오버레이) ==========
  const [isDragging, setIsDragging] = useState(false);
  const [draggingEvent, setDraggingEvent] = useState<any>(null);

  // 이벤트 내부에서 눌린 지점 보정
  const dragOffset = useRef({ x: 0, y: 0 }).current;

  // 오버레이 위치(드래그 이동) 애니메이션
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // 호버 중인 셀 인덱스
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  // 달력 Wrapper 실제 위치
  const [calendarPos, setCalendarPos] = useState({ x: 0, y: 0 });
  const calendarRef = useRef<View>(null);

  // 달 전환 애니메이션
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 달력 위치 측정 (onLayout 이후 measureInWindow)
  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.measureInWindow((x, y, w, h) => {
        setCalendarPos({ x, y });
      });
    }
  }, [year, month]);

  // ========== 부모 PanResponder (달력 좌우 스와이프) ==========
  const monthSwipeResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gesture) => {
        // 일정 드래그 중이면 달력 스와이프 막기
        if (isDragging) return false;
        return Math.abs(gesture.dx) > 30;
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 60) {
          // 오른쪽 스와이프 -> 이전 달
          Animated.timing(slideAnim, {
            toValue: width,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setMonth((prev) => {
              if (prev === 0) {
                setYear((y) => y - 1);
                return 11;
              }
              return prev - 1;
            });
            slideAnim.setValue(-width);
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          });
        } else if (gesture.dx < -60) {
          // 왼쪽 스와이프 -> 다음 달
          Animated.timing(slideAnim, {
            toValue: -width,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setMonth((prev) => {
              if (prev === 11) {
                setYear((y) => y + 1);
                return 0;
              }
              return prev + 1;
            });
            slideAnim.setValue(width);
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          });
        }
      },
    })
  ).current;

  // ========== 오버레이 PanResponder (실제 드래그) ==========
  const overlayDragResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,

      onPanResponderMove: (evt, gesture) => {
        // 절대좌표에서 dragOffset만큼 빼서 실제 x,y 구하기
        const curX = gesture.moveX - dragOffset.x;
        const curY = gesture.moveY - dragOffset.y;
        pan.setValue({ x: curX, y: curY });

        // 달력 그리드 내부 (row, col) 계산
        const gridX = gesture.moveX - calendarPos.x - dragOffset.x - SIDE_MARGIN;
        const gridY = gesture.moveY - calendarPos.y - dragOffset.y;

        const row = Math.floor(gridY / CELL_SIZE);
        const col = Math.floor(gridX / CELL_SIZE);
        const idx = row * 7 + col;

        // 범위 유효성 체크
        if (idx >= 0 && idx < calendarDays.length && row >= 0 && col >= 0) {
          setHoveredIndex(idx);
        } else {
          setHoveredIndex(-1);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (!draggingEvent) {
          resetDrag();
          return;
        }

        if (hoveredIndex >= 0 && hoveredIndex < calendarDays.length) {
          // 유효 셀 범위이면 -> 이벤트 날짜 갱신
          const dropDateObj = calendarDays[hoveredIndex].dateObj;
          const yyyy = dropDateObj.getFullYear();
          const mm = (dropDateObj.getMonth() + 1).toString().padStart(2, '0');
          const dd = dropDateObj.getDate().toString().padStart(2, '0');

          const newDateStr = `${yyyy}-${mm}-${dd}`;

          const updatedEvents = events.map((ev) =>
            ev.id === draggingEvent.id ? { ...ev, date: newDateStr } : ev
          );
          setEvents(updatedEvents);
        }
        // 복귀/투명도 애니메이션 후 초기화
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
          Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: false }),
        ]).start(() => {
          resetDrag();
        });
      },
    })
  ).current;

  /** 드래그 시작 */
  const startDrag = (eventData: any, pageX: number, pageY: number, localX: number, localY: number) => {
    setDraggingEvent(eventData);
    setIsDragging(true);
    setHoveredIndex(-1);

    // 이벤트 내부에서 눌린 지점 오프셋
    dragOffset.x = localX;
    dragOffset.y = localY;

    // 시작 위치
    pan.setValue({ x: pageX - localX, y: pageY - localY });

    // 살짝 확대/투명도
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.08, useNativeDriver: false }),
      Animated.timing(opacity, { toValue: 0.9, duration: 150, useNativeDriver: false }),
    ]).start();
  };

  /** 드래그 상태 초기화 */
  const resetDrag = () => {
    setIsDragging(false);
    setDraggingEvent(null);
    setHoveredIndex(-1);
    pan.setValue({ x: 0, y: 0 });
  };

  return (
    <View style={styles.container} {...monthSwipeResponder.panHandlers}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Logo</Text>
        <View style={styles.headerIcons}>
          <Icon name="bell" size={22} style={{ marginRight: 12 }} />
          <Icon name="settings" size={22} />
        </View>
      </View>

      {/* 연/월 / TODAY 버튼 */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => setPickerVisible(true)}>
          <Text style={styles.yearMonthText}>
            {year}년 {month + 1}월
          </Text>
        </TouchableOpacity>
        <View style={styles.topButtons}>
          <TouchableOpacity style={styles.outlinedBtn}>
            <Text>달력 보기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filledBtn}
            onPress={() => {
              setYear(today.getFullYear());
              setMonth(today.getMonth());
              setSelectedDate(today.toISOString().split('T')[0]);
            }}
          >
            <Text style={{ color: '#fff' }}>TODAY</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 연/월 Picker 모달 */}
      <Modal visible={pickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={year} onValueChange={(val) => setYear(val)}>
              {[...Array(10)].map((_, i) => {
                const y = 2020 + i;
                return <Picker.Item key={y} label={`${y}년`} value={y} />;
              })}
            </Picker>
            <Picker selectedValue={month} onValueChange={(val) => setMonth(val)}>
              {[...Array(12)].map((_, i) => (
                <Picker.Item key={i} label={`${i + 1}월`} value={i} />
              ))}
            </Picker>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Text style={{ textAlign: 'center', marginTop: 10 }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 요일 표시 */}
      <View style={styles.weekRow}>
        {DAYS.map((day) => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      {/* 달력 42칸 */}
      <Animated.View
        ref={calendarRef}
        style={[
          styles.calendarWrapper,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {calendarDays.map((day, index) => {
          const { dateObj, dateStr } = day;
          const dayEvents = events.filter((ev) => ev.date === dateStr);

          const isOtherMonth = dateObj.getMonth() !== month;
          const isHovered = index === hoveredIndex;

          return (
            <View
              key={index}
              style={[styles.cell, isHovered && styles.hoveredCell]}
            >
              <Pressable
                style={{ flex: 1 }}
                onPress={() => {
                  // 다른 달의 날짜라면 달 이동
                  if (isOtherMonth) {
                    if (dateObj.getMonth() > month || (month === 11 && dateObj.getMonth() === 0)) {
                      setMonth((m) => (m === 11 ? 0 : m + 1));
                      if (month === 11) setYear((y) => y + 1);
                    } else {
                      setMonth((m) => (m === 0 ? 11 : m - 1));
                      if (month === 0) setYear((y) => y - 1);
                    }
                  } else {
                    // 같은 달이면 해당 날짜 선택
                    setSelectedDate(dateStr);
                  }
                }}
              >
                <Text style={[styles.dateText, isOtherMonth && { color: '#ccc' }]}>
                  {dateObj.getDate()}
                </Text>
              </Pressable>

              {/* 이벤트 목록 */}
              {dayEvents.map((ev) => {
                // 드래그 중인 이벤트라면, 오버레이로만 표시 -> 여기서는 숨긴다.
                if (ev.id === draggingEvent?.id && isDragging) return null;
                return (
                  <Pressable
                    key={ev.id}
                    style={[styles.eventBlock, { backgroundColor: ev.color }]}
                    // onPressIn 시점에 바로 드래그 시작
                    onPressIn={(e) => {
                      const pageX = e.nativeEvent.pageX;
                      const pageY = e.nativeEvent.pageY;
                      const localX = e.nativeEvent.locationX;
                      const localY = e.nativeEvent.locationY;
                      startDrag(ev, pageX, pageY, localX, localY);
                    }}
                  >
                    <Text style={styles.eventText} numberOfLines={1}>
                      {ev.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </Animated.View>

      {/* 오늘의 일정 */}
      <View style={styles.todayHeader}>
        <Text style={styles.todayTitle}>오늘의 일정</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text>일정 추가</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scheduleList}>
        {events
          .filter((ev) => ev.date === selectedDate)
          .map((ev) => (
            <View key={ev.id} style={styles.scheduleCard}>
              <View style={styles.scheduleRow}>
                <View style={[styles.dot, { backgroundColor: ev.color }]} />
                <Text style={styles.scheduleTitle}>{ev.title}</Text>
              </View>
            </View>
          ))}
      </ScrollView>

      {/* 하단 탭 바 */}
      <View style={styles.bottomTab}>
        <Icon name="calendar" size={24} />
        <Icon name="check-square" size={24} />
        <Icon name="target" size={24} />
        <Icon name="file-text" size={24} />
      </View>

      {/* 드래그 중인 아이템 오버레이 */}
      {isDragging && draggingEvent && (
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'box-none' }]}>
          <Animated.View
            {...overlayDragResponder.panHandlers}
            style={[
              {
                position: 'absolute',
                width: CELL_SIZE,
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 6,
                alignItems: 'center',
                zIndex: 999,
                backgroundColor: draggingEvent.color,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 8,
              },
              {
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y },
                  { scale: scale },
                ],
                opacity: opacity,
              },
            ]}
          >
            <Text style={styles.eventText} numberOfLines={1}>
              {draggingEvent.title}
            </Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

// ==================== 스타일 ======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
  },
  logoText: { fontSize: 28, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row' },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  yearMonthText: { fontSize: 20, fontWeight: '600' },
  topButtons: { flexDirection: 'row' },
  outlinedBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  filledBtn: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  weekRow: {
    flexDirection: 'row',
    marginHorizontal: SIDE_MARGIN,
    marginBottom: 6,
    justifyContent: 'space-around',
  },
  weekDay: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontWeight: '500',
    color: '#666',
  },
  calendarWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: SIDE_MARGIN,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: '#ddd',
    padding: 2,
  },
  hoveredCell: {
    backgroundColor: '#fff3e8',
  },
  dateText: {
    fontSize: 12,
    marginBottom: 2,
  },
  eventBlock: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 2,
    alignItems: 'center',
  },
  eventText: {
    fontSize: 10,
    color: '#fff',
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  scheduleList: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  scheduleCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10,
  },
});