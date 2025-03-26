import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

// 루틴 추가 모달 Props
type AddScheduleModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { title: string; startDate: string; endDate: string }) => void;

  // 모달 열릴 때 기본으로 설정될 날짜 (예: "2025-03-10")
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
 * "2025-03-10" → "3월 10일 (월)" 형태로 변환
 */
function formatDisplay(dateString: string) {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-').map((n) => parseInt(n, 10));
  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay(); // 0=일,1=월,2=화,...
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return `${m}월 ${d}일 (${dayNames[dayOfWeek]})`;
}

const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  visible,
  onClose,
  onSave,
  defaultYear,
  defaultMonth,
  defaultDay,
}) => {
  // 루틴 제목
  const [title, setTitle] = useState('');

  // 시작/종료 날짜
  const [startDate, setStartDate] = useState(formatDate(defaultYear, defaultMonth, defaultDay));
  const [endDate, setEndDate] = useState(formatDate(defaultYear, defaultMonth, defaultDay));

  // "날짜 Picker" 모달 표시 여부 + 어떤 날짜(시작/종료)를 수정 중인지 구분
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [isPickingStart, setIsPickingStart] = useState(true);

  // Picker에서 선택 중인 연/월/일 임시 상태
  const [tempYear, setTempYear] = useState(defaultYear);
  const [tempMonth, setTempMonth] = useState(1);
  const [tempDay, setTempDay] = useState(1);

  // 모달이 열릴 때, 기본값 반영
  useEffect(() => {
    setTitle(''); // 모달 열릴 때마다 제목 초기화(원하면 유지해도 됨)
    setStartDate(formatDate(defaultYear, defaultMonth, defaultDay));
    setEndDate(formatDate(defaultYear, defaultMonth, defaultDay));
  }, [visible, defaultYear, defaultMonth, defaultDay]);

  /**
   * 날짜 텍스트를 누르면 → 날짜 Picker 모달 열기
   */
  const handlePressDate = (isStart: boolean) => {
    setIsPickingStart(isStart);

    // 기존 날짜를 임시 Picker 값에 반영
    const dateString = isStart ? startDate : endDate;
    const [y, m, d] = dateString.split('-').map((n) => parseInt(n, 10));
    setTempYear(y);
    setTempMonth(m);
    setTempDay(d);

    setDatePickerVisible(true);
  };

  /**
   * 날짜 Picker "적용" 버튼
   */
  const applyDate = () => {
    const newDate = formatDate(tempYear, tempMonth, tempDay);
    if (isPickingStart) {
      setStartDate(newDate);
    } else {
      setEndDate(newDate);
    }
    setDatePickerVisible(false);
  };

  /**
   * "저장하기" 버튼
   */
  const handleSave = () => {
    onSave({
      title,
      startDate,
      endDate,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* 모달 바깥 영역 클릭 시 닫힘 */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* 모달 실제 내용 영역 (터치 이벤트 전파 방지) */}
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          {/* 상단: 색상 원 + "일정 제목" TextInput */}
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

          {/* 시작 날짜 - 종료 날짜 (터치 시 Picker 모달) */}
          <View style={styles.dateRow}>
            <Text style={styles.dateText} onPress={() => handlePressDate(true)}>
              {formatDisplay(startDate)}
            </Text>
            <Text style={styles.dash}> - </Text>
            <Text style={styles.dateText} onPress={() => handlePressDate(false)}>
              {formatDisplay(endDate)}
            </Text>
          </View>

          {/* 반복 문구 */}
          <Text style={styles.repeatText}>매주 월 마다</Text>

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 메뉴 아이템들: UI만 */}
          <View style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={20} color="#333" style={styles.menuIcon} />
            <Text style={styles.menuLabel}>메모</Text>
          </View>
          <View style={styles.menuItem}>
            <Ionicons name="time-outline" size={20} color="#333" style={styles.menuIcon} />
            <Text style={styles.menuLabel}>시간 알림</Text>
          </View>
          <View style={styles.menuItem}>
            <Ionicons name="sunny-outline" size={20} color="#333" style={styles.menuIcon} />
            <Text style={styles.menuLabel}>내일 하기   오늘로 붙여넣기</Text>
          </View>
          <View style={styles.menuItem}>
            <Ionicons name="trash-outline" size={20} color="#e53935" style={styles.menuIcon} />
            <Text style={[styles.menuLabel, { color: '#e53935' }]}>루틴 삭제하기</Text>
          </View>
          <View style={styles.menuItem}>
            <Ionicons name="checkmark-done-outline" size={20} color="#333" style={styles.menuIcon} />
            <Text style={styles.menuLabel}>루틴 완료하기</Text>
          </View>

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
      </Pressable>

      {/* 날짜 Picker 모달 */}
      <Modal visible={datePickerVisible} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setDatePickerVisible(false)}>
          <View style={styles.datePickerContainer} onStartShouldSetResponder={() => true}>
            <Text style={styles.datePickerTitle}>
              {isPickingStart ? '시작 날짜' : '종료 날짜'} 선택
            </Text>

            {/* 연/월/일 Picker (간단 예시) */}
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

            <View style={styles.datePickerButtonRow}>
              <TouchableOpacity style={styles.datePickerButton} onPress={applyDate}>
                <Text style={styles.datePickerButtonText}>적용</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.datePickerButton, { backgroundColor: '#ccc' }]}
                onPress={() => setDatePickerVisible(false)}
              >
                <Text style={styles.datePickerButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
};

export default AddScheduleModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    // 모달 밖 클릭 시 닫힘
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    width: '70%',
    padding: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 0,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 15,
    color: '#333',
  },
  dash: {
    marginHorizontal: 6,
    fontSize: 16,
    color: '#333',
  },
  repeatText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#eaeaea',
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
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

  // 날짜 Picker 모달
  datePickerContainer: {
    width: '75%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
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
  picker: {
    flex: 1,
  },
  datePickerButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  datePickerButton: {
    backgroundColor: '#5c6ef8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});