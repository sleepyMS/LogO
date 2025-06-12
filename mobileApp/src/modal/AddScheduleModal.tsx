import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  TextInput,
  Switch,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

type AddScheduleModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    repeatOption: string;
    memoText: string;
    alarmTime: string;
    allDay: boolean;
  }) => void;
  defaultYear: number;
  defaultMonth: number;
  defaultDay: number;
};

/**
 * 날짜를 "YYYY-MM-DD" 형태로 포맷
 */
function formatDate(year: number, month: number, day: number) {
  const yy = year.toString();
  const mm = month < 10 ? '0' + month : month.toString();
  const dd = day < 10 ? '0' + day : day.toString();
  return `${yy}-${mm}-${dd}`;
}

/**
 * "YYYY-MM-DD"를 "M월 D일 (요일)" 형태로 변환
 */
function formatDisplay(dateString: string) {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay(); // 0=일,1=월,2=화,...
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return `${m}월 ${d}일 (${dayNames[dayOfWeek]})`;
}

/**
 * 시간을 "HH:mm" 형태로 포맷 (예: 09:00)
 */
function formatTime(hour: number, minute: number) {
  const hh = hour < 10 ? '0' + hour : hour.toString();
  const mm = minute < 10 ? '0' + minute : minute.toString();
  return `${hh}:${mm}`;
}

const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  visible,
  onClose,
  onSave,
  defaultYear,
  defaultMonth,
  defaultDay,
}) => {
  // 기본 상태
  const [title, setTitle] = useState('');

  const [startDate, setStartDate] = useState(formatDate(defaultYear, defaultMonth, defaultDay));
  const [endDate, setEndDate] = useState(formatDate(defaultYear, defaultMonth, defaultDay));
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');

  const [allDay, setAllDay] = useState(false);

  // 날짜·시간 피커 모달 상태
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);
  const [isPickingStart, setIsPickingStart] = useState(true);
  const [tempYear, setTempYear] = useState(defaultYear);
  const [tempMonth, setTempMonth] = useState(defaultMonth);
  const [tempDay, setTempDay] = useState(defaultDay);
  const [tempHour, setTempHour] = useState(8);
  const [tempMinute, setTempMinute] = useState(0);

  // 반복 옵션 상태
  const [repeatOption, setRepeatOption] = useState('없음');
  const [repeatModalVisible, setRepeatModalVisible] = useState(false);
  const repeatOptions = ['없음', '매일', '매주', '매월', '매년'];

  // 메모 상태
  const [memoModalVisible, setMemoModalVisible] = useState(false);
  const [memoText, setMemoText] = useState('');

  // 알림 상태
  const [alarmModalVisible, setAlarmModalVisible] = useState(false);
  const [alarmTime, setAlarmTime] = useState('08:00');

  useEffect(() => {
    if (visible) {
      setTitle('');
      const initDate = formatDate(defaultYear, defaultMonth, defaultDay);
      setStartDate(initDate);
      setEndDate(initDate);
      setStartTime('08:00');
      setEndTime('09:00');
      setMemoText('');
      setRepeatOption('없음');
      setAlarmTime('08:00');
      setAllDay(false);
    }
  }, [visible, defaultYear, defaultMonth, defaultDay]);

  /**
   * 날짜/시간 클릭 시 피커 모달 오픈
   */
  const handlePressDateTime = (isStart: boolean) => {
    setIsPickingStart(isStart);
    const dateString = isStart ? startDate : endDate;
    const timeString = isStart ? startTime : endTime;
    const [y, m, d] = dateString.split('-').map(Number);
    const [h, min] = timeString.split(':').map(Number);
    setTempYear(y);
    setTempMonth(m);
    setTempDay(d);
    setTempHour(h);
    setTempMinute(min);
    setDateTimePickerVisible(true);
  };

  const applyDateTime = () => {
    const newDate = formatDate(tempYear, tempMonth, tempDay);
    const newTime = formatTime(tempHour, tempMinute);
    if (isPickingStart) {
      setStartDate(newDate);
      setStartTime(newTime);
    } else {
      setEndDate(newDate);
      setEndTime(newTime);
    }
    setDateTimePickerVisible(false);
  };

  const handleSave = () => {
    onSave({
      title,
      startDate,
      startTime,
      endDate,
      endTime,
      repeatOption,
      memoText,
      alarmTime,
      allDay,
    });
    onClose();
  };

  // 메뉴 동작 (예시)
  const handleMemoPress = () => setMemoModalVisible(true);
  const handleAlarmPress = () => setAlarmModalVisible(true);
  const handleCopyPress = () => {
    console.log('내일 하기 / 오늘로 붙여넣기 기능');
  };
  const handleDeletePress = () => {
    console.log('루틴 삭제');
    setTitle('');
    setMemoText('');
  };
  const handleCompletePress = () => {
    console.log('루틴 완료');
  };

  return (
    <>
      {/* 메인 모달 */}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackground} onPress={onClose} />
          <View style={styles.modalContainer}>
            {/* 헤더 영역 */}
            <View style={styles.headerRow}>
              <View style={styles.colorCircle} />
              <View style={styles.headerTitleUnderline}>
                <TextInput
                  style={styles.headerTitleInput}
                  placeholder="일정 제목"
                  placeholderTextColor="#aaa"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* 하루종일 토글 */}
            <View style={styles.allDayRow}>
              <Ionicons name="time-outline" size={20} color="#333" style={{ marginRight: 8 }} />
              <Text style={styles.allDayLabel}>하루 종일</Text>
              <Switch
                style={{ marginLeft: 'auto' }}
                value={allDay}
                onValueChange={(val) => setAllDay(val)}
              />
            </View>

            {/* 날짜 영역 (중앙 정렬) */}
            <View style={styles.dateCenterRow}>
              <TouchableOpacity onPress={() => handlePressDateTime(true)}>
                <Text style={styles.dateText}>{formatDisplay(startDate)}</Text>
              </TouchableOpacity>
              <Text style={styles.arrowText}> → </Text>
              <TouchableOpacity onPress={() => handlePressDateTime(false)}>
                <Text style={styles.dateText}>{formatDisplay(endDate)}</Text>
              </TouchableOpacity>
            </View>

            {/* 시간 영역 (하루종일이 아닐 경우에만) */}
            {!allDay && (
              <View style={styles.timeCenterRow}>
                <TouchableOpacity onPress={() => handlePressDateTime(true)}>
                  <Text style={styles.timeText}>{startTime}</Text>
                </TouchableOpacity>
                <Text style={styles.arrowText}> → </Text>
                <TouchableOpacity onPress={() => handlePressDateTime(false)}>
                  <Text style={styles.timeText}>{endTime}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 반복 옵션 */}
            <TouchableOpacity
              style={styles.repeatContainer}
              onPress={() => setRepeatModalVisible(true)}
            >
              <Text style={styles.repeatText}>반복: {repeatOption}</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* 메뉴 항목들 */}
            <TouchableOpacity style={styles.menuItem} onPress={handleMemoPress}>
              <Ionicons name="document-text-outline" size={20} color="#333" style={styles.menuIcon} />
              <Text style={styles.menuLabel}>메모</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleAlarmPress}>
              <Ionicons name="notifications-outline" size={20} color="#333" style={styles.menuIcon} />
              <Text style={styles.menuLabel}>시간 알림</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleCopyPress}>
              <Ionicons name="sunny-outline" size={20} color="#333" style={styles.menuIcon} />
              <Text style={styles.menuLabel}>내일 하기 / 오늘로 붙여넣기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDeletePress}>
              <Ionicons name="trash-outline" size={20} color="#e53935" style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: '#e53935' }]}>루틴 삭제하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleCompletePress}>
              <Ionicons name="checkmark-done-outline" size={20} color="#333" style={styles.menuIcon} />
              <Text style={styles.menuLabel}>루틴 완료하기</Text>
            </TouchableOpacity>

            {/* 하단 버튼 */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>저장하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 날짜·시간 피커 모달 */}
      <Modal visible={dateTimePickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackground} onPress={() => setDateTimePickerVisible(false)} />
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerTitle}>
              {isPickingStart ? '시작' : '종료'} 날짜·시간 선택
            </Text>
            <View style={styles.pickerRow}>
              <Picker
                style={styles.picker}
                selectedValue={tempYear}
                onValueChange={(val) => setTempYear(val)}
              >
                {Array.from({ length: 11 }, (_, i) => i + 2020).map((y) => (
                  <Picker.Item key={y} label={`${y}년`} value={y} />
                ))}
              </Picker>
              <Picker
                style={styles.picker}
                selectedValue={tempMonth}
                onValueChange={(val) => setTempMonth(val)}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <Picker.Item key={m} label={`${m}월`} value={m} />
                ))}
              </Picker>
              <Picker
                style={styles.picker}
                selectedValue={tempDay}
                onValueChange={(val) => setTempDay(val)}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <Picker.Item key={d} label={`${d}일`} value={d} />
                ))}
              </Picker>
            </View>
            <View style={styles.timePickerRow}>
              <Picker
                style={styles.picker}
                selectedValue={tempHour}
                onValueChange={(val) => setTempHour(val)}
              >
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                  <Picker.Item key={h} label={`${h}시`} value={h} />
                ))}
              </Picker>
              <Picker
                style={styles.picker}
                selectedValue={tempMinute}
                onValueChange={(val) => setTempMinute(val)}
              >
                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                  <Picker.Item key={m} label={`${m}분`} value={m} />
                ))}
              </Picker>
            </View>
            <View style={styles.datePickerButtonRow}>
              <TouchableOpacity style={styles.datePickerButton} onPress={applyDateTime}>
                <Text style={styles.datePickerButtonText}>적용</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.datePickerButton, { backgroundColor: '#ccc' }]}
                onPress={() => setDateTimePickerVisible(false)}
              >
                <Text style={styles.datePickerButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 반복 옵션 모달 */}
      <Modal visible={repeatModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackground} onPress={() => setRepeatModalVisible(false)} />
          <View style={styles.repeatPickerContainer}>
            <Text style={styles.repeatPickerTitle}>반복 옵션 선택</Text>
            <Picker
              style={styles.picker}
              selectedValue={repeatOption}
              onValueChange={(val) => setRepeatOption(val)}
            >
              {repeatOptions.map((option, idx) => (
                <Picker.Item key={idx} label={option} value={option} />
              ))}
            </Picker>
            <View style={styles.repeatPickerButtonRow}>
              <TouchableOpacity
                style={styles.repeatPickerButton}
                onPress={() => setRepeatModalVisible(false)}
              >
                <Text style={styles.repeatPickerButtonText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 메모 입력 모달 */}
      <Modal visible={memoModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackground} onPress={() => setMemoModalVisible(false)} />
          <View style={styles.subModalContainer}>
            <Text style={styles.subModalTitle}>메모 입력</Text>
            <TextInput
              style={styles.memoInput}
              placeholder="메모를 입력하세요"
              placeholderTextColor="#aaa"
              value={memoText}
              onChangeText={setMemoText}
              multiline
            />
            <TouchableOpacity style={styles.subModalButton} onPress={() => setMemoModalVisible(false)}>
              <Text style={styles.subModalButtonText}>완료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 알림 설정 모달 */}
      <Modal visible={alarmModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackground} onPress={() => setAlarmModalVisible(false)} />
          <View style={styles.subModalContainer}>
            <Text style={styles.subModalTitle}>시간 알림 설정</Text>
            <View style={styles.timePickerRow}>
              <Picker
                style={styles.picker}
                selectedValue={parseInt(alarmTime.split(':')[0], 10)}
                onValueChange={(val) => {
                  const minutes = parseInt(alarmTime.split(':')[1], 10);
                  setAlarmTime(formatTime(val, minutes));
                }}
              >
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                  <Picker.Item key={h} label={`${h}시`} value={h} />
                ))}
              </Picker>
              <Picker
                style={styles.picker}
                selectedValue={parseInt(alarmTime.split(':')[1], 10)}
                onValueChange={(val) => {
                  const hour = parseInt(alarmTime.split(':')[0], 10);
                  setAlarmTime(formatTime(hour, val));
                }}
              >
                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                  <Picker.Item key={m} label={`${m}분`} value={m} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity style={styles.subModalButton} onPress={() => setAlarmModalVisible(false)}>
              <Text style={styles.subModalButtonText}>완료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AddScheduleModal;

const styles = StyleSheet.create({
  // 모달 전체 오버레이
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 터치 시 모달 닫힘을 위한 배경
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // 메인 모달 컨테이너
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ccc',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  headerTitleUnderline: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 2,
  },
  headerTitleInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  allDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  allDayLabel: {
    fontSize: 15,
    color: '#333',
  },
  dateCenterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeCenterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  arrowText: {
    marginHorizontal: 12,
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  repeatContainer: {
    marginVertical: 8,
  },
  repeatText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eaeaea',
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 6,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  // 날짜·시간 피커 모달 컨테이너
  datePickerContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  picker: {
    flex: 1,
  },
  datePickerButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  datePickerButton: {
    backgroundColor: '#5c6ef8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 8,
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  // 반복 옵션 모달
  repeatPickerContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  repeatPickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  repeatPickerButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  repeatPickerButton: {
    backgroundColor: '#5c6ef8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  repeatPickerButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  // 서브 모달 (메모, 알림)
  subModalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  subModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  memoInput: {
    height: 80,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    textAlignVertical: 'top',
    padding: 8,
    marginBottom: 12,
  },
  subModalButton: {
    backgroundColor: '#5c6ef8',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  subModalButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});